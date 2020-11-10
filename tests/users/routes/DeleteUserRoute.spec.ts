/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import User from '@modules/users/infra/typeorm/entities/User';
import {
  clearDb,
  createUserAndAuthenticateForTests,
  deleteUserForTests,
} from '@shared/helpers/helper';

const request = require('supertest');
const appServer = require('@shared/infra/http/server');

let authToken = '';
let newUser: User;

describe('DeleteUserRoute', () => {
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
  });

  it('should delete a existing user', async () => {
    const deleteUserRes = await deleteUserForTests(
      request,
      appServer,
      newUser.id,
      authToken,
    );

    expect(deleteUserRes.statusCode).toEqual(200);
    expect(deleteUserRes.body).toEqual('User deleted!');
  });

  it('should not create a new user without authorization token.', async () => {
    const deleteUserRes = await deleteUserForTests(
      request,
      appServer,
      newUser.id,
    );

    expect(deleteUserRes.statusCode).toEqual(401);
    expect(deleteUserRes.body.message).toEqual('Invalid JWT token');
  });

  it('should not be able to delete a user with an invalid id.', async () => {
    const fakeUserId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    const res = await deleteUserForTests(
      request,
      appServer,
      fakeUserId,
      authToken,
    );

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('No user found with the given id.');
  });
});
