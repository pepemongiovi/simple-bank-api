import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import User from '../infra/typeorm/entities/User';
import IUsersRepository from '../repositories/IUsersRepository';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';

interface IRequest {
  name: string;
  cpf: string;
  password: string;
}

@injectable()
class CreateUserService {
  constructor(
    @inject('HashProvider')
    private hashProvider: IHashProvider,
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}
  async execute({ name, cpf, password }: IRequest): Promise<User> {
    const isCPFValid = cpfValidator.isValid(cpf);
    const isCPFTaken = await this.usersRepository.findByCPF(cpf);

    if (!isCPFValid) {
      throw new AppError('Invalid CPF.');
    } else if (isCPFTaken) {
      throw new AppError('User with this CPF already exists.', 403);
    }

    const hashedPassword = await this.hashProvider.generateHash(password);

    const user = await this.usersRepository.create({
      name,
      cpf,
      password: hashedPassword,
    });

    return user;
  }
}

export default CreateUserService;
