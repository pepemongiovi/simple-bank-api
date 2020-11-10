import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import GetAccountByIdService from '@modules/accounts/services/GetAccountByIdService';
import FakeBanksRepository from '@modules/banks/repositories/fakes/FakeBanksRepository';
import CreateBankService from '@modules/banks/services/CreateBankService';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';

let fakeAccountsRepository: FakeAccountsRepository;
let fakeUsersRepository: FakeUsersRepository;
let fakeBanksRepository: FakeBanksRepository;
let fakeHashProvider: FakeHashProvider;

let getAccountById: GetAccountByIdService
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

describe('CreateAccount', () => {
  beforeEach(() => {
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
    getAccountById = new GetAccountByIdService(
      fakeAccountsRepository
    )
    createAccount = new CreateAccountService(
      fakeAccountsRepository,
      fakeBanksRepository,
      fakeUsersRepository
    );
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
        id: '111'
      })
    ).rejects.toMatchObject(
      new AppError('No account found for given id.', 404)
    );
  });
});
