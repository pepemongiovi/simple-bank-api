/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import UpdateAccountBalanceService from '@modules/accounts/services/UpdateAccountBalanceService';
import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import CreateBankService from '@modules/banks/services/CreateBankService';
import User from '@modules/users/infra/typeorm/entities/User';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';
import BCryptHashProvider from '@modules/users/providers/HashProvider/implementations/BCryptHashProvider';

let updateAccountBalance: UpdateAccountBalanceService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

let bank: Bank;
let user: User;
let account: Account;

describe('UpdateAccountBalance', () => {
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
    updateAccountBalance = new UpdateAccountBalanceService(accountsRepository);

    bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91',
    });

    user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    account = await createAccount.execute({
      user_id: user.id,
      bank_id: bank.id,
    });
  });

  it("should be able to update the account's balance.", async () => {
    expect(account.balance).toBe(0);

    const newBalance = 1000.5;

    const updatedAccount = await updateAccountBalance.execute({
      balance: newBalance,
      account_id: account.id,
    });

    expect(updatedAccount.balance).toBe(newBalance);
  });

  it("should not be able to update the account's with an invalid account id.", async () => {
    const newBalance = 100;
    const fakeId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    await expect(
      updateAccountBalance.execute({
        balance: newBalance,
        account_id: fakeId,
      }),
    ).rejects.toMatchObject(
      new AppError('No account found for given id.', 404),
    );
  });

  it("should not be able to update the account's with an negative balance.", async () => {
    const newBalance = -1000.5;

    await expect(
      updateAccountBalance.execute({
        balance: newBalance,
        account_id: account.id,
      }),
    ).rejects.toMatchObject(
      new AppError("New balance can't have a negative value."),
    );
  });
});
