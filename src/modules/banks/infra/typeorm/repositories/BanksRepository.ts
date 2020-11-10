import { Repository, getRepository } from 'typeorm';

import IBanksRepository from '@modules/banks/repositories/IBanksRepository';
import ICreateBankDTO from '@modules/banks/dtos/ICreateBankDTO';

import Bank from '../entities/Bank';

class BanksRepository implements IBanksRepository {
  private ormRepository: Repository<Bank>;

  constructor() {
    this.ormRepository = getRepository(Bank);
  }

  public async findById(id: string): Promise<Bank | undefined> {
    const bank = await this.ormRepository.findOne(id);
    return bank;
  }

  public async findByCNPJ(cnpj: string): Promise<Bank | undefined> {
    const bank = await this.ormRepository.findOne({ where: { cnpj } });
    return bank;
  }

  public async create(bankData: ICreateBankDTO): Promise<Bank> {
    const bank = this.ormRepository.create(bankData);

    await this.ormRepository.save(bank);

    return bank;
  }

  public async save(bank: Bank): Promise<Bank> {
    return this.ormRepository.save(bank);
  }

  public async delete(id: string): Promise<string> {
    await this.ormRepository.delete(id);
    return 'Bank deleted!';
  }
}

export default BanksRepository;
