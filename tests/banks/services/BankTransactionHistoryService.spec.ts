import Account from '@modules/accounts/infra/typeorm/entities/Account';
import FakeAccountsRepository from '@modules/accounts/repositories/fakes/FakeAccountsRepository';
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import FakeBanksRepository from '@modules/banks/repositories/fakes/FakeBanksRepository';
import BankDepositService from '@modules/banks/services/BankDepositService';
import BankTransactionHistoryService from '@modules/banks/services/BankTransactionHistoryService';
import CreateBankService from '@modules/banks/services/CreateBankService';
import transactionsRouter from '@modules/transactions/infra/http/routes/transactions.routes';
import Transaction, { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import TransactionsRepository from '@modules/transactions/infra/typeorm/repositories/TransactionsRepository';
import FakeTransactionsRepository from '@modules/transactions/repositories/fakes/FakeTransactionsRepository';
import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb, isTransactionEquals } from '@shared/helpers/helper';
import { addMonths, endOfDay, startOfDay } from 'date-fns';

let fakeTransactionsRepository: FakeTransactionsRepository;
let fakeAccountsRepository: FakeAccountsRepository;
let fakeUsersRepository: FakeUsersRepository;
let fakeBanksRepository: FakeBanksRepository;
let fakeHashProvider: FakeHashProvider;

let bankTransactionHistory: BankTransactionHistoryService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;
let bankDeposit: BankDepositService;

let account: any;
let transactionsFromDepositsMade: Transaction[] = []

interface IDepositResult {
  updatedAccount: Account,
  transaction: Transaction
}

describe('BankTransactionHistoryService', () => {
  //Creates bank, user, account and makes 3 deposits
  beforeEach(async() => {
    fakeTransactionsRepository = new FakeTransactionsRepository();
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
    bankDeposit = new BankDepositService(
      fakeAccountsRepository,
      fakeTransactionsRepository
    )
    bankTransactionHistory = new BankTransactionHistoryService(
      fakeAccountsRepository,
      fakeTransactionsRepository
    )

    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91'
    });

    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456'
    });

    account = await createAccount.execute({
      user_id: user.id,
      bank_id: bank.id
    });

    const valueToDeposit = 100

    const deposit1: IDepositResult = await bankDeposit.execute({
      account_id: account.id,
      value: valueToDeposit
    })

    const deposit2: IDepositResult = await bankDeposit.execute({
      account_id: account.id,
      value: valueToDeposit
    })

    const deposit3: IDepositResult = await bankDeposit.execute({
      account_id: account.id,
      value: valueToDeposit
    })

    transactionsFromDepositsMade = [
      deposit1.transaction,
      deposit2.transaction,
      deposit3.transaction,
    ]
  });

  it('should get transaction history from account.', async () => {
    const startOfCurrentDay: Date = startOfDay(new Date())
    const endOfCurrentDay: Date = endOfDay(new Date())

    const historyTransactionRes = await bankTransactionHistory.execute({
      account_id: account.id,
      from_date: startOfCurrentDay,
      to_date: endOfCurrentDay
    })

    expect(historyTransactionRes).toMatchObject(
      transactionsFromDepositsMade
    );
  });

  it('should not be able create a transfer with an invalid account id.', async () => {
    const fakeAccountId = '05766d27-f634-45ea-ac82-eb53ae5d67fe'

    const startOfCurrentDay: Date = startOfDay(new Date())
    const endOfCurrentDay: Date = endOfDay(new Date())

    await expect(
      bankTransactionHistory.execute({
        account_id: fakeAccountId,
        from_date: startOfCurrentDay,
        to_date: endOfCurrentDay
      })
    ).rejects.toMatchObject(
      new AppError('No account found with the given id.', 404)
    );
  });

  it('should not be able to create a transfer with invalid date interval.', async () => {
    const startOfCurrentDay: Date = startOfDay(new Date())
    const endOfCurrentDay: Date = endOfDay(new Date())

    await expect(
      bankTransactionHistory.execute({
        account_id: account.id,
        from_date: endOfCurrentDay,
        to_date: startOfCurrentDay
      })
    ).rejects.toMatchObject(
      new AppError('Invalid interval. Initial date must be greater than final date.')
    );
  });

  it('should not be able to create a transfer with invalid start date.', async () => {
    let startOfCurrentDay: Date = startOfDay(new Date())
    startOfCurrentDay = addMonths(startOfCurrentDay, 1)
    let endOfCurrentDay: Date = endOfDay(new Date())
    endOfCurrentDay = addMonths(endOfCurrentDay, 2)

    await expect(
      bankTransactionHistory.execute({
        account_id: account.id,
        from_date: startOfCurrentDay,
        to_date: endOfCurrentDay
      })
    ).rejects.toMatchObject(
      new AppError('Initial date must not be greater than current date.')
    );
  });
});
