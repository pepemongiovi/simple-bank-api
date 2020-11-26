/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import CreateUserService from '@modules/users/services/CreateUserService';
import UpdateUserService from '@modules/users/services/UpdateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import BCryptHashProvider from '@modules/users/providers/HashProvider/implementations/BCryptHashProvider';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';

let updateUser: UpdateUserService;
let createUser: CreateUserService;

describe('UpdateUser', () => {
  beforeAll(async () => {
    await createConnections();
  });

  afterAll(async () => {
    const connection = await getConnection();
    await connection.close();
  });

  beforeEach(async () => {
    await clearDb();

    const userRepository = new UsersRepository();
    const hasProvider = new BCryptHashProvider();

    createUser = new CreateUserService(
      hasProvider,
      userRepository
    );
    updateUser = new UpdateUserService(userRepository);
  });

  it('should be able to update a existing user.', async () => {
    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    expect(user).toHaveProperty('id');

    const modifiedUser = {
      ...user,
      name: 'Giuseppe Guerra Mongiovi',
    };

    const updatedUser = await updateUser.execute({
      user: modifiedUser,
    });

    expect(updatedUser).toMatchObject(modifiedUser);
  });

  it('should not be able to update with an invalid id.', async () => {
    const fakeUser: any = {
      id: '05766d27-f634-45ea-ac82-eb53ae5d67fe',
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    };

    await expect(
      updateUser.execute({
        user: fakeUser,
      }),
    ).rejects.toMatchObject(
      new AppError('No user found with the given id.', 404),
    );
  });
});
