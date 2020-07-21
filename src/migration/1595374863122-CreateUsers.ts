import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsers1595374863122 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        { name: 'id', type: 'int', isGenerated: true, generationStrategy: 'increment', isPrimary: true },
        { name: 'username', type: 'varchar' },
        { name: 'password_digest', type: 'varchar' }
      ]
    }

    ))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable('users')
  }

}
