import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import AuthenticateUserService from '@modules/users/services/AuthenticateUserService';
import AppError from '@shared/errors/AppError';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;
let authenticateUser: AuthenticateUserService;

describe('AuthenticateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();
    authenticateUser = new AuthenticateUserService(
      fakeUsersRepository,
      fakeHashProvider,
    );
  });

  it('should be able to authenticate', async () => {
    const user = await fakeUsersRepository.create({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    const response = await authenticateUser.execute({
      cpf: '07346274407',
      password: '123456',
    });

    expect(response).toHaveProperty('token');
    expect(response.user).toEqual(user);
  });

  it('should not be able to authenticate with non existing user.', async () => {
    await expect(
      authenticateUser.execute({
        cpf: '07346274407',
        password: '123456',
      }),
    ).rejects.toMatchObject(
      new AppError('No user was found with the given CPF.', 404)
    );
  });

  it('should not be able to authenticate with wrong password.', async () => {
    await fakeUsersRepository.create({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    await expect(
      authenticateUser.execute({
        cpf: '07346274407',
        password: 'worng password',
      }),
    ).rejects.toMatchObject(
      new AppError('Incorrect password.', 401)
    );
  });
});
