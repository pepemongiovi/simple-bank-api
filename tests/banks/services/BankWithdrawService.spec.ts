import Account from '@modules/accounts/infra/typeorm/entities/Account';
import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import FakeBanksRepository from '@modules/banks/repositories/fakes/FakeBanksRepository';
import BankDepositService from '@modules/banks/services/BankDepositService';
import BankWithdrawService from '@modules/banks/services/BankWithdrawService';
import CreateBankService from '@modules/banks/services/CreateBankService';
import Transaction, { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import FakeTransactionsRepository from '@modules/transactions/repositories/fakes/FakeTransactionsRepository';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { isTransactionEquals } from '@shared/helpers/helper';

let fakeTransactionsRepository: FakeTransactionsRepository;
let fakeAccountsRepository: FakeAccountsRepository;
let fakeUsersRepository: FakeUsersRepository;
let fakeBanksRepository: FakeBanksRepository;
let fakeHashProvider: FakeHashProvider;

let bankDeposit: BankDepositService;
let bankWithdraw: BankWithdrawService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

let account: Account;

//Creates bank, user, account and deposits 500
describe('BankWithdrawService', () => {
  beforeEach(async() => {
    fakeTransactionsRepository = new FakeTransactionsRepository();
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeBanksRepository = new FakeBanksRepository();
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();

    createUser = new CreateUserService(
      fakeUsersRepository,
      fakeHashProvider
    );
    createBank = new CreateBankService(
      fakeBanksRepository
    );
    createAccount = new CreateAccountService(
      fakeAccountsRepository,
      fakeBanksRepository,
      fakeUsersRepository
    );
    bankDeposit = new BankDepositService(
      fakeAccountsRepository,
      fakeTransactionsRepository
    )
    bankWithdraw = new BankWithdrawService(
      fakeAccountsRepository,
      fakeTransactionsRepository
    )

    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91'
    });

    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456'
    });

    account = await createAccount.execute({
      user_id: user.id,
      bank_id: bank.id
    });

    const valueToBeAdded = 500

    const depositResponse = await bankDeposit.execute({
      account_id: account.id,
      value: valueToBeAdded
    })

    account = depositResponse.updatedAccount
  });

  it('should be able to withdraw from the account.', async () => {
    const valueToWithdraw = 110

    const withdrawResponse = await bankWithdraw.execute({
      account_id: account.id,
      value: valueToWithdraw
    })

    const accountAfterWithdraw = withdrawResponse.updatedAccount
    const withdrawTransaction = withdrawResponse.transaction

    const bonusValue = 0
    const withdrawPercentageCost = 1
    const transactionCost = valueToWithdraw * (withdrawPercentageCost/100)
    const newAccountBalance = account.balance - valueToWithdraw - transactionCost

    const expectedTransactionIsValid = isTransactionEquals(
      withdrawTransaction, account.id, account.id, TransactionType.WITHDRAW,
      valueToWithdraw, bonusValue, transactionCost
    )

    expect(withdrawTransaction).toHaveProperty('id');
    expect(expectedTransactionIsValid).toBeTruthy();
    expect(accountAfterWithdraw.balance).toBe(newAccountBalance);
  });

  it('should not be able to withdraw to an account with invalid account_id.', async () => {
    const valueToWithdraw = 100.5

    await expect(
      bankWithdraw.execute({
        account_id: '111',
        value: valueToWithdraw
      })
    ).rejects.toMatchObject(
      new AppError('No account found with the given account_id.', 404)
    );
  });

  it("should not be able to withdraw a value that is greater than the account's balance.", async () => {
    const valueToBeWithdrawn = 2000

    await expect(
      bankWithdraw.execute({
        account_id: account.id,
        value: valueToBeWithdrawn
      })
    ).rejects.toMatchObject(
      new AppError(
        `Insufficient balance. The account's current balance is R$ ${account.balance.toFixed(2)}. Remember a cost of 1% of the value withdrawn is charged.`
      )
    );
  });

  it("should not be able to withdraw if balance is less than the value + withdraw cost", async () => {
    const valueToWithdraw = account.balance

    await expect(bankWithdraw.execute({
        account_id: account.id,
        value: valueToWithdraw
      })
    ).rejects.toMatchObject(
      new AppError(
        `Insufficient balance. The account's current balance is R$ ${account.balance.toFixed(2)}. Remember a cost of 1% of the value withdrawn is charged.`
      )
    )
  });

  it("should not be able to withdraw a value that is not greater than zero.", async () => {
    const valueZeroToBeWithdrawn = 0
    const negativeToBeWithdrawn = -100

    await expect(
      bankWithdraw.execute({
        account_id: account.id,
        value: valueZeroToBeWithdrawn
      })
    ).rejects.toMatchObject(
      new AppError('Withdraw value must be greater than zero.')
    );

    await expect(
      bankWithdraw.execute({
        account_id: account.id,
        value: negativeToBeWithdrawn
      })
    ).rejects.toMatchObject(
      new AppError('Withdraw value must be greater than zero.')
    );
  });
});
