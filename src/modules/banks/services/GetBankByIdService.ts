import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IBanksRepository from '../repositories/IBanksRepository';;

import Bank from '../infra/typeorm/entities/Bank';

interface IRequest {
  id: string;
}

@injectable()
class GetBankByIdService {
  constructor(
    @inject('BanksRepository')
    private banksRepository: IBanksRepository
  ) {}

  async execute({ id }: IRequest): Promise<Bank | undefined> {
    const bank = await this.banksRepository.findById(id);

    if(!bank) {
      throw new AppError('No bank found with the given id.', 404);
    }

    return bank;
  }
}

export default GetBankByIdService;
