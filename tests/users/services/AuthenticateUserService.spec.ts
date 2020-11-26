/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import AuthenticateUserService from '@modules/users/services/AuthenticateUserService';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import BCryptHashProvider from '@modules/users/providers/HashProvider/implementations/BCryptHashProvider';
import UsersRepository from '@modules/users/infra/typeorm/repositories/UsersRepository';

let authenticateUser: AuthenticateUserService;
let createUserService: CreateUserService;

describe('AuthenticateUser', () => {
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

    createUserService = new CreateUserService(
      hasProvider,
      userRepository
    );
    authenticateUser = new AuthenticateUserService(
      hasProvider,
      userRepository,
    );
  });

  it('should be able to authenticate', async () => {
    const user = await createUserService.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    const response = await authenticateUser.execute({
      cpf: user.cpf,
      password: '123456',
    });

    expect(response).toHaveProperty('token');
    expect(response.user.cpf).toEqual(user.cpf);
  });

  it('should not be able to authenticate with non existing user.', async () => {
    await expect(
      authenticateUser.execute({
        cpf: '07346274407',
        password: '123456',
      }),
    ).rejects.toMatchObject(
      new AppError('No user was found with the given CPF.', 404),
    );
  });

  it('should not be able to authenticate with wrong password.', async () => {
    await createUserService.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    await expect(
      authenticateUser.execute({
        cpf: '07346274407',
        password: 'worng password',
      }),
    ).rejects.toMatchObject(new AppError('Incorrect password.', 401));
  });
});
