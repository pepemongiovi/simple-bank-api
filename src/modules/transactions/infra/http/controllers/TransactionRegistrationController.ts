// index, show, create, update,
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateTransactionService from '@modules/transactions/services/CreateTransactionService';

export default class TransactionRegistrationController {
  public async create(request: Request, response: Response): Promise<Response> {
    const {
      from_account_id,
      to_account_id,
      type,
      value,
      bonusValue,
      transactionCost,
    } = request.body;

    const createTransaction = container.resolve(CreateTransactionService);

    const transaction = await createTransaction.execute({
      from_account_id,
      to_account_id,
      type,
      value,
      bonusValue,
      transactionCost,
    });

    return response.json(classToClass(transaction));
  }
}
