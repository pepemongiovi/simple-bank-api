/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import CreateBankService from '@modules/banks/services/CreateBankService';
import GetBankByIdService from '@modules/banks/services/GetBankByIdService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';

let getBankById: GetBankByIdService;
let createBank: CreateBankService;

describe('GetByIdBankService', () => {
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
    getBankById = new GetBankByIdService(banksRepository);
  });

  it('should be able to get a existing bank.', async () => {
    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91',
    });

    expect(bank).toHaveProperty('id');

    const fetchedBank = await getBankById.execute({
      id: bank.id,
    });

    expect(fetchedBank).toMatchObject(bank);
  });

  it('should not be able to find a bank with an invalid id.', async () => {
    const fakeBankId = '05766d27-f634-45ea-ac82-eb53ae5d67fe';

    await expect(
      getBankById.execute({
        id: fakeBankId,
      }),
    ).rejects.toMatchObject(
      new AppError('No bank found with the given id.', 404),
    );
  });
});
