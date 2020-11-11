/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import { TransactionType } from '@modules/transactions/infra/typeorm/entities/Transaction';
import {
  clearDb,
  createAccountForTests,
  createBankForTests,
  createTransactionForTests,
  createUserAndAuthenticateForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let bank: Bank;
let account: Account;
let authToken = '';

describe('CreateTransactionRoute', () => {
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

  it('should create a new transaction', async () => {
    const valueToBeDeposited = 100;

    const transactionCost = 0;
    // eslint-disable-next-line radix
    const depositPercentageBonus: number = parseInt(
      process.env.DEPOSIT_PERCENTAGE_FOR_BONUS || '0.5',
    );
    const bonusValue = valueToBeDeposited * (depositPercentageBonus / 100);

    const transactionRes = await createTransactionForTests(
      request,
      appServer,
      account.id,
      account.id,
      valueToBeDeposited,
      TransactionType.DEPOSIT,
      bonusValue,
      transactionCost,
      authToken,
    );

    expect(transactionRes.statusCode).toEqual(200);
    expect(transactionRes.body).toHaveProperty('id');
  });

  it('should not create a transaction withou a authorization token.', async () => {
    const valueToBeDeposited = 100;

    const transactionCost = 0;
    // eslint-disable-next-line radix
    const depositPercentageBonus: number = parseInt(
      process.env.DEPOSIT_PERCENTAGE_FOR_BONUS || '0.5',
    );
    const bonusValue = valueToBeDeposited * (depositPercentageBonus / 100);

    const transactionRes = await createTransactionForTests(
      request,
      appServer,
      account.id,
      account.id,
      valueToBeDeposited,
      TransactionType.DEPOSIT,
      bonusValue,
      transactionCost,
    );

    expect(transactionRes.statusCode).toEqual(401);
    expect(transactionRes.body.message).toEqual('Invalid JWT token');
  });

  it('should not create a transaction with a invalid account id.', async () => {
    const fakeAccountId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';
    const valueToBeDeposited = 100;

    const transactionCost = 0;
    // eslint-disable-next-line radix
    const depositPercentageBonus: number = parseInt(
      process.env.DEPOSIT_PERCENTAGE_FOR_BONUS || '0.5',
    );
    const bonusValue = valueToBeDeposited * (depositPercentageBonus / 100);

    const transactionFakeFromAccountIdRes = await createTransactionForTests(
      request,
      appServer,
      fakeAccountId,
      account.id,
      valueToBeDeposited,
      TransactionType.DEPOSIT,
      bonusValue,
      transactionCost,
      authToken,
    );

    const transactionFakeToAccountIdRes = await createTransactionForTests(
      request,
      appServer,
      account.id,
      fakeAccountId,
      valueToBeDeposited,
      TransactionType.DEPOSIT,
      bonusValue,
      transactionCost,
      authToken,
    );

    expect(transactionFakeFromAccountIdRes.statusCode).toEqual(404);
    expect(transactionFakeFromAccountIdRes.body.message).toEqual(
      'No account found for given from_account_id.',
    );

    expect(transactionFakeToAccountIdRes.statusCode).toEqual(404);
    expect(transactionFakeToAccountIdRes.body.message).toEqual(
      'No account found for given to_account_id.',
    );
  });

  it('should not be able to create a transaction with a value that is not greater than zero.', async () => {
    const valueToBeDeposited = 0;
    const negativeValueToBeDeposited = -100;
    const bonusValue = 0;
    const transactionCost = 0;

    const valueZeroTranscRes = await createTransactionForTests(
      request,
      appServer,
      account.id,
      account.id,
      valueToBeDeposited,
      TransactionType.DEPOSIT,
      bonusValue,
      transactionCost,
      authToken,
    );

    const negativeValueTranscRes = await createTransactionForTests(
      request,
      appServer,
      account.id,
      account.id,
      negativeValueToBeDeposited,
      TransactionType.DEPOSIT,
      bonusValue,
      transactionCost,
      authToken,
    );

    expect(valueZeroTranscRes.statusCode).toEqual(400);
    expect(valueZeroTranscRes.body.message).toEqual(
      'Transaction value must be greater than zero.',
    );

    expect(negativeValueTranscRes.statusCode).toEqual(400);
    expect(negativeValueTranscRes.body.message).toEqual(
      'Transaction value must be greater than zero.',
    );
  });
});
