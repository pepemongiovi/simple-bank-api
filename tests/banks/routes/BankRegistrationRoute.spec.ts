/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import {
  clearDb,
  createBankForTests,
  createUserAndAuthenticateForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let authToken = '';

describe('BankRegistrationRoute', () => {
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

  it('should create a new bank', async () => {
    const res = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
  });

  it('should not create a new bank without authorization token.', async () => {
    const res = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
    );

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to create a bank with same CNPJ.', async () => {
    const resBank1 = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    const resBank2 = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    expect(resBank1.statusCode).toEqual(200);
    expect(resBank1.body).toHaveProperty('id');

    expect(resBank2.statusCode).toEqual(403);
    expect(resBank2.body.message).toEqual(
      'Bank with this CNPJ already exists.',
    );
  });

  it('should not be able to create a bank with an invalid CNPJ.', async () => {
    const res = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/1111-11',
      authToken,
    );

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual('Invalid CNPJ.');
  });
});
