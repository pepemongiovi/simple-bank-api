import "reflect-metadata"
import CreateAccountService from '@modules/accounts/services/CreateAccountService';
import BankDepositService from '@modules/banks/services/BankDepositService';
import CreateBankService from '@modules/banks/services/CreateBankService';
import Transaction, { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb, isTransactionEquals } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';

let bankDeposit: BankDepositService;
let createAccount: CreateAccountService;
let createBank: CreateBankService;
let createUser: CreateUserService;

let account: any;

describe('BankDepositService', () => {
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
    bankDeposit = new BankDepositService()
  });

  beforeEach(async () => {
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
  })

  it('should be able to deposit to the account.', async () => {
    const initialBalance = 0

    expect(account.balance).toBe(initialBalance);

    const valueToBeAdded = 100.5

    const { updatedAccount, transaction } = await bankDeposit.execute({
      account_id: account.id,
      value: valueToBeAdded
    })

    const transactionCost = 0
    const depositPercentageBonus = 0.5
    const bonusValue = valueToBeAdded * (depositPercentageBonus/100)
    const valueWithBonus = valueToBeAdded + bonusValue

    const expectedTransactionIsValid = isTransactionEquals(
      transaction, account.id, account.id, TransactionType.DEPOSIT,
      valueToBeAdded, bonusValue, transactionCost
    )

    expect(transaction).toHaveProperty('id');
    expect(expectedTransactionIsValid).toBeTruthy();
    expect(updatedAccount.balance).toBe(valueWithBonus);
  });

  it('should not be able to deposit to an account with invalid account id.', async () => {
    const valueToDeposit = 100.5

    await expect(
      bankDeposit.execute({
        account_id: '05766d27-f634-45ea-ac82-eb53ae5d67fe',
        value: valueToDeposit
      })
    ).rejects.toMatchObject(
      new AppError('No account found with the given account_id.', 404)
    );
  });

  it('should not be able to deposit a value that is not greater than zero to an account.', async () => {
    await expect(
      bankDeposit.execute({
        account_id: account.id,
        value: 0
      })
    ).rejects.toMatchObject(
      new AppError('Deposit value must be greater than zero.')
    );

    await expect(
      bankDeposit.execute({
        account_id: account.id,
        value: -1
      })
    ).rejects.toMatchObject(
      new AppError('Deposit value must be greater than zero.')
    );
  });
});
