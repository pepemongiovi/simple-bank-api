import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import Bank from '../infra/typeorm/entities/Bank';
import IBanksRepository from '../repositories/IBanksRepository';

interface IRequest {
  id: string;
}

@injectable()
class GetBankByIdService {
  constructor(
    @inject('BanksRepository')
    private banksRepository: IBanksRepository,
  ) { }

  async execute({ id }: IRequest): Promise<Bank | undefined> {
    const bank = await this.banksRepository.findById(id);

    if (!bank) {
      throw new AppError('No bank found with the given id.', 404);
    }

    return bank;
  }
}

export default GetBankByIdService;
