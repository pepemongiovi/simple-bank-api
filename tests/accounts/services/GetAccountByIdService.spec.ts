import "reflect-metadata"
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import GetAccountByIdService from '@modules/accounts/services/GetAccountByIdService';
import CreateBankService from '@modules/banks/services/CreateBankService';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';

let getAccountById: GetAccountByIdService
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

describe('CreateAccount', () => {
  beforeAll(async() => {
    await createConnections()
  })

  afterAll(async() => {
    const connection = await getConnection()
    await connection.close()
  })

  beforeEach(async () => {
    await clearDb()

    createUser = new CreateUserService();
    createBank = new CreateBankService();
    getAccountById = new GetAccountByIdService()
    createAccount = new CreateAccountService();
  });

  it('should be able to get a account.', async () => {
    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91'
    });

    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456'
    });

    const account = await createAccount.execute({
      user_id: user.id,
      bank_id: bank.id
    });

    const getedAccount = getAccountById.execute({
      id: account.id
    })

    expect(account).toMatchObject(getedAccount)
  });

  it('should not be able to get a account with a not existing id.', async () => {
    await expect(
      getAccountById.execute({
        id: '05766d27-f634-45ea-ac82-eb53ae5d67fe'
      })
    ).rejects.toMatchObject(
      new AppError('No account found for given id.', 404)
    );
  });
});
