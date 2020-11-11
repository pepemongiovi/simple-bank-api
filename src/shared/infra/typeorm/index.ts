/* eslint-disable no-await-in-loop */
import { isRuningTests } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';

const tryToCreateConnections = async () => {
  let retries = 5;
  while (retries) {
    try {
      await createConnections();
      break;
    } catch (err) {
      retries -= 1;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};

if (isRuningTests()) {
  beforeAll(async () => {
    await tryToCreateConnections();
  });

  afterAll(async () => {
    const connection = getConnection(process.env.DEFAULT_CONNECTION);
    await connection.close();
  });
} else {
  tryToCreateConnections();
}
