import { injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import User from '../infra/typeorm/entities/User';
import UsersRepository from '../infra/typeorm/repositories/UsersRepository';

interface IRequest {
  user: User;
}

let usersRepository: UsersRepository;

@injectable()
class UpdateUserService {
  constructor() {
    usersRepository = new UsersRepository();
  }

  async execute({ user }: IRequest): Promise<User> {
    const originalUser = await usersRepository.findById(user.id);
    const isCPFValid = cpfValidator.isValid(user.cpf);
    const isCPFTaken =
      (await usersRepository.findByCPF(user.cpf)) &&
      user.cpf !== originalUser?.cpf;

    if (!originalUser) {
      throw new AppError('No user found with the given id.', 404);
    } else if (!isCPFValid) {
      throw new AppError('Invalid CPF.');
    } else if (isCPFTaken) {
      throw new AppError('User with this CPF already exists.', 403);
    }

    const updatedUser = await usersRepository.save(user);

    return updatedUser;
  }
}

export default UpdateUserService;
