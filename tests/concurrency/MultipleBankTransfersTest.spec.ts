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
  makeTransferForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let bank: Bank;
let account: Account;
let otherAccount: Account;
let authToken = '';

describe('MultipleBankTransfersTest', () => {
  // Creates a bank, 2 users, 2 accounts and deposits $1500 in each
  beforeEach(async () => {
    await clearDb();

    const { user, token } = await createUserAndAuthenticateForTests(
      request,
      appServer,
      'Giuseppe Mongiovi',
      '07346274407',
    );

    const otherUser = (
      await createUserAndAuthenticateForTests(
        request,
        appServer,
        'Jader Freitas',
        '034.037.960-00',
      )
    ).user;

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

    const otherNewAccountResponse = await createAccountForTests(
      request,
      appServer,
      otherUser.id,
      bank.id,
      authToken,
    );

    otherAccount = otherNewAccountResponse.body;
    account = newAccountResponse.body;

    const valueToBeDeposited = 1500;

    const depositAccountRes = await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      account.id,
      authToken,
    );

    const depositOtherAccountRes = await makeDepositForTests(
      request,
      appServer,
      valueToBeDeposited,
      otherAccount.id,
      authToken,
    );

    account = depositAccountRes.body.updatedAccount;
    otherAccount = depositOtherAccountRes.body.updatedAccount;
  });

  it('should handle concurrency on multiple transfer', async () => {
    const accountInitialBalance = account.balance;
    const otherAccountInitialBalance = otherAccount.balance;

    const valueToBeTransfered = 300;

    const accountsDeposits = [
      Promise.resolve(
        makeTransferForTests(
          request,
          appServer,
          valueToBeTransfered,
          account.id,
          otherAccount.id,
          authToken,
        ),
      ),
      Promise.resolve(
        makeTransferForTests(
          request,
          appServer,
          valueToBeTransfered,
          account.id,
          otherAccount.id,
          authToken,
        ),
      ),
      Promise.resolve(
        makeTransferForTests(
          request,
          appServer,
          valueToBeTransfered,
          account.id,
          otherAccount.id,
          authToken,
        ),
      ),
      Promise.resolve(
        makeTransferForTests(
          request,
          appServer,
          valueToBeTransfered,
          account.id,
          otherAccount.id,
          authToken,
        ),
      ),
    ];

    const otherAccountsDeposit = [
      Promise.resolve(
        makeTransferForTests(
          request,
          appServer,
          valueToBeTransfered,
          otherAccount.id,
          account.id,
          authToken,
        ),
      ),
      Promise.resolve(
        makeTransferForTests(
          request,
          appServer,
          valueToBeTransfered,
          otherAccount.id,
          account.id,
          authToken,
        ),
      ),
      Promise.resolve(
        makeTransferForTests(
          request,
          appServer,
          valueToBeTransfered,
          otherAccount.id,
          account.id,
          authToken,
        ),
      ),
      Promise.resolve(
        makeTransferForTests(
          request,
          appServer,
          valueToBeTransfered,
          otherAccount.id,
          account.id,
          authToken,
        ),
      ),
    ];

    await Promise.all([...accountsDeposits, ...otherAccountsDeposit]).then(
      (responses) => {
        responses.forEach((response: any) =>
          expect(response.statusCode).toBe(200),
        );
      },
    );

    const accountAfterTransferRes = await getAccountByIdForTests(
      request,
      appServer,
      account.id,
      authToken,
    );

    const otherAccountAfterTransferRes = await getAccountByIdForTests(
      request,
      appServer,
      otherAccount.id,
      authToken,
    );

    expect(accountAfterTransferRes.statusCode).toBe(200);
    expect(accountAfterTransferRes.body.balance).toBe(accountInitialBalance);

    expect(otherAccountAfterTransferRes.statusCode).toBe(200);
    expect(otherAccountAfterTransferRes.body.balance).toBe(
      otherAccountInitialBalance,
    );
  });
});
