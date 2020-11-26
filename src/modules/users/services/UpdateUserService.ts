import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import User from '../infra/typeorm/entities/User';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  user: User;
}

@injectable()
class UpdateUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  async execute({ user }: IRequest): Promise<User> {
    const originalUser = await this.usersRepository.findById(user.id);
    const isCPFValid = cpfValidator.isValid(user.cpf);
    const isCPFTaken =
      (await this.usersRepository.findByCPF(user.cpf)) &&
      user.cpf !== originalUser?.cpf;

    if (!originalUser) {
      throw new AppError('No user found with the given id.', 404);
    } else if (!isCPFValid) {
      throw new AppError('Invalid CPF.');
    } else if (isCPFTaken) {
      throw new AppError('User with this CPF already exists.', 403);
    }

    const updatedUser = await this.usersRepository.save(user);

    return updatedUser;
  }
}

export default UpdateUserService;
