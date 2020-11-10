/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import {
  clearDb,
  createBankForTests,
  createUserAndAuthenticateForTests,
  deleteBankForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let authToken = '';

describe('DeleteBankRoute', () => {
  beforeEach(async () => {
    await clearDb();

    const { token } = await createUserAndAuthenticateForTests(
      request,
      appServer,
      'Giuseppe Mongiovi',
      '07346274407',
    );

    authToken = token;
  });

  it('should delete a existing bank', async () => {
    const createBankRes = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    const deleteBankRes = await deleteBankForTests(
      request,
      appServer,
      createBankRes.body.id,
      authToken,
    );

    expect(deleteBankRes.statusCode).toEqual(200);
    expect(deleteBankRes.body).toEqual('Bank deleted!');
  });

  it('should not create a new bank without authorization token.', async () => {
    const createBankRes = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    const deleteBankRes = await deleteBankForTests(
      request,
      appServer,
      createBankRes.body.id,
    );

    expect(deleteBankRes.statusCode).toEqual(401);
    expect(deleteBankRes.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to delete a bank with an invalid id.', async () => {
    const fakeBankId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    const res = await deleteBankForTests(
      request,
      appServer,
      fakeBankId,
      authToken,
    );

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('No bank found with the given id.');
  });
});
