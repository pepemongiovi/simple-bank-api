import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import CreateUserService from '@modules/users/services/CreateUserService';
import UpdateUserService from '@modules/users/services/UpdateUserService';
import AppError from '@shared/errors/AppError';

let fakeHashProvider = new FakeHashProvider;
let fakeUsersRepository: FakeUsersRepository;
let updateUser: UpdateUserService;
let createUser: CreateUserService;

describe('UpdateUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();

    createUser = new CreateUserService(
      fakeUsersRepository,
      fakeHashProvider
    );
    updateUser = new UpdateUserService(
      fakeUsersRepository
    );
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
      name: 'Giuseppe Guerra Mongiovi'
    }

    const updatedUser = await updateUser.execute({
      user: modifiedUser
    });

    expect(updatedUser).toMatchObject(
      modifiedUser
    );
  });

  it('should not be able to update with an invalid id.', async () => {
    const fakeUser: any = {
      id: '111',
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    }

    await expect(
      updateUser.execute({
        user: fakeUser
      })
    ).rejects.toMatchObject(
      new AppError('No user found with the given id.', 404)
    )
  });
});
