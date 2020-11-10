/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import {
  clearDb,
  createAccountForTests,
  createBankForTests,
  createUserAndAuthenticateForTests,
  updateAccountBalanceForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let account: Account;
let authToken = '';

describe('GeAccountByIdRoute', () => {
  beforeEach(async () => {
    await clearDb();

    const { user, token } = await createUserAndAuthenticateForTests(
      request,
      appServer,
      'Giuseppe Mongiovi',
      '07346274407',
    );

    authToken = token;

    const newBankRes = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    const bank = newBankRes.body;

    const newAccountRes = await createAccountForTests(
      request,
      appServer,
      user.id,
      bank.id,
      authToken,
    );

    account = newAccountRes.body;
  });

  it('should update the balance from the account.', async () => {
    const newBalance = 500;

    const res = await updateAccountBalanceForTests(
      request,
      appServer,
      account.id,
      newBalance,
      authToken,
    );

    expect(res.statusCode).toEqual(200);
    expect(res.body.balance).toBe(newBalance);
  });

  it('should update the balance from the account without authorization token.', async () => {
    const newBalance = 500;

    const res = await updateAccountBalanceForTests(
      request,
      appServer,
      account.id,
      newBalance,
    );

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to update a account with invalid account id.', async () => {
    const fakeId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';
    const newBalance = 500;

    const res = await updateAccountBalanceForTests(
      request,
      appServer,
      fakeId,
      newBalance,
      authToken,
    );

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('No account found for given id.');
  });
});
