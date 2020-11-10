/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import User from '@modules/users/infra/typeorm/entities/User';
import {
  clearDb,
  createUserAndAuthenticateForTests,
  getUserByIdForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let authToken = '';
let newUser: User;

describe('GetUserByIdRoute', () => {
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

  it('should get a existing user', async () => {
    const getByIdRes = await getUserByIdForTests(
      request,
      appServer,
      newUser.id,
      authToken,
    );

    expect(getByIdRes.statusCode).toEqual(200);
    expect(getByIdRes.body).toMatchObject(newUser);
  });

  it('should not get a user without authorization token.', async () => {
    const getByIdRes = await getUserByIdForTests(
      request,
      appServer,
      newUser.id,
    );

    expect(getByIdRes.statusCode).toEqual(401);
    expect(getByIdRes.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to get a user with an invalid id.', async () => {
    const fakeUserId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    const getByIdRes = await getUserByIdForTests(
      request,
      appServer,
      fakeUserId,
      authToken,
    );

    expect(getByIdRes.statusCode).toEqual(404);
    expect(getByIdRes.body.message).toEqual('No user found with the given id.');
  });
});
