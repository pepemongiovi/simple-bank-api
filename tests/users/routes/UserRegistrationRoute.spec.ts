import User from "@modules/users/infra/typeorm/entities/User";
import { clearDb } from "@shared/helpers/helper";

const request = require('supertest')
const appServer = require('@shared/infra/http/server')

describe('UserRegistrationRoute', () => {
  beforeEach(async () => {
    await clearDb();
  });

  it('should create a new user', async () => {
    const res = await createUserForTests(
      request, appServer, 'Giuseppe Mongiovi', '07346274407', '123456'
    );

    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('id')
  })

  it('should not be able to create a user with same CPF.', async () => {
    const resUser1 = await createUserForTests(
      request, appServer, 'Giuseppe Mongiovi', '07346274407', '123456'
    );

    const resUser2 = await createUserForTests(
      request, appServer, 'Giuseppe Mongiovi', '07346274407', '123456'
    );

    expect(resUser1.statusCode).toEqual(200)
    expect(resUser1.body).toHaveProperty('id')

    expect(resUser2.statusCode).toEqual(403)
    expect(resUser2.body.message).toEqual(
      'User with this CPF already exists.'
    )
  })

  it('should not be able to create a user with an invalid CPF.', async () => {
    const res = await createUserForTests(
      request, appServer, 'Giuseppe Mongiovi', '07346200000', '123456'
    );

    expect(res.statusCode).toEqual(400)
    expect(res.body.message).toEqual("Invalid CPF.")
  })
})

export const createUserForTests = async (request: any, appServer: any, name: string, cpf: string, password: string) => {
  return await request(appServer)
    .post(`/users`)
    .send({ name, cpf, password })
}

