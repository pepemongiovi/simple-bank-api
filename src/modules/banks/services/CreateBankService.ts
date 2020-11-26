import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';
import Bank from '../infra/typeorm/entities/Bank';
import IBanksRepository from '../repositories/IBanksRepository';

interface IRequest {
  name: string;
  cnpj: string;
}

@injectable()
class CreateBankService {
  constructor(
    @inject('BanksRepository')
    private banksRepository: IBanksRepository,
  ) {}

  async execute({ name, cnpj }: IRequest): Promise<Bank> {
    const isCNPJValid = cnpjValidator.isValid(cnpj);
    const isCNPJTaken = await this.banksRepository.findByCNPJ(cnpj);

    if (!isCNPJValid) {
      throw new AppError('Invalid CNPJ.');
    } else if (isCNPJTaken) {
      throw new AppError('Bank with this CNPJ already exists.', 403);
    }

    const bank = await this.banksRepository.create({
      name,
      cnpj,
    });

    return bank;
  }
}

export default CreateBankService;
