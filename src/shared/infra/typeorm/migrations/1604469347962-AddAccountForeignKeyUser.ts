import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class AddAccountForeignKeyUser1604469347962
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.createForeignKey(
        'users',
        new TableForeignKey({
          name: 'Account',
          columnNames: ['account_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'accounts',
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        }),
      );
    } catch (err) {
      console.log(err);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('users', 'Account');
    await queryRunner.dropColumn('users', 'account_id');
  }
}
