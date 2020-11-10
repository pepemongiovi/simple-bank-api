import FakeHashProvider from '@modules/users/providers/HashProvider/fakes/FakeHashProvider';
import FakeUsersRepository from '@modules/users/repositories/fakes/FakeUsersRepository';
import CreateUserService from '@modules/users/services/CreateUserService';
import GetUserByIdService from '@modules/users/services/GetUserByIdService';
import AppError from '@shared/errors/AppError';

let fakeHashProvider = new FakeHashProvider();
let fakeUsersRepository: FakeUsersRepository;
let getUserById: GetUserByIdService;
let createUser: CreateUserService;


describe('GetByIdUser', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeHashProvider = new FakeHashProvider();

    createUser = new CreateUserService(
      fakeUsersRepository,
      fakeHashProvider
    );
    getUserById = new GetUserByIdService(
      fakeUsersRepository
    );
  });

  it('should be able to get a existing user.', async () => {
    const user = await createUser.execute({
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    });

    expect(user).toHaveProperty('id');

    const fetchedUser = await getUserById.execute({
      id: user.id
    });

    expect(fetchedUser).toMatchObject(
      user
    )
  });

  it('should not be able to find a user with an invalid id.', async () => {
    const fakeUserId = '111'

    await expect(
      getUserById.execute({
        id: fakeUserId
      })
    ).rejects.toMatchObject(
      new AppError('No user found with the given id.', 404)
    )
  });
});
