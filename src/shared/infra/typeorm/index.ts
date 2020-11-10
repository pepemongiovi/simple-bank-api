import { isRuningTests } from '@shared/helpers/helper';
import { createConnections, getConnection } from 'typeorm';

if (isRuningTests()) {
  beforeAll(async () => {
    await createConnections();
  });

  afterAll(async () => {
    const connection = getConnection(process.env.DEFAULT_CONNECTION);
    await connection.close();
  });
} else {
  createConnections();
}
