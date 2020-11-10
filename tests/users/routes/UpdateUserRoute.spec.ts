/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import User from '@modules/users/infra/typeorm/entities/User';
import {
  clearDb,
  createUserAndAuthenticateForTests,
  updateUserForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let authToken = '';
let newUser: User;

describe('UpdateUserRoute', () => {
  beforeEach(async () => {
    await clearDb();

    const { user, token } = await createUserAndAuthenticateForTests(
      request,
      appServer,
      'Giuseppe Mongiovi',
      '07346274407',
    );

    authToken = token;
    newUser = user;
  });

  it('should update a existing user', async () => {
    const modifiedUser = {
      ...newUser,
      name: 'Giuseppe Guerra Mongiovi',
      cpf: '496.798.140-25',
    };

    const updateUserRes = await updateUserForTests(
      request,
      appServer,
      modifiedUser,
      authToken,
    );

    expect(updateUserRes.statusCode).toEqual(200);
    expect(updateUserRes.body.name).toEqual(modifiedUser.name);
    expect(updateUserRes.body.cpf).toEqual(modifiedUser.cpf);
  });

  it('should not update user without authorization token.', async () => {
    const modifiedUser = {
      ...newUser,
      name: 'Giuseppe Guerra Mongiovi',
      cpf: '496.798.140-25',
    };

    const updateUserRes = await updateUserForTests(
      request,
      appServer,
      modifiedUser,
    );

    expect(updateUserRes.statusCode).toEqual(401);
    expect(updateUserRes.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to update with an invalid id.', async () => {
    const fakeUser: any = {
      ...newUser,
      id: '05766d27-f634-45ea-ac82-eb53ae5d67fe',
    };

    const updateUserRes = await updateUserForTests(
      request,
      appServer,
      fakeUser,
      authToken,
    );

    expect(updateUserRes.statusCode).toEqual(404);
    expect(updateUserRes.body.message).toEqual(
      'No user found with the given id.',
    );
  });

  it('should not be able to update a user with a taken cpf.', async () => {
    const { user } = await createUserAndAuthenticateForTests(
      request,
      appServer,
      'Jader Freitas',
      '298.898.300-35',
    );

    const modifiedUser = {
      ...newUser,
      cpf: user.cpf,
    };

    const updateUserRes = await updateUserForTests(
      request,
      appServer,
      modifiedUser,
      authToken,
    );

    expect(updateUserRes.statusCode).toEqual(403);
    expect(updateUserRes.body.message).toEqual(
      'User with this CPF already exists.',
    );
  });

  it('should not be able to update a user with an invalid cpf.', async () => {
    const modifiedUser = {
      ...newUser,
      cpf: '11111111111',
    };

    const updateUserRes = await updateUserForTests(
      request,
      appServer,
      modifiedUser,
      authToken,
    );

    expect(updateUserRes.statusCode).toEqual(400);
    expect(updateUserRes.body.message).toEqual('Invalid CPF.');
  });
});
