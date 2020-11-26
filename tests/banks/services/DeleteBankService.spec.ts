/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import CreateBankService from '@modules/banks/services/CreateBankService';
import DeleteBankService from '@modules/banks/services/DeleteBankService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';

let deleteBank: DeleteBankService;
let createBank: CreateBankService;

describe('DeleteBankService', () => {
  beforeAll(async () => {
    await createConnections();
  });

  afterAll(async () => {
    const connection = await getConnection();
    await connection.close();
  });

  beforeEach(async () => {
    await clearDb();

    const banksRepository = new BanksRepository();

    createBank = new CreateBankService(banksRepository);
    deleteBank = new DeleteBankService(banksRepository);
  });

  it('should be able to delete a existing bank.', async () => {
    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91',
    });

    expect(bank).toHaveProperty('id');

    const result = await deleteBank.execute({
      id: bank.id,
    });

    expect(result).toBe('Bank deleted!');
  });

  it('should not be able to delete with an invalid id.', async () => {
    const fakeBankId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    await expect(
      deleteBank.execute({
        id: fakeBankId,
      }),
    ).rejects.toMatchObject(
      new AppError('No bank found with the given id.', 404),
    );
  });
});
