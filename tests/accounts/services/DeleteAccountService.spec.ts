import AppError from '@shared/errors/AppError';

import CreateBankService from '@modules/banks/services/CreateBankService';
import CreateUserService from '@modules/users/services/CreateUserService';
import FakeBanksRepository from '@modules/banks/repositories/fakes/FakeBanksRepository';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import DeleteAccountService from '@modules/accounts/services/DeleteAccountService';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';

let fakeHashProvider = new FakeHashProvider();
let fakeUsersRepository = new FakeUsersRepository;
let fakeBanksRepository: FakeBanksRepository;
let fakeAccountsRepository: FakeAccountsRepository;

let deleteAccount: DeleteAccountService;
let createUser: CreateUserService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;

describe('DeleteAccount', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeBanksRepository = new FakeBanksRepository();
    fakeAccountsRepository = new FakeAccountsRepository();
    fakeHashProvider = new FakeHashProvider();

    createAccount = new CreateAccountService(
      fakeAccountsRepository,
      fakeBanksRepository,
      fakeUsersRepository
    );
    createUser = new CreateUserService(
      fakeUsersRepository,
      fakeHashProvider
    );
    createBank = new CreateBankService(
      fakeBanksRepository
    );
    deleteAccount = new DeleteAccountService(
      fakeAccountsRepository
    );
  });

  it('should be able to delete a existing account.', async () => {
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

    expect(account).toHaveProperty('id');

    const result = await deleteAccount.execute({
      id: account.id
    });

    expect(result).toBe("Account deleted!");
  });

  it('should not be able to delete with an invalid id.', async () => {
    const fakeAccountId = '111'

    await expect(
      deleteAccount.execute({
        id: fakeAccountId
      })
    ).rejects.toMatchObject(
      new AppError('No account found with the given id.', 404)
    )
  });
});
