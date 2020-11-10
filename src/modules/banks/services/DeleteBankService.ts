import { injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import BanksRepository from '../infra/typeorm/repositories/BanksRepository';

interface IRequest {
  id: string;
}

let banksRepository: BanksRepository;

@injectable()
class DeleteBankService {
  constructor() {
    banksRepository = new BanksRepository();
  }

  async execute({ id }: IRequest): Promise<string> {
    const bank = await banksRepository.findById(id);

    if (!bank) {
      throw new AppError('No bank found with the given id.', 404);
    }

    const result = await banksRepository.delete(id);

    return result;
  }
}

export default DeleteBankService;
