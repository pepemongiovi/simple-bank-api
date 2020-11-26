import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IAccountsRepository from '../repositories/IAccountsRepository';

interface IRequest {
  id: string;
}
@injectable()
class DeleteAccountService {
  constructor(
    @inject('AccountsRepository')
    private accountsRepository: IAccountsRepository
  ) {
  }

  async execute({ id }: IRequest): Promise<string> {
    const account = await this.accountsRepository.findById(id);

    if (!account) {
      throw new AppError('No account found with the given id.', 404);
    }

    const result = await this.accountsRepository.delete(id);

    return result;
  }
}

export default DeleteAccountService;
