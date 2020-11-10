import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IBanksRepository from '../repositories/IBanksRepository';;
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';

import Bank from '../infra/typeorm/entities/Bank';
import BanksRepository from '../infra/typeorm/repositories/BanksRepository';

interface IRequest {
  bank: Bank;
}

let banksRepository: BanksRepository;

@injectable()
class UpdateBankService {
  constructor() {
    banksRepository = new BanksRepository()
  }

  async execute({ bank }: IRequest): Promise<Bank> {
    const originalBank = await banksRepository.findById(bank.id);
    const isCNPJValid = cnpjValidator.isValid(bank.cnpj)
    const isCNPJTaken = await banksRepository.findByCNPJ(bank.cnpj) && originalBank?.cnpj !== bank.cnpj

    if(!originalBank) {
      throw new AppError('No bank found with the given id.', 404);
    }
    else if(!isCNPJValid) {
      throw new AppError('Invalid CNPJ.');
    }
    else if (isCNPJTaken) {
      throw new AppError('Bank with this CNPJ already exists.', 403);
    }

    const updatedBank = await banksRepository.save(bank)

    return updatedBank;
  }
}

export default UpdateBankService;
