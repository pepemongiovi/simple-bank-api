/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import Bank from '@modules/banks/infra/typeorm/entities/Bank';
import User from '@modules/users/infra/typeorm/entities/User';
import {
  clearDb,
  createAccountForTests,
  createBankForTests,
  createUserAndAuthenticateForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let newUser: User;
let bank: Bank;
let authToken = '';

describe('CreateAccountRoute', () => {
  beforeEach(async () => {
    await clearDb();

    const { user, token } = await createUserAndAuthenticateForTests(
      request,
      appServer,
      'Giuseppe Mongiovi',
      '07346274407',
    );

    newUser = user;
    authToken = token;

    const newBankRes = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    bank = newBankRes.body;
  });

  it('should create a new account', async () => {
    const res = await createAccountForTests(
      request,
      appServer,
      newUser.id,
      bank.id,
      authToken,
    );

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.balance).toBe(0);
  });

  it('should not create a new account without authorization token.', async () => {
    const res = await createAccountForTests(
      request,
      appServer,
      newUser.id,
      bank.id,
    );

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to create a account with invalid user id.', async () => {
    const fakeId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    const res = await createAccountForTests(
      request,
      appServer,
      fakeId,
      bank.id,
      authToken,
    );

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('No user found for given user id.');
  });

  it('should not be able to create a account with invalid bank id.', async () => {
    const fakeId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    const res = await createAccountForTests(
      request,
      appServer,
      newUser.id,
      fakeId,
      authToken,
    );

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('No bank found for given bank id.');
  });
});
