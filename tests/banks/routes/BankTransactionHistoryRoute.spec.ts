/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import Transaction from '@modules/transactions/infra/typeorm/entities/Transaction';
import {
  clearDb,
  createAccountForTests,
  createBankForTests,
  createUserAndAuthenticateForTests,
  getTransactionHistoryForTests,
  makeDepositForTests,
} from '@shared/helpers/helper';
import { addMonths, endOfDay, startOfDay } from 'date-fns';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let bank: Bank;
let account: Account;
let authToken = '';
let transactionsFromDepositsMade: Transaction[] = [];

describe('BankTransactionHistoryRoute', () => {
  // Creates bank, user, account and makes 3 deposits
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

    const valueToBeDeposited = 100;

    const resDeposit1 = await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      account.id,
      authToken,
    );

    const resDeposit2 = await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      account.id,
      authToken,
    );

    const resDeposit3 = await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      account.id,
      authToken,
    );

    expect(resDeposit1.statusCode).toEqual(200);
    expect(resDeposit2.statusCode).toEqual(200);
    expect(resDeposit3.statusCode).toEqual(200);

    transactionsFromDepositsMade = [
      resDeposit1.body.transaction,
      resDeposit2.body.transaction,
      resDeposit3.body.transaction,
    ];
  });

  it('should get transaction history from account.', async () => {
    const startOfCurrentDay: Date = startOfDay(new Date());
    const oneMonthFromNow: Date = addMonths(new Date(), 1);

    const transactionHistoryRes = await getTransactionHistoryForTests(
      request,
      appServer,
      account.id,
      startOfCurrentDay,
      oneMonthFromNow,
      authToken,
    );

    const transactionHistory = transactionHistoryRes.body;

    expect(transactionsFromDepositsMade).toMatchObject(transactionHistory);
  });

  it('should not deposit without a authorization token.', async () => {
    const startOfCurrentDay: Date = startOfDay(new Date());
    const endOfCurrentDay: Date = endOfDay(new Date());

    const transactionHistoryRes = await getTransactionHistoryForTests(
      request,
      appServer,
      account.id,
      startOfCurrentDay,
      endOfCurrentDay,
    );
    expect(transactionHistoryRes.statusCode).toEqual(401);
    expect(transactionHistoryRes.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to deposit to an account with invalid account_id.', async () => {
    const fakeAccountId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    const startOfCurrentDay: Date = startOfDay(new Date());
    const endOfCurrentDay: Date = endOfDay(new Date());

    const transactionHistoryRes = await getTransactionHistoryForTests(
      request,
      appServer,
      fakeAccountId,
      startOfCurrentDay,
      endOfCurrentDay,
      authToken,
    );

    expect(transactionHistoryRes.statusCode).toEqual(404);
    expect(transactionHistoryRes.body.message).toEqual(
      'No account found with the given id.',
    );
  });

  it('should not be able to create a transfer with invalid date interval.', async () => {
    const startOfCurrentDay: Date = startOfDay(new Date());
    const endOfCurrentDay: Date = endOfDay(new Date());

    const transactionHistoryRes = await getTransactionHistoryForTests(
      request,
      appServer,
      account.id,
      endOfCurrentDay,
      startOfCurrentDay,
      authToken,
    );

    expect(transactionHistoryRes.statusCode).toEqual(400);
    expect(transactionHistoryRes.body.message).toEqual(
      'Invalid interval. Initial date must be greater than final date.',
    );
  });

  it('should not be able to create a transfer with invalid start date.', async () => {
    let startOfCurrentDay: Date = startOfDay(new Date());
    startOfCurrentDay = addMonths(startOfCurrentDay, 1);
    let endOfCurrentDay: Date = endOfDay(new Date());
    endOfCurrentDay = addMonths(endOfCurrentDay, 2);

    const transactionHistoryRes = await getTransactionHistoryForTests(
      request,
      appServer,
      account.id,
      startOfCurrentDay,
      endOfCurrentDay,
      authToken,
    );

    expect(transactionHistoryRes.statusCode).toEqual(400);
    expect(transactionHistoryRes.body.message).toEqual(
      'Initial date must not be greater than current date.',
    );
  });
});
