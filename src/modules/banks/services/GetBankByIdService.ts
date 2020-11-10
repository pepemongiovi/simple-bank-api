import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IBanksRepository from '../repositories/IBanksRepository';;

import Bank from '../infra/typeorm/entities/Bank';
import BanksRepository from '../infra/typeorm/repositories/BanksRepository';

interface IRequest {
  id: string;
}

let banksRepository: BanksRepository;

@injectable()
class GetBankByIdService {
  constructor() {
    banksRepository = new BanksRepository()
  }

  async execute({ id }: IRequest): Promise<Bank | undefined> {
    const bank = await banksRepository.findById(id);

    if(!bank) {
      throw new AppError('No bank found with the given id.', 404);
    }

    return bank;
  }
}

export default GetBankByIdService;
