import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import CreateUserService from '@modules/users/services/CreateUserService';
import DeleteUserService from '@modules/users/services/DeleteUserService';
import AppError from '@shared/errors/AppError';

let fakeUsersRepository: FakeUsersRepository;
let fakeHashProvider: FakeHashProvider;

let deleteUser: DeleteUserService;
let createUser: CreateUserService;


describe('DeleteUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();

    createUser = new CreateUserService(
      fakeUsersRepository,
      fakeHashProvider
    );
    deleteUser = new DeleteUserService(
      fakeUsersRepository
    );
  });

  it('should be able to delete a existing user.', async () => {
    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    expect(user).toHaveProperty('id');

    const result = await deleteUser.execute({
      id: user.id
    });

    expect(result).toBe("User deleted!");
  });

  it('should not be able to delete with an invalid id.', async () => {
    const fakeUserId = '111'

    await expect(
      deleteUser.execute({
        id: fakeUserId
      })
    ).rejects.toMatchObject(
      new AppError('No user found with the given id.', 404)
    )
  });
});
