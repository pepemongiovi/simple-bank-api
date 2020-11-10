/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import Account from '@modules/accounts/infra/typeorm/entities/Account';
import {
  clearDb,
  createAccountForTests,
  createBankForTests,
  createUserAndAuthenticateForTests,
  deleteAccountForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let account: Account;
let authToken = '';

describe('DeleteAccountRoute', () => {
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

  it('should delete a new account', async () => {
    const res = await deleteAccountForTests(
      request,
      appServer,
      account.id,
      authToken,
    );

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual('Account deleted!');
  });

  it('should not delete a account without authorization token.', async () => {
    const res = await deleteAccountForTests(request, appServer, account.id);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to delete a account with invalid account id.', async () => {
    const fakeId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    const res = await deleteAccountForTests(
      request,
      appServer,
      fakeId,
      authToken,
    );

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('No account found with the given id.');
  });
});
