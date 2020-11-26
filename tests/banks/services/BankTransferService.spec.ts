/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import GetAccountByIdService from '@modules/accounts/services/GetAccountByIdService';
import BankDepositService from '@modules/banks/services/BankDepositService';
import BankTransferService from '@modules/banks/services/BankTransferService';
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

let getAccountById: GetAccountByIdService;
let bankDeposit: BankDepositService;
let bankTransfer: BankTransferService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

let accountWithDeposit: Account;
let otherAccount: Account;

describe('BankTransferService', () => {
  const valueDeposited = 500;

  beforeAll(async () => {
    await createConnections();
  });

  afterAll(async () => {
    const connection = await getConnection();
    await connection.close();
  });

  // Creates two accounts and deposits 500 in one of them
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
    getAccountById = new GetAccountByIdService(accountsRepository);
    bankDeposit = new BankDepositService(transactionsRepository);
    bankTransfer = new BankTransferService(transactionsRepository);

    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91',
    });

    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    const otherUser = await createUser.execute({
      name: 'Jader Freitas',
      cpf: '659.351.910-32',
      password: '123456',
    });

    accountWithDeposit = await createAccount.execute({
      user_id: user.id,
      bank_id: bank.id,
    });

    otherAccount = await createAccount.execute({
      user_id: otherUser.id,
      bank_id: bank.id,
    });

    const depositResponse = await bankDeposit.execute({
      account_id: accountWithDeposit.id,
      value: valueDeposited,
    });

    accountWithDeposit = depositResponse.updatedAccount;
  });

  it('should be able to transfer from the account.', async () => {
    const bonusValue = 0;
    const transactionCost = 0;
    const valueToTransfer = 100.5;
    const accountBalanceAfterTransfer =
      accountWithDeposit.balance - valueToTransfer;
    const otherAccountBalanceAfterTransfer =
      otherAccount.balance + valueToTransfer;

    const transferResponse = await bankTransfer.execute({
      from_account_id: accountWithDeposit.id,
      to_account_id: otherAccount.id,
      value: valueToTransfer,
    });

    const accountAfterTransfer = transferResponse.updatedAccount;
    const transferTransaction = transferResponse.transaction;

    const otherAccountAfterTransfer = await getAccountById.execute({
      id: otherAccount.id,
    });

    const expectedTransactionIsValid = isTransactionEquals(
      transferTransaction,
      accountWithDeposit.id,
      otherAccount.id,
      TransactionType.TRANSFER,
      valueToTransfer,
      bonusValue,
      transactionCost,
    );

    expect(transferTransaction).toHaveProperty('id');
    expect(expectedTransactionIsValid).toBeTruthy();
    expect(accountAfterTransfer.balance).toBe(accountBalanceAfterTransfer);
    expect(otherAccountAfterTransfer.balance).toBe(
      otherAccountBalanceAfterTransfer,
    );
  });

  it('should not be able to transfer to own account.', async () => {
    const valueToTransfer = 100.5;

    await expect(
      bankTransfer.execute({
        from_account_id: accountWithDeposit.id,
        to_account_id: accountWithDeposit.id,
        value: valueToTransfer,
      }),
    ).rejects.toMatchObject(
      new AppError('Cannnot make a transfer to you own account.'),
    );
  });

  it('should not be able to transfer to a nonexisting account', async () => {
    const valueToTransfer = 100.5;

    await expect(
      bankTransfer.execute({
        from_account_id: accountWithDeposit.id,
        to_account_id: '05766d27-f634-45ea-ac82-eb53ae5d67fe',
        value: valueToTransfer,
      }),
    ).rejects.toMatchObject(
      new AppError('Cannot transfer to a nonexisting account.', 404),
    );
  });

  it('should not be able to transfer from a nonexisting account', async () => {
    const valueToTransfer = 100.5;

    await expect(
      bankTransfer.execute({
        from_account_id: '05766d27-f634-45ea-ac82-eb53ae5d67fe',
        to_account_id: accountWithDeposit.id,
        value: valueToTransfer,
      }),
    ).rejects.toMatchObject(
      new AppError('Cannot transfer from a nonexisting account.', 404),
    );
  });

  it('should not be able to transfer a value that is not greater than zero.', async () => {
    const valueZeroToTransfer = 0;

    await expect(
      bankTransfer.execute({
        from_account_id: accountWithDeposit.id,
        to_account_id: otherAccount.id,
        value: valueZeroToTransfer,
      }),
    ).rejects.toMatchObject(
      new AppError('Transfer value must be greater than zero.'),
    );

    const negativeValueToTransfer = -100;

    await expect(
      bankTransfer.execute({
        from_account_id: accountWithDeposit.id,
        to_account_id: otherAccount.id,
        value: negativeValueToTransfer,
      }),
    ).rejects.toMatchObject(
      new AppError('Transfer value must be greater than zero.'),
    );
  });

  it('should not be able to transfer a value greater than the balance of who is transfering.', async () => {
    const valueToTransfer = 20;

    await expect(
      bankTransfer.execute({
        from_account_id: otherAccount.id,
        to_account_id: accountWithDeposit.id,
        value: valueToTransfer,
      }),
    ).rejects.toMatchObject(
      new AppError(
        `Insufficient balance. The account's current balance is R$ ${otherAccount.balance.toFixed(
          2,
        )}.`,
      ),
    );
  });
});
