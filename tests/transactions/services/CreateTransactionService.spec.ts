import Account from '@modules/accounts/infra/typeorm/entities/Account';
import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import FakeBanksRepository from '@modules/banks/repositories/fakes/FakeBanksRepository';
import CreateBankService from '@modules/banks/services/CreateBankService';
import { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import FakeTransactionsRepository from '@modules/transactions/repositories/fakes/FakeTransactionsRepository';
import CreateTransactionService from '@modules/transactions/services/CreateTransactionService';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';

let fakeTransactionsRepository: FakeTransactionsRepository;
let fakeAccountsRepository: FakeAccountsRepository;
let fakeUsersRepository: FakeUsersRepository;
let fakeBanksRepository: FakeBanksRepository;
let fakeHashProvider: FakeHashProvider;

let createTransaction: CreateTransactionService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

let account: Account

describe('CreateTransaction', () => {
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
    createTransaction = new CreateTransactionService(
      fakeTransactionsRepository,
      fakeAccountsRepository
    );

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
  });

  it('should be able to create a new deposit transaction.', async () => {
    const type = TransactionType.DEPOSIT
    const value = 100
    const bonusValue = value * 0.005
    const transactionCost = 0

    const transaction = await createTransaction.execute({
      from_account_id: account.id,
      to_account_id: account.id,
      value,
      type,
      bonusValue,
      transactionCost
    });

    expect(transaction).toHaveProperty('id');
  });

  it('should not be able to create a new deposit transaction with a invalid value.', async () => {
    const type = TransactionType.DEPOSIT
    const invalidValue = -20
    const bonusValue = invalidValue * 0.005
    const transactionCost = 0

    await expect(createTransaction.execute({
      from_account_id: account.id,
      to_account_id: account.id,
      value: invalidValue,
      type,
      bonusValue,
      transactionCost
    })).rejects.toMatchObject(
      new AppError('Transaction value must be greater than zero.')
    )
  });

  it('should not be able to create a new deposit transaction with a invalid bonus value.', async () => {
    const type = TransactionType.DEPOSIT
    const value = 200
    const invalidBonusValue = -20
    const transactionCost = 0

    await expect(createTransaction.execute({
      from_account_id: account.id,
      to_account_id: account.id,
      value,
      type,
      bonusValue: invalidBonusValue,
      transactionCost
    })).rejects.toMatchObject(
      new AppError('Transaction bonus value must not be negative.')
    )
  });

  it('should not be able to create a new deposit transaction with a invalid transaction cost.', async () => {
    const type = TransactionType.DEPOSIT
    const value = 200
    const bonusValue = value * 0.005
    const invalidTransactionCost = -20

    await expect(createTransaction.execute({
      from_account_id: account.id,
      to_account_id: account.id,
      value,
      type,
      bonusValue,
      transactionCost: invalidTransactionCost
    })).rejects.toMatchObject(
      new AppError('Transaction cost must be greater than zero.')
    )
  });

  it('should not be able to create a new deposit transaction with a invalid account id.', async () => {
    const type = TransactionType.DEPOSIT
    const value = 100
    const bonusValue = value * 0.005
    const transactionCost = 0

    await expect(createTransaction.execute({
      from_account_id: '111',
      to_account_id: account.id,
      value,
      type,
      bonusValue,
      transactionCost
    })).rejects.toMatchObject(
      new AppError('No account found for given from_account_id.', 404)
    )

    await expect(createTransaction.execute({
      from_account_id: account.id,
      to_account_id: '111',
      value,
      type,
      bonusValue,
      transactionCost
    })).rejects.toMatchObject(
      new AppError('No account found for given to_account_id.', 404)
    )
  });
});
