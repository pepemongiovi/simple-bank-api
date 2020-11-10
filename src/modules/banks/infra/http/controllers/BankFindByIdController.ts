import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import GetBankByIdService from '@modules/banks/services/GetBankByIdService';

export default class BankFindByIdController {
  public async getById(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { id } = request.params;

    const getBankById = container.resolve(GetBankByIdService);

    const bank = await getBankById.execute({
      id,
    });

    return response.json(classToClass(bank));
  }
}
