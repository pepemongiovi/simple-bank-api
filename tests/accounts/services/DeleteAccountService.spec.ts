/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import AppError from '@shared/errors/AppError';
import CreateBankService from '@modules/banks/services/CreateBankService';
import CreateUserService from '@modules/users/services/CreateUserService';
import DeleteAccountService from '@modules/accounts/services/DeleteAccountService';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import AccountsRepository from '@modules/accounts/infra/typeorm/repositories/AccountsRepository';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';
import BCryptHashProvider from '@modules/users/providers/HashProvider/implementations/BCryptHashProvider';

let deleteAccount: DeleteAccountService;
let createUser: CreateUserService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;

describe('DeleteAccount', () => {
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
    deleteAccount = new DeleteAccountService(accountsRepository);
  });

  it('should be able to delete a existing account.', async () => {
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

    expect(account).toHaveProperty('id');

    const result = await deleteAccount.execute({
      id: account.id,
    });

    expect(result).toBe('Account deleted!');
  });

  it('should not be able to delete with an invalid id.', async () => {
    const fakeAccountId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    await expect(
      deleteAccount.execute({
        id: fakeAccountId,
      }),
    ).rejects.toMatchObject(
      new AppError('No account found with the given id.', 404),
    );
  });
});
