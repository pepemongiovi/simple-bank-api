import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import CreateUserService from '@modules/users/services/CreateUserService';
import AppError from '@shared/errors/AppError';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let createUser: CreateUserService;

describe('CreateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();

    createUser = new CreateUserService(
      fakeUsersRepository,
      fakeHashProvider
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
