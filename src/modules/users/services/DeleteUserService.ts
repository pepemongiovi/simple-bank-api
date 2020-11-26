import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  id: string;
}

@injectable()
class DeleteUserService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  async execute({ id }: IRequest): Promise<string> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new AppError('No user found with the given id.', 404);
    }

    const result = await this.usersRepository.delete(id);

    return result;
  }
}

export default DeleteUserService;
