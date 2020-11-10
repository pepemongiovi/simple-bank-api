import { v4 } from 'uuid';

import IBanksRepository from '@modules/banks/repositories/IBanksRepository';
import ICreateBankDTO from '@modules/banks/dtos/ICreateBankDTO';

import Bank from '../../infra/typeorm/entities/Bank';

class FakeBanksRepository implements IBanksRepository {
  private banks: Bank[] = [];

  public async findById(id: string): Promise<Bank | undefined> {
    const findBank = this.banks.find((bank) => bank.id === id);

    return findBank;
  }

  public async findByCNPJ(cnpj: string): Promise<Bank | undefined> {
    const findBank = this.banks.find((bank) => bank.cnpj === cnpj);

    return findBank;
  }

  public async create(bankData: ICreateBankDTO): Promise<Bank> {
    const bank = new Bank();

    Object.assign(bank, { id: v4() }, bankData);

    this.banks.push(bank);

    return bank;
  }

  public async save(bank: Bank): Promise<Bank> {
    const findIndex = this.banks.findIndex(
      (findBank) => findBank.id === bank.id,
    );

    this.banks[findIndex] = bank;

    return bank;
  }

  public async delete(id: string): Promise<any> {
    this.banks = this.banks.filter(bank => bank.id !== id)

    return "Bank deleted!";
  }
}

export default FakeBanksRepository;
