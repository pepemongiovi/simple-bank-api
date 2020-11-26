/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import CreateBankService from '@modules/banks/services/CreateBankService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';

let createBank: CreateBankService;

describe('CreateBankService', () => {
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
  });

  it('should be able to create a new bank.', async () => {
    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91',
    });

    expect(bank).toHaveProperty('id');
  });

  it('should not be able to create a new bank with same cnpj from another.', async () => {
    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91',
    });

    expect(bank).toHaveProperty('id');

    await expect(
      createBank.execute({
        name: 'Banco do Brasil Copy',
        cnpj: '00.000.000/0001-91',
      }),
    ).rejects.toMatchObject(
      new AppError('Bank with this CNPJ already exists.', 403),
    );
  });

  it('should not be able to create a new bank with an invalid cnpj.', async () => {
    await expect(
      createBank.execute({
        name: 'Banco do Brasil Copy',
        cnpj: '00.000.000/1111-11',
      }),
    ).rejects.toMatchObject(new AppError('Invalid CNPJ.'));
  });
});
