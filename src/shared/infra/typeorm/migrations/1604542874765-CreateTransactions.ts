import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateTransactions1604542874765
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'from_account_id',
            type: 'uuid',
          },
          {
            name: 'to_account_id',
            type: 'uuid',
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'value',
            type: 'float',
          },
          {
            name: 'bonusValue',
            type: 'float',
          },
          {
            name: 'transactionCost',
            type: 'float',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'FromAccount',
            referencedTableName: 'accounts',
            referencedColumnNames: ['id'],
            columnNames: ['from_account_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          {
            name: 'ToAccount',
            referencedTableName: 'accounts',
            referencedColumnNames: ['id'],
            columnNames: ['to_account_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('transactions');
  }
}
