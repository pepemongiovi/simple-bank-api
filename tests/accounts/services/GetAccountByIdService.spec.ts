/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import GetAccountByIdService from '@modules/accounts/services/GetAccountByIdService';
import CreateBankService from '@modules/banks/services/CreateBankService';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';
import BCryptHashProvider from '@modules/users/providers/HashProvider/implementations/BCryptHashProvider';

let getAccountById: GetAccountByIdService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

describe('CreateAccount', () => {
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
    getAccountById = new GetAccountByIdService(accountsRepository);
  });

  it('should be able to get a account.', async () => {
    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91',
    });

    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    const account = await createAccount.execute({
      user_id: user.id,
      bank_id: bank.id,
    });

    const getedAccount = getAccountById.execute({
      id: account.id,
    });

    expect(account).toMatchObject(getedAccount);
  });

  it('should not be able to get a account with a not existing id.', async () => {
    await expect(
      getAccountById.execute({
        id: '05766d27-f634-45ea-ac82-eb53ae5d67fe',
      }),
    ).rejects.toMatchObject(
      new AppError('No account found for given id.', 404),
    );
  });
});
