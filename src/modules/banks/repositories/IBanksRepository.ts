import Bank from '../infra/typeorm/entities/Bank';
import ICreateBankDTO from '../dtos/ICreateBankDTO';

export default interface IBanksRepository {
  findById(id: string): Promise<Bank | undefined>;
  findByCNPJ(cnpj: string): Promise<Bank | undefined>;
  create(data: ICreateBankDTO): Promise<Bank>;
  save(bank: Bank): Promise<Bank>;
  delete(id: string): Promise<string>;
}
