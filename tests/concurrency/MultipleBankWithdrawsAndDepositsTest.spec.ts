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
  makeWithdrawForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let bank: Bank;
let account: Account;
let authToken = '';

describe('MultipleBankWithdrawsTest', () => {
  // Creates bank, user, account and deposits $1500
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

    const valueToBeDeposited = 1500;

    const depositRes = await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      account.id,
      authToken,
    );

    account = depositRes.body.updatedAccount;
  });

  it('should handle concurrency on multiple withdraws', async () => {
    const valueToBeDeposited = 300;
    const valueToBeWithdrawn = 300;
    const numberOfDeposits = 3;
    const numberOfWithdraws = 3;

    const deposits = [
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
    ];

    const withdraws = [
      Promise.resolve(
        makeWithdrawForTests(
          request,
          appServer,
          valueToBeWithdrawn,
          account.id,
          authToken,
        ),
      ),
      Promise.resolve(
        makeWithdrawForTests(
          request,
          appServer,
          valueToBeWithdrawn,
          account.id,
          authToken,
        ),
      ),
      Promise.resolve(
        makeWithdrawForTests(
          request,
          appServer,
          valueToBeWithdrawn,
          account.id,
          authToken,
        ),
      ),
    ];

    await Promise.all([...withdraws, ...deposits]).then((responses) => {
      responses.forEach((response: any) =>
        expect(response.statusCode).toBe(200),
      );
    });

    // eslint-disable-next-line radix
    const withdrawPercentageCost: number = parseInt(
      process.env.WITHDRAW_PERCENTAGE_COST || '1',
    );
    const transactionsCost =
      valueToBeWithdrawn * (withdrawPercentageCost / 100) * numberOfWithdraws;
    const totalAmountWithdrawn =
      valueToBeWithdrawn * numberOfWithdraws + transactionsCost;

    // eslint-disable-next-line radix
    const depositPercentageBonus: number = parseInt(
      process.env.DEPOSIT_PERCENTAGE_FOR_BONUS || '0.5',
    );
    const bonusValue =
      valueToBeDeposited * (depositPercentageBonus / 100) * numberOfDeposits;
    const totalAmountDeposited =
      valueToBeDeposited * numberOfDeposits + bonusValue;

    const finalBalanceExpected =
      account.balance + totalAmountDeposited - totalAmountWithdrawn;

    const accountAfterWithdrawsRes = await getAccountByIdForTests(
      request,
      appServer,
      account.id,
      authToken,
    );

    expect(accountAfterWithdrawsRes.statusCode).toBe(200);
    expect(accountAfterWithdrawsRes.body.balance).toBe(finalBalanceExpected);
  });
});
