import "reflect-metadata"
import { injectable, inject } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import IBanksRepository from '../repositories/IBanksRepository';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';

import Bank from '../infra/typeorm/entities/Bank';
import BanksRepository from "../infra/typeorm/repositories/BanksRepository";
import banksRouter from "../infra/http/routes/banks.routes";

interface IRequest {
  name: string;
  cnpj: string;
}

let banksRepository: BanksRepository

@injectable()
class CreateBankService {
  constructor() {
    banksRepository = new BanksRepository()
  }

  async execute({ name, cnpj }: IRequest): Promise<Bank> {
    const isCNPJValid = cnpjValidator.isValid(cnpj)
    const isCNPJTaken = await banksRepository.findByCNPJ(cnpj);

    if(!isCNPJValid) {
      throw new AppError('Invalid CNPJ.');
    }
    else if (isCNPJTaken) {
      throw new AppError('Bank with this CNPJ already exists.', 403);
    }

    const bank = await banksRepository.create({
      name,
      cnpj
    });

    return bank;
  }
}

export default CreateBankService;
