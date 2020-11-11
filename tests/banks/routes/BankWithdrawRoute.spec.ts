/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import {
  clearDb,
  createAccountForTests,
  createBankForTests,
  createUserAndAuthenticateForTests,
  isTransactionEquals,
  makeDepositForTests,
  makeWithdrawForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let bank: Bank;
let account: Account;
let authToken = '';

describe('BankWithdrawRoute', () => {
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

  it('should make a new withdraw', async () => {
    const valueToBeDeposited = 500;

    const depositRes = await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      account.id,
      authToken,
    );

    const valueToBeWithdrawed = 100;

    const withdrawRes = await makeWithdrawForTests(
      request,
      appServer,
      valueToBeWithdrawed,
      account.id,
      authToken,
    );

    const bonusValue = 0;
    // eslint-disable-next-line radix
    const withdrawPercentageCost: number = parseInt(
      process.env.WITHDRAW_PERCENTAGE_COST || '1',
    );
    const transactionCost =
      valueToBeWithdrawed * (withdrawPercentageCost / 100);
    const valueWithTransactionCost = valueToBeWithdrawed + transactionCost;

    const finalAccountBalance =
      depositRes.body.updatedAccount.balance - valueWithTransactionCost;

    const expectedTransactionIsValid = isTransactionEquals(
      withdrawRes.body.transaction,
      account.id,
      account.id,
      TransactionType.WITHDRAW,
      valueToBeWithdrawed,
      bonusValue,
      transactionCost,
    );

    expect(withdrawRes.statusCode).toEqual(200);
    expect(withdrawRes.body.transaction).toHaveProperty('id');
    expect(expectedTransactionIsValid).toBeTruthy();
    expect(withdrawRes.body.updatedAccount.balance).toBe(finalAccountBalance);
  });

  it('should not withdraw without a authorization token.', async () => {
    const res = await makeDepositForTests(request, appServer, 100, account.id);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to withdraw to an account with invalid account_id.', async () => {
    const valueToBeWithdrawed = 100;
    const fakeAccountId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    const res = await makeDepositForTests(
      request,
      appServer,
      valueToBeWithdrawed,
      fakeAccountId,
      authToken,
    );

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual(
      'No account found with the given account_id.',
    );
  });

  it('should not be able to withdraw a value that is not greater than zero to an account.', async () => {
    const valueToBeWithdrawed = 0;
    const negativeValueToBeDeposited = -100;

    const valueZeroWithdraw = await makeWithdrawForTests(
      request,
      appServer,
      valueToBeWithdrawed,
      account.id,
      authToken,
    );

    const negativeWithdraw = await makeWithdrawForTests(
      request,
      appServer,
      negativeValueToBeDeposited,
      account.id,
      authToken,
    );

    expect(valueZeroWithdraw.statusCode).toEqual(400);
    expect(valueZeroWithdraw.body.message).toEqual(
      'Withdraw value must be greater than zero.',
    );

    expect(negativeWithdraw.statusCode).toEqual(400);
    expect(negativeWithdraw.body.message).toEqual(
      'Withdraw value must be greater than zero.',
    );
  });
});
