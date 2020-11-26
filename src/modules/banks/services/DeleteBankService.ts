import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IBanksRepository from '../repositories/IBanksRepository';

interface IRequest {
  id: string;
}

@injectable()
class DeleteBankService {
  constructor(
    @inject('BanksRepository')
    private banksRepository: IBanksRepository,
  ) { }

  async execute({ id }: IRequest): Promise<string> {
    const bank = await this.banksRepository.findById(id);

    if (!bank) {
      throw new AppError('No bank found with the given id.', 404);
    }

    const result = await this.banksRepository.delete(id);

    return result;
  }
}

export default DeleteBankService;
