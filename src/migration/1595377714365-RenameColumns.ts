import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameColumns1595377714365 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'password_digest', 'passwordDigest');
    await queryRunner.renameColumn('posts', 'author_id', 'authorId');
    await queryRunner.renameColumn('comments', 'user_id', 'userId');
    return await queryRunner.renameColumn('comments', 'post_id', 'postId');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'passwordDigest', 'password_digest',);
    await queryRunner.renameColumn('posts', 'authorId', 'author_id');
    await queryRunner.renameColumn('comments', 'userId', 'user_id');
    return await queryRunner.renameColumn('comments', 'postId', 'post_id');
  }

}
