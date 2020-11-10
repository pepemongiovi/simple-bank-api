/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import CreateUserService from '@modules/users/services/CreateUserService';
import GetUserByIdService from '@modules/users/services/GetUserByIdService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';

let getUserById: GetUserByIdService;
let createUser: CreateUserService;

describe('GetByIdUser', () => {
  beforeAll(async () => {
    await createConnections();
  });

  afterAll(async () => {
    const connection = await getConnection();
    await connection.close();
  });

  beforeEach(async () => {
    await clearDb();

    createUser = new CreateUserService();
    getUserById = new GetUserByIdService();
  });

  it('should be able to get a existing user.', async () => {
    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    expect(user).toHaveProperty('id');

    const fetchedUser = await getUserById.execute({
      id: user.id,
    });

    expect(fetchedUser).toMatchObject(user);
  });

  it('should not be able to find a user with an invalid id.', async () => {
    const fakeUserId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    await expect(
      getUserById.execute({
        id: fakeUserId,
      }),
    ).rejects.toMatchObject(
      new AppError('No user found with the given id.', 404),
    );
  });
});
