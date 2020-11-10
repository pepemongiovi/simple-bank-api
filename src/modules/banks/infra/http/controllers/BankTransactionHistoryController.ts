import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import BankTransactionHistoryService from '@modules/banks/services/BankTransactionHistoryService';

export default class BankTransactionHistoryController {
  public async getHistory(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { account_id, from_date, to_date } = request.body;

    const bankTransactionHistory = container.resolve(
      BankTransactionHistoryService,
    );

    const transactionHistory = await bankTransactionHistory.execute({
      account_id,
      from_date,
      to_date,
    });

    return response.json(classToClass(transactionHistory));
  }
}
