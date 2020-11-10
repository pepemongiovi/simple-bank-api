import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';
import IHashProvider from '../providers/HashProvider/models/IHashProvider';
import { cpf as cpfValidator } from 'cpf-cnpj-validator';

import User from '../infra/typeorm/entities/User';
import UsersRepository from '../infra/typeorm/repositories/UsersRepository';
import BCryptHashProvider from '../providers/HashProvider/implementations/BCryptHashProvider';

interface IRequest {
  name: string;
  cpf: string;
  password: string;
}

let usersRepository: UsersRepository
let hashProvider: BCryptHashProvider

@injectable()
class CreateUserService {
  constructor() {
    hashProvider = new BCryptHashProvider()
    usersRepository = new UsersRepository()
  }

  async execute({ name, cpf, password }: IRequest): Promise<User> {
    const isCPFValid = cpfValidator.isValid(cpf)
    const isCPFTaken = await usersRepository.findByCPF(cpf);

    if(!isCPFValid) {
      throw new AppError('Invalid CPF.');
    }
    else if(isCPFTaken) {
      throw new AppError('User with this CPF already exists.', 403);
    }

    const hashedPassword = await hashProvider.generateHash(password);

    const user = await usersRepository.create({
      name,
      cpf,
      password: hashedPassword,
    });

    return user;
  }
}

export default CreateUserService;
