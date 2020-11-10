/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import {
  clearDb,
  createBankForTests,
  createUserAndAuthenticateForTests,
  getBankByIdForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let authToken = '';

describe('GetBankByIdRoute', () => {
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

  it('should get a existing bank', async () => {
    const createBankRes = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    const getByIdRes = await getBankByIdForTests(
      request,
      appServer,
      createBankRes.body.id,
      authToken,
    );

    expect(getByIdRes.statusCode).toEqual(200);
    expect(getByIdRes.body).toMatchObject(createBankRes.body);
  });

  it('should not create a new bank without authorization token.', async () => {
    const createBankRes = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    const getByIdRes = await getBankByIdForTests(
      request,
      appServer,
      createBankRes.body.id,
    );

    expect(getByIdRes.statusCode).toEqual(401);
    expect(getByIdRes.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to delete a bank with an invalid id.', async () => {
    const fakeBankId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    const getByIdRes = await getBankByIdForTests(
      request,
      appServer,
      fakeBankId,
      authToken,
    );

    expect(getByIdRes.statusCode).toEqual(404);
    expect(getByIdRes.body.message).toEqual('No bank found with the given id.');
  });
});
