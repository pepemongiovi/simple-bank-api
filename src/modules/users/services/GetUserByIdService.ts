import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';;

import User from '../infra/typeorm/entities/User';

interface IRequest {
  id: string;
}

@injectable()
class GetUserByIdService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  async execute({ id }: IRequest): Promise<User | undefined> {
    const user = await this.usersRepository.findById(id);

    if(!user) {
      throw new AppError('No user found with the given id.', 404);
    }

    return user;
  }
}

export default GetUserByIdService;
