import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateBankService from '@modules/banks/services/CreateBankService';

export default class BankRegistrationController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, cnpj } = request.body;

    const createBank = container.resolve(CreateBankService);

    const bank = await createBank.execute({
      name,
      cnpj,
    });

    return response.json(classToClass(bank));
  }
}
