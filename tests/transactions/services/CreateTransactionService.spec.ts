/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import CreateBankService from '@modules/banks/services/CreateBankService';
import { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import CreateTransactionService from '@modules/transactions/services/CreateTransactionService';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';
import BCryptHashProvider from '@modules/users/providers/HashProvider/implementations/BCryptHashProvider';
import TransactionsRepository from '@modules/transactions/infra/typeorm/repositories/TransactionsRepository';

let createTransaction: CreateTransactionService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

let account: Account;

describe('CreateTransaction', () => {
  beforeAll(async () => {
    await createConnections();
  });

  afterAll(async () => {
    const connection = await getConnection();
    await connection.close();
  });

  beforeEach(async () => {
    await clearDb();

    const userRepository = new UsersRepository();
    const banksRepository = new BanksRepository();
    const accountsRepository = new AccountsRepository();
    const hasProvider = new BCryptHashProvider();
    const transactionsRepository = new TransactionsRepository();

    createAccount = new CreateAccountService(
      userRepository,
      banksRepository,
      accountsRepository,
    );

    createUser = new CreateUserService(
      hasProvider,
      userRepository
    );
    createBank = new CreateBankService(banksRepository);
    createTransaction = new CreateTransactionService(
      transactionsRepository,
      accountsRepository,
    );

    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91',
    });

    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    account = await createAccount.execute({
      user_id: user.id,
      bank_id: bank.id,
    });
  });

  it('should be able to create a new deposit transaction.', async () => {
    const type = TransactionType.DEPOSIT;
    const value = 100;
    const bonusValue = value * 0.005;
    const transactionCost = 0;

    const transaction = await createTransaction.execute({
      from_account_id: account.id,
      to_account_id: account.id,
      value,
      type,
      bonusValue,
      transactionCost,
    });

    expect(transaction).toHaveProperty('id');
  });

  it('should not be able to create a new deposit transaction with a invalid value.', async () => {
    const type = TransactionType.DEPOSIT;
    const invalidValue = -20;
    const bonusValue = invalidValue * 0.005;
    const transactionCost = 0;

    await expect(
      createTransaction.execute({
        from_account_id: account.id,
        to_account_id: account.id,
        value: invalidValue,
        type,
        bonusValue,
        transactionCost,
      }),
    ).rejects.toMatchObject(
      new AppError('Transaction value must be greater than zero.'),
    );
  });

  it('should not be able to create a new deposit transaction with a invalid bonus value.', async () => {
    const type = TransactionType.DEPOSIT;
    const value = 200;
    const invalidBonusValue = -20;
    const transactionCost = 0;

    await expect(
      createTransaction.execute({
        from_account_id: account.id,
        to_account_id: account.id,
        value,
        type,
        bonusValue: invalidBonusValue,
        transactionCost,
      }),
    ).rejects.toMatchObject(
      new AppError('Transaction bonus value must not be negative.'),
    );
  });

  it('should not be able to create a new deposit transaction with a invalid transaction cost.', async () => {
    const type = TransactionType.DEPOSIT;
    const value = 200;
    const bonusValue = value * 0.005;
    const invalidTransactionCost = -20;

    await expect(
      createTransaction.execute({
        from_account_id: account.id,
        to_account_id: account.id,
        value,
        type,
        bonusValue,
        transactionCost: invalidTransactionCost,
      }),
    ).rejects.toMatchObject(
      new AppError('Transaction cost must be greater than zero.'),
    );
  });

  it('should not be able to create a new deposit transaction with a invalid account id.', async () => {
    const type = TransactionType.DEPOSIT;
    const value = 100;
    const bonusValue = value * 0.005;
    const transactionCost = 0;

    await expect(
      createTransaction.execute({
        from_account_id: '05766d27-f634-45ea-ac82-eb53ae5d67fe',
        to_account_id: account.id,
        value,
        type,
        bonusValue,
        transactionCost,
      }),
    ).rejects.toMatchObject(
      new AppError('No account found for given from_account_id.', 404),
    );

    await expect(
      createTransaction.execute({
        from_account_id: account.id,
        to_account_id: '05766d27-f634-45ea-ac82-eb53ae5d67fe',
        value,
        type,
        bonusValue,
        transactionCost,
      }),
    ).rejects.toMatchObject(
      new AppError('No account found for given to_account_id.', 404),
    );
  });
});
