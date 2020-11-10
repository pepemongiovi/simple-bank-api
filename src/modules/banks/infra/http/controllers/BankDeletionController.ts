import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import DeleteBankService from '@modules/banks/services/DeleteBankService';

export default class BankDeletionController {
  public async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const deleteBank = container.resolve(DeleteBankService);

    const bank = await deleteBank.execute({
      id,
    });

    return response.json(classToClass(bank));
  }
}
