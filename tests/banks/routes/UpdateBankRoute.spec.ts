/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import {
  clearDb,
  createBankForTests,
  createUserAndAuthenticateForTests,
  updateBankForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let authToken = '';

describe('UpdateBankByIdRoute', () => {
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

  it('should update a existing bank', async () => {
    const createBankRes = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    const modifiedBank = {
      ...createBankRes.body,
      name: 'Banco do Brasil 2',
      cnpj: '90.618.229/0001-87',
    };

    const updateBankRes = await updateBankForTests(
      request,
      appServer,
      modifiedBank,
      authToken,
    );

    expect(updateBankRes.statusCode).toEqual(200);
    expect(updateBankRes.body.name).toEqual(modifiedBank.name);
    expect(updateBankRes.body.cnpj).toEqual(modifiedBank.cnpj);
  });

  it('should not update bank without authorization token.', async () => {
    const createBankRes = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    const modifiedBank = {
      ...createBankRes.body,
      name: 'Giuseppe Guerra Mongiovi',
      cnpj: '90.618.229/0001-87',
    };

    const updateBankRes = await updateBankForTests(
      request,
      appServer,
      modifiedBank,
    );

    expect(updateBankRes.statusCode).toEqual(401);
    expect(updateBankRes.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to update with an invalid id.', async () => {
    const fakeBank: any = {
      id: '05766d27-f634-45ea-ac82-eb53ae5d67fe',
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    };

    const updateBankRes = await updateBankForTests(
      request,
      appServer,
      fakeBank,
      authToken,
    );

    expect(updateBankRes.statusCode).toEqual(404);
    expect(updateBankRes.body.message).toEqual(
      'No bank found with the given id.',
    );
  });

  it('should not be able to update a bank with a taken cnpj.', async () => {
    const createBankBBRes = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    const createBankItauRes = await createBankForTests(
      request,
      appServer,
      'Itaú',
      '20.543.290/0001-27',
      authToken,
    );

    const modifiedBankBB = {
      ...createBankBBRes.body,
      name: 'Giuseppe Guerra Mongiovi',
      cnpj: createBankItauRes.body.cnpj,
    };

    const updateBankRes = await updateBankForTests(
      request,
      appServer,
      modifiedBankBB,
      authToken,
    );

    expect(updateBankRes.statusCode).toEqual(403);
    expect(updateBankRes.body.message).toEqual(
      'Bank with this CNPJ already exists.',
    );
  });

  it('should not be able to update a bank with an invalid cnpj.', async () => {
    const createBankRes = await createBankForTests(
      request,
      appServer,
      'Banco do Brasil',
      '00.000.000/0001-91',
      authToken,
    );

    const modifiedBank = {
      ...createBankRes.body,
      name: 'Giuseppe Guerra Mongiovi',
      cnpj: '11.111.111/1111-11',
    };

    const updateBankRes = await updateBankForTests(
      request,
      appServer,
      modifiedBank,
      authToken,
    );

    expect(updateBankRes.statusCode).toEqual(400);
    expect(updateBankRes.body.message).toEqual('Invalid CNPJ.');
  });
});
