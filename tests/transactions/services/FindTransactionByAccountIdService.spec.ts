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
import FindTransactionsByAccountIdService from '@modules/transactions/services/FindTransactionsByAccountIdService';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';
import BCryptHashProvider from '@modules/users/providers/HashProvider/implementations/BCryptHashProvider';
import TransactionsRepository from '@modules/transactions/infra/typeorm/repositories/TransactionsRepository';

let createTransaction: CreateTransactionService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;
let findTransactionsByAccountId: FindTransactionsByAccountIdService;

let account: Account;

describe('FindTransactionByAccountId', () => {
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
    findTransactionsByAccountId = new FindTransactionsByAccountIdService(
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

    const transaction1 = await createTransaction.execute({
      from_account_id: account.id,
      to_account_id: account.id,
      value,
      type,
      bonusValue,
      transactionCost,
    });

    const transaction2 = await createTransaction.execute({
      from_account_id: account.id,
      to_account_id: account.id,
      value,
      type,
      bonusValue,
      transactionCost,
    });

    const expectedTransactions = [transaction1, transaction2];

    const transactions: any = await findTransactionsByAccountId.execute({
      account_id: account.id,
    });

    expect(transactions).toMatchObject(expectedTransactions);
  });

  it('should not be able to find transactions with an invalid account id.', async () => {
    const fakeId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    await expect(
      findTransactionsByAccountId.execute({
        account_id: fakeId,
      }),
    ).rejects.toMatchObject(
      new AppError('No account found for given account id.', 404),
    );
  });
});
