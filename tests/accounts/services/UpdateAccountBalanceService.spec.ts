import Account from '@modules/accounts/infra/typeorm/entities/Account';
import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import UpdateAccountBalanceService from '@modules/accounts/services/UpdateAccountBalanceService';
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

let updateAccountBalance: UpdateAccountBalanceService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

let bank: Bank;
let user: User;
let account: Account;

describe('UpdateAccountBalance', () => {
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
    updateAccountBalance = new UpdateAccountBalanceService(
      fakeAccountsRepository
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

    account = await createAccount.execute({
      user_id: user.id,
      bank_id: bank.id
    });
  });

  it("should be able to update the account's balance.", async () => {
    expect(account.balance).toBe(0);

    const newBalance = 1000.50

    const updatedAccount = await updateAccountBalance.execute({
      balance: newBalance,
      account_id: account.id
    })

    expect(updatedAccount.balance).toBe(newBalance);
  });

  it("should not be able to update the account's with an invalid account id.", async () => {
    const newBalance = 100
    const fakeId = '111'

    await expect(
      updateAccountBalance.execute({
        balance: newBalance,
        account_id: fakeId
      })
    ).rejects.toMatchObject(
      new AppError("No account found for given id.", 404)
    )
  });

  it("should not be able to update the account's with an negative balance.", async () => {
    const newBalance = -1000.50

    await expect(
      updateAccountBalance.execute({
        balance: newBalance,
        account_id: account.id
      })
    ).rejects.toMatchObject(
      new AppError("New balance can't have a negative value.")
    )
  });
});
