import "reflect-metadata"
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import CreateBankService from '@modules/banks/services/CreateBankService';
import User from '@modules/users/infra/typeorm/entities/User';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';

let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

let bank: Bank;
let user: User;

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
    createAccount = new CreateAccountService();

    bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91'
    });

    user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456'
    });
  });

  it('should be able to create a new account.', async () => {
    const account = await createAccount.execute({
      user_id: user.id,
      bank_id: bank.id
    });

    expect(account).toHaveProperty('id');
  });

  it('should not be able to create a new account for a user that already has one.', async () => {
    const account = await createAccount.execute({
      user_id: user.id,
      bank_id: bank.id
    });

    expect(account).toHaveProperty('id');

    await expect(
      createAccount.execute({
        user_id: user.id,
        bank_id: bank.id
      })
    ).rejects.toMatchObject(
      new AppError('Only one account per user permitted.', 403)
    );
  });

  it('should not be able to create a new account with an invalid bank id.', async () => {
    const fakeId = '05766d27-f634-45ea-ac82-eb53ae5d67fe'

    await expect(
      createAccount.execute({
        user_id: user.id,
        bank_id: fakeId
      })
    ).rejects.toMatchObject(
      new AppError('No bank found for given bank id.', 404)
    );
  });

  it('should not be able to create a new account with an invalid user id.', async () => {
    const fakeId = '05766d27-f634-45ea-ac82-eb53ae5d67fe'

    await expect(
      createAccount.execute({
        user_id: fakeId,
        bank_id: bank.id
      })
    ).rejects.toMatchObject(
      new AppError('No user found for given user id.', 404)
    );
  });
});
