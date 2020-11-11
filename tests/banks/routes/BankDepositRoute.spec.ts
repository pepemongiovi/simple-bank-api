/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import {
  clearDb,
  createAccountForTests,
  createBankForTests,
  createUserAndAuthenticateForTests,
  isTransactionEquals,
  makeDepositForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let bank: Bank;
let account: Account;
let authToken = '';

describe('BankDepositRoute', () => {
  beforeEach(async () => {
    await clearDb();

    const { user, token } = await createUserAndAuthenticateForTests(
      request,
      appServer,
      'Giuseppe Mongiovi',
      '07346274407',
    );

    authToken = token;

    const newBankResponse = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    bank = newBankResponse.body;

    const newAccountResponse = await createAccountForTests(
      request,
      appServer,
      user.id,
      bank.id,
      authToken,
    );

    account = newAccountResponse.body;
  });

  it('should make a new deposit', async () => {
    const valueToBeDeposited = 100;

    const res = await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      account.id,
      authToken,
    );

    const transactionCost = 0;
    // eslint-disable-next-line radix
    const depositPercentageBonus: number = parseInt(
      process.env.DEPOSIT_PERCENTAGE_FOR_BONUS || '0.5',
    );
    const bonusValue = valueToBeDeposited * (depositPercentageBonus / 100);
    const valueWithBonus = valueToBeDeposited + bonusValue;

    const expectedTransactionIsValid = isTransactionEquals(
      res.body.transaction,
      account.id,
      account.id,
      TransactionType.DEPOSIT,
      valueToBeDeposited,
      bonusValue,
      transactionCost,
    );

    expect(res.statusCode).toEqual(200);
    expect(res.body.transaction).toHaveProperty('id');
    expect(expectedTransactionIsValid).toBeTruthy();
    expect(res.body.updatedAccount.balance).toBe(valueWithBonus);
  });

  it('should not deposit without a authorization token.', async () => {
    const res = await makeDepositForTests(request, appServer, 100, account.id);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to deposit to an account with invalid account_id.', async () => {
    const valueToBeDeposited = 100;
    const fakeAccountId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    const res = await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      fakeAccountId,
      authToken,
    );

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual(
      'No account found with the given account_id.',
    );
  });

  it('should not be able to deposit a value that is not greater than zero to an account.', async () => {
    const valueToBeDeposited = 0;
    const negativeValueToBeDeposited = -100;

    const valueZeroDeposit = await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      account.id,
      authToken,
    );

    const negativeDeposit = await makeDepositForTests(
      request,
      appServer,
      negativeValueToBeDeposited,
      account.id,
      authToken,
    );

    expect(valueZeroDeposit.statusCode).toEqual(400);
    expect(valueZeroDeposit.body.message).toEqual(
      'Deposit value must be greater than zero.',
    );

    expect(negativeDeposit.statusCode).toEqual(400);
    expect(negativeDeposit.body.message).toEqual(
      'Deposit value must be greater than zero.',
    );
  });
});
