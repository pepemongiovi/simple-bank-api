import FakeBanksRepository from '@modules/banks/repositories/fakes/FakeBanksRepository';
import CreateBankService from '@modules/banks/services/CreateBankService';
import DeleteBankService from '@modules/banks/services/DeleteBankService';
import AppError from '@shared/errors/AppError';

let fakeBanksRepository: FakeBanksRepository;

let deleteBank: DeleteBankService;
let createBank: CreateBankService;

describe('DeleteBankService', () => {
  beforeEach(() => {
    fakeBanksRepository = new FakeBanksRepository();

    createBank = new CreateBankService(
      fakeBanksRepository
    );
    deleteBank = new DeleteBankService(
      fakeBanksRepository
    );
  });

  it('should be able to delete a existing bank.', async () => {
    const bank = await createBank.execute({
      name: 'Banco do Brasil',
      cnpj: '00.000.000/0001-91'
    });

    expect(bank).toHaveProperty('id');

    const result = await deleteBank.execute({
      id: bank.id
    });

    expect(result).toBe("Bank deleted!");
  });

  it('should not be able to delete with an invalid id.', async () => {
    const fakeBankId = '111'

    await expect(
      deleteBank.execute({
        id: fakeBankId
      })
    ).rejects.toMatchObject(
      new AppError('No bank found with the given id.', 404)
    )
  });
});
