import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import FakeBanksRepository from '@modules/banks/repositories/fakes/FakeBanksRepository';
import CreateBankService from '@modules/banks/services/CreateBankService';
import User from '@modules/users/infra/typeorm/entities/User';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';


let fakeAccountsRepository: FakeAccountsRepository;
let fakeUsersRepository: FakeUsersRepository;
let fakeBanksRepository: FakeBanksRepository;
let fakeHashProvider: FakeHashProvider;

let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

let bank: Bank;
let user: User;

describe('CreateAccount', () => {
  beforeEach(async () => {
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
    const fakeId = '111'

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
    const fakeId = '111'

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
