import "reflect-metadata"
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';

let createUser: CreateUserService;

describe('CreateUser', () => {
  beforeAll(async() => {
    await createConnections()
  })

  afterAll(async() => {
    const connection = await getConnection()
    await connection.close()
  })

  beforeEach(async () => {
    await clearDb()

    createUser = new CreateUserService();
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
      })
    ).rejects.toMatchObject(
      new AppError('User with this CPF already exists.', 403)
    );
  });

  it('should not be able to create a new user with an invalid cpf.', async () => {
    await expect(
      createUser.execute({
        name: 'Giuseppe Mongiovi',
        cpf: '07346274400',
        password: '123456',
      })
    ).rejects.toMatchObject(
      new AppError('Invalid CPF.')
    );
  });
});
