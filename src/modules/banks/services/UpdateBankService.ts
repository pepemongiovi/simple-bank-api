import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';
import Bank from '../infra/typeorm/entities/Bank';
import IBanksRepository from '../repositories/IBanksRepository';

interface IRequest {
  bank: Bank;
}


@injectable()
class UpdateBankService {
  constructor(
    @inject('BanksRepository')
    private banksRepository: IBanksRepository,
  ) { }

  async execute({ bank }: IRequest): Promise<Bank> {
    const originalBank = await this.banksRepository.findById(bank.id);
    const isCNPJValid = cnpjValidator.isValid(bank.cnpj);
    const isCNPJTaken =
      (await this.banksRepository.findByCNPJ(bank.cnpj)) &&
      originalBank?.cnpj !== bank.cnpj;

    if (!originalBank) {
      throw new AppError('No bank found with the given id.', 404);
    } else if (!isCNPJValid) {
      throw new AppError('Invalid CNPJ.');
    } else if (isCNPJTaken) {
      throw new AppError('Bank with this CNPJ already exists.', 403);
    }

    const updatedBank = await this.banksRepository.save(bank);

    return updatedBank;
  }
}

export default UpdateBankService;
