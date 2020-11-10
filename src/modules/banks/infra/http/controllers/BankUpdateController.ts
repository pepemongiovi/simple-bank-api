import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import UpdateBankService from '@modules/banks/services/UpdateBankService';

export default class BankUpdateController {
  public async update(request: Request, response: Response): Promise<Response> {
    const { bank } = request.body;

    const updateBank = container.resolve(UpdateBankService);

    const updatedBank = await updateBank.execute({
      bank,
    });

    return response.json(classToClass(updatedBank));
  }
}
