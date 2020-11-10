import { injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import UsersRepository from '../infra/typeorm/repositories/UsersRepository';

interface IRequest {
  id: string;
}

let usersRepository: UsersRepository;

@injectable()
class DeleteUserService {
  constructor() {
    usersRepository = new UsersRepository();
  }

  async execute({ id }: IRequest): Promise<string> {
    const user = await usersRepository.findById(id);

    if (!user) {
      throw new AppError('No user found with the given id.', 404);
    }

    const result = await usersRepository.delete(id);

    return result;
  }
}

export default DeleteUserService;
