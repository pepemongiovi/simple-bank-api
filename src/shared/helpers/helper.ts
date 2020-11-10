import Transaction, { TransactionType } from "@modules/transactions/infra/typeorm/entities/Transaction"
import { getConnection } from "typeorm";

export const isTransactionEquals = (transaction: Transaction, from_account_id: string, to_account_id: string,
  type: TransactionType, value: number, bonusValue: number, transactionCost: number
  ) => {
  return transaction.from_account_id === from_account_id &&
    transaction.to_account_id === to_account_id &&
    transaction.type === type &&
    transaction.value === value &&
    transaction.bonusValue === bonusValue &&
    transaction.transactionCost === transactionCost
}

export const clearDb = async () => {
  const defaultConnection = getConnection(
    process.env.DEFAULT_CONNECTION
  )

  const entities = defaultConnection.entityMetadatas;

  for (const entity of entities) {
    const repository = await defaultConnection.getRepository(entity.name);
    await repository.query(`DELETE FROM ${entity.tableName};`)
  }
};

export const isRuningTests = () => {
  return process.argv.filter((arg: string) =>
    arg === '-runing-tests'
  ).length > 0
}

export const createUserAndAuthenticateForTests = async (request: any, appServer: any, name: string, cpf: string) => {
  const user = await request(appServer)
    .post('/users')
    .send({
      name,
      cpf,
      password: "123456"
    })

  const body = (await request(appServer)
    .post('/sessions')
    .send({
      cpf: user.body.cpf,
      password: "123456"
    })
  ).body

  return body
}

export const createAccountForTests = async (request: any, appServer: any, user_id: string, bank_id: string, authToken = "") => {
  return await request(appServer)
    .post('/accounts')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      user_id,
      bank_id,
    })
}

export const createBankForTests = async (request: any, appServer: any, name: string, cnpj: string, authToken = "") => {
  return await request(appServer)
    .post('/banks')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name,
      cnpj,
    })
}

export const makeDepositForTests = async(request: any, appServer: any, value: number, account_id: string, authToken = "") => {
  return await request(appServer)
    .post('/banks/deposit')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      value,
      account_id
    })
}

export const getAccountByIdForTests = async (request: any, appServer: any, id: string, authToken = "") => {
  return await request(appServer)
    .get(`/accounts/${id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send()
}

export const makeWithdrawForTests = async(request: any, appServer: any, value: number, account_id: string, authToken = "") => {
  return await request(appServer)
    .post('/banks/withdraw')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      value,
      account_id,
    })
}

export const makeTransferForTests = async(request: any, appServer: any, value: number, from_account_id: string, to_account_id: string, authToken = "") => {
  return await request(appServer)
    .post('/banks/transfer')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      value,
      to_account_id,
      from_account_id
    })
}
