import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class AddAccountForeignKeyUser1604469347962 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'Account',
        columnNames: ['account_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'accounts',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('users', 'Account');
    await queryRunner.dropColumn('users', 'account_id');
  }
}
