/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import BankDepositService from '@modules/banks/services/BankDepositService';
import BankWithdrawService from '@modules/banks/services/BankWithdrawService';
import CreateBankService from '@modules/banks/services/CreateBankService';
import { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb, isTransactionEquals } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';
import TransactionsRepository from '@modules/transactions/infra/typeorm/repositories/TransactionsRepository';
import BCryptHashProvider from '@modules/users/providers/HashProvider/implementations/BCryptHashProvider';

let bankDeposit: BankDepositService;
let bankWithdraw: BankWithdrawService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

let account: Account;

// Creates bank, user, account and deposits 500
describe('BankWithdrawService', () => {
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
    const transactionsRepository = new TransactionsRepository();
    const hasProvider = new BCryptHashProvider();

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
    bankDeposit = new BankDepositService(transactionsRepository);
    bankWithdraw = new BankWithdrawService(transactionsRepository);

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

    const valueToBeAdded = 500;

    const depositResponse = await bankDeposit.execute({
      account_id: account.id,
      value: valueToBeAdded,
    });

    account = depositResponse.updatedAccount;
  });

  it('should be able to withdraw from the account.', async () => {
    const valueToWithdraw = 110;

    const withdrawResponse = await bankWithdraw.execute({
      account_id: account.id,
      value: valueToWithdraw,
    });

    const accountAfterWithdraw = withdrawResponse.updatedAccount;
    const withdrawTransaction = withdrawResponse.transaction;

    const bonusValue = 0;
    // eslint-disable-next-line radix
    const withdrawPercentageCost: number = parseInt(
      process.env.WITHDRAW_PERCENTAGE_COST || '1',
    );
    const transactionCost = valueToWithdraw * (withdrawPercentageCost / 100);
    const newAccountBalance =
      account.balance - valueToWithdraw - transactionCost;

    const expectedTransactionIsValid = isTransactionEquals(
      withdrawTransaction,
      account.id,
      account.id,
      TransactionType.WITHDRAW,
      valueToWithdraw,
      bonusValue,
      transactionCost,
    );

    expect(withdrawTransaction).toHaveProperty('id');
    expect(expectedTransactionIsValid).toBeTruthy();
    expect(accountAfterWithdraw.balance).toBe(newAccountBalance);
  });

  it('should not be able to withdraw to an account with invalid account_id.', async () => {
    const valueToWithdraw = 100.5;

    await expect(
      bankWithdraw.execute({
        account_id: '05766d27-f634-45ea-ac82-eb53ae5d67fe',
        value: valueToWithdraw,
      }),
    ).rejects.toMatchObject(
      new AppError('No account found with the given account_id.', 404),
    );
  });

  it("should not be able to withdraw a value that is greater than the account's balance.", async () => {
    const valueToBeWithdrawn = 2000;

    await expect(
      bankWithdraw.execute({
        account_id: account.id,
        value: valueToBeWithdrawn,
      }),
    ).rejects.toMatchObject(
      new AppError(
        `Insufficient balance. The account's current balance is R$ ${account.balance.toFixed(
          2,
        )}. Remember a cost of 1% of the value withdrawn is charged.`,
      ),
    );
  });

  it('should not be able to withdraw if balance is less than the value + withdraw cost', async () => {
    const valueToWithdraw = account.balance;

    await expect(
      bankWithdraw.execute({
        account_id: account.id,
        value: valueToWithdraw,
      }),
    ).rejects.toMatchObject(
      new AppError(
        `Insufficient balance. The account's current balance is R$ ${account.balance.toFixed(
          2,
        )}. Remember a cost of 1% of the value withdrawn is charged.`,
      ),
    );
  });

  it('should not be able to withdraw a value that is not greater than zero.', async () => {
    const valueZeroToBeWithdrawn = 0;
    const negativeToBeWithdrawn = -100;

    await expect(
      bankWithdraw.execute({
        account_id: account.id,
        value: valueZeroToBeWithdrawn,
      }),
    ).rejects.toMatchObject(
      new AppError('Withdraw value must be greater than zero.'),
    );

    await expect(
      bankWithdraw.execute({
        account_id: account.id,
        value: negativeToBeWithdrawn,
      }),
    ).rejects.toMatchObject(
      new AppError('Withdraw value must be greater than zero.'),
    );
  });
});
