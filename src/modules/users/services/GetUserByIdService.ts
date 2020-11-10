import { injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import User from '../infra/typeorm/entities/User';
import UsersRepository from '../infra/typeorm/repositories/UsersRepository';

interface IRequest {
  id: string;
}

let usersRepository: UsersRepository;

@injectable()
class GetUserByIdService {
  constructor() {
    usersRepository = new UsersRepository();
  }

  async execute({ id }: IRequest): Promise<User | undefined> {
    const user = await usersRepository.findById(id);

    if (!user) {
      throw new AppError('No user found with the given id.', 404);
    }

    return user;
  }
}

export default GetUserByIdService;
