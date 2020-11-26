/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import CreateUserService from '@modules/users/services/CreateUserService';
import DeleteUserService from '@modules/users/services/DeleteUserService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import BCryptHashProvider from '@modules/users/providers/HashProvider/implementations/BCryptHashProvider';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';

let deleteUser: DeleteUserService;
let createUser: CreateUserService;

describe('DeleteUser', () => {
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
    deleteUser = new DeleteUserService(userRepository);
  });

  it('should be able to delete a existing user.', async () => {
    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    expect(user).toHaveProperty('id');

    const result = await deleteUser.execute({
      id: user.id,
    });

    expect(result).toBe('User deleted!');
  });

  it('should not be able to delete with an invalid id.', async () => {
    const fakeUserId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    await expect(
      deleteUser.execute({
        id: fakeUserId,
      }),
    ).rejects.toMatchObject(
      new AppError('No user found with the given id.', 404),
    );
  });
});
