/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-unresolved */
import 'reflect-metadata';
import CreateBankService from '@modules/banks/services/CreateBankService';
import UpdateBankService from '@modules/banks/services/UpdateBankService';
import AppError from '@shared/errors/AppError';
import { clearDb } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';
import BanksRepository from '@modules/banks/infra/typeorm/repositories/BanksRepository';

let updateBank: UpdateBankService;
let createBank: CreateBankService;

describe('UpdateBankService', () => {
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
    updateBank = new UpdateBankService(banksRepository);
  });

  it('should be able to update a existing bank.', async () => {
    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91',
    });

    expect(bank).toHaveProperty('id');

    const modifiedBank = {
      ...bank,
      name: 'Banco do Brasil 2',
      cnpj: '90.618.229/0001-87',
    };

    const updatedBank = await updateBank.execute({
      bank: modifiedBank,
    });

    expect(updatedBank).toMatchObject(modifiedBank);
  });

  it('should not be able to update with an invalid id.', async () => {
    const fakeBank: any = {
      id: '05766d27-f634-45ea-ac82-eb53ae5d67fe',
      name: 'Giuseppe Mongiovi',
      cpf: '07346274407',
      password: '123456',
    };

    await expect(
      updateBank.execute({
        bank: fakeBank,
      }),
    ).rejects.toMatchObject(
      new AppError('No bank found with the given id.', 404),
    );
  });

  it('should not be able to update a bank with a taken cnpj.', async () => {
    const bankBB = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91',
    });

    const bankItau = await createBank.execute({
      name: 'Itaú',
      cnpj: '20.543.290/0001-27',
    });

    const modifiedBankBB = {
      ...bankBB,
      cnpj: bankItau.cnpj,
    };

    await expect(
      updateBank.execute({
        bank: modifiedBankBB,
      }),
    ).rejects.toMatchObject(
      new AppError('Bank with this CNPJ already exists.', 403),
    );
  });

  it('should not be able to update a bank with an invalid cnpj.', async () => {
    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91',
    });

    const modifiedBank = {
      ...bank,
      cnpj: '11.111.111/1111-11',
    };

    await expect(
      updateBank.execute({
        bank: modifiedBank,
      }),
    ).rejects.toMatchObject(new AppError('Invalid CNPJ.', 400));
  });
});
