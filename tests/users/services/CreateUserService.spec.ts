/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import BCryptHashProvider from '@modules/users/providers/HashProvider/implementations/BCryptHashProvider';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';

let createUser: CreateUserService;

describe('CreateUser', () => {
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
  });

  it('should be able to create a new user.', async () => {
    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    expect(user).toHaveProperty('id');
  });

  it('should not be able to create a new user with same cpf from another.', async () => {
    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    expect(user).toHaveProperty('id');

    await expect(
      createUser.execute({
        name: 'Giuseppe Mongiovi',
        cpf: '07346274407',
        password: '123456',
      }),
    ).rejects.toMatchObject(
      new AppError('User with this CPF already exists.', 403),
    );
  });

  it('should not be able to create a new user with an invalid cpf.', async () => {
    await expect(
      createUser.execute({
        name: 'Giuseppe Mongiovi',
        cpf: '07346274400',
        password: '123456',
      }),
    ).rejects.toMatchObject(new AppError('Invalid CPF.'));
  });
});
