import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import FakeBanksRepository from '@modules/banks/repositories/fakes/FakeBanksRepository';
import BankDepositService from '@modules/banks/services/BankDepositService';
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
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

let account: any;

describe('BankDepositService', () => {
  beforeEach(() => {
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
  });

  beforeEach(async () => {
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
  })

  it('should be able to deposit to the account.', async () => {
    const initialBalance = 0

    expect(account.balance).toBe(initialBalance);

    const valueToBeAdded = 100.5

    const { updatedAccount, transaction } = await bankDeposit.execute({
      account_id: account.id,
      value: valueToBeAdded
    })

    const transactionCost = 0
    const depositPercentageBonus = 0.5
    const bonusValue = valueToBeAdded * (depositPercentageBonus/100)
    const valueWithBonus = valueToBeAdded + bonusValue

    const expectedTransactionIsValid = isTransactionEquals(
      transaction, account.id, account.id, TransactionType.DEPOSIT,
      valueToBeAdded, bonusValue, transactionCost
    )

    expect(transaction).toHaveProperty('id');
    expect(expectedTransactionIsValid).toBeTruthy();
    expect(updatedAccount.balance).toBe(valueWithBonus);
  });

  it('should not be able to deposit to an account with invalid account_id.', async () => {
    const valueToDeposit = 100.5

    await expect(
      bankDeposit.execute({
        account_id: '111',
        value: valueToDeposit
      })
    ).rejects.toMatchObject(
      new AppError('No account found with the given account_id.', 404)
    );
  });

  it('should not be able to deposit a value that is not greater than zero to an account.', async () => {
    await expect(
      bankDeposit.execute({
        account_id: account.id,
        value: 0
      })
    ).rejects.toMatchObject(
      new AppError('Deposit value must be greater than zero.')
    );

    await expect(
      bankDeposit.execute({
        account_id: account.id,
        value: -1
      })
    ).rejects.toMatchObject(
      new AppError('Deposit value must be greater than zero.')
    );
  });
});
