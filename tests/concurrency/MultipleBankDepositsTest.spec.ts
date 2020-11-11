/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import {
  clearDb,
  createAccountForTests,
  createBankForTests,
  createUserAndAuthenticateForTests,
  getAccountByIdForTests,
  makeDepositForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let bank: Bank;
let account: Account;
let authToken = '';

describe('MultipleBankDepositsTest', () => {
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

  it('should handle concurrency on multiple deposits', async () => {
    const valueToBeDeposited = 100;
    const numberOfDeposits = 4;

    await Promise.all([
      Promise.resolve(
        makeDepositForTests(
          request,
          appServer,
          valueToBeDeposited,
          account.id,
          authToken,
        ),
      ),
      Promise.resolve(
        makeDepositForTests(
          request,
          appServer,
          valueToBeDeposited,
          account.id,
          authToken,
        ),
      ),
      Promise.resolve(
        makeDepositForTests(
          request,
          appServer,
          valueToBeDeposited,
          account.id,
          authToken,
        ),
      ),
      Promise.resolve(
        makeDepositForTests(
          request,
          appServer,
          valueToBeDeposited,
          account.id,
          authToken,
        ),
      ),
    ]).then((responses) => {
      responses.forEach((response: any) =>
        expect(response.statusCode).toBe(200),
      );
    });

    // eslint-disable-next-line radix
    const depositPercentageBonus: number = parseInt(
      process.env.DEPOSIT_PERCENTAGE_FOR_BONUS || '0.5',
    );
    const bonusValue =
      valueToBeDeposited * (depositPercentageBonus / 100) * numberOfDeposits;
    const expectedBalance = valueToBeDeposited * numberOfDeposits + bonusValue;

    const accountAfterDepositsRes = await getAccountByIdForTests(
      request,
      appServer,
      account.id,
      authToken,
    );

    expect(accountAfterDepositsRes.statusCode).toBe(200);
    expect(accountAfterDepositsRes.body.balance).toBe(expectedBalance);
  });
});
