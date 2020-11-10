import FakeBanksRepository from '@modules/banks/repositories/fakes/FakeBanksRepository';
import CreateBankService from '@modules/banks/services/CreateBankService';
import GetBankByIdService from '@modules/banks/services/GetBankByIdService';
import AppError from '@shared/errors/AppError';

let fakeBanksRepository: FakeBanksRepository;
let getBankById: GetBankByIdService;
let createBank: CreateBankService;


describe('GetByIdBankService', () => {
  beforeEach(() => {
    fakeBanksRepository = new FakeBanksRepository();

    createBank = new CreateBankService(
      fakeBanksRepository
    );
    getBankById = new GetBankByIdService(
      fakeBanksRepository
    );
  });

  it('should be able to get a existing bank.', async () => {
    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91'
    });

    expect(bank).toHaveProperty('id');

    const fetchedBank = await getBankById.execute({
      id: bank.id
    });

    expect(fetchedBank).toMatchObject(
      bank
    )
  });

  it('should not be able to find a bank with an invalid id.', async () => {
    const fakeBankId = '111'

    await expect(
      getBankById.execute({
        id: fakeBankId
      })
    ).rejects.toMatchObject(
      new AppError('No bank found with the given id.', 404)
    )
  });
});
