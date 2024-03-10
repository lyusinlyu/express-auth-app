import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1709781436234 implements MigrationInterface {
  name = 'Migrations1709781436234';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_provider" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "provider" character varying NOT NULL, "provider_id" character varying NOT NULL, CONSTRAINT "PK_0a6e6348fe38ba49160eb903c95" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL DEFAULT 'Avatar', "url" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_5220c45b8e32d49d767b9b3d725" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "first_name" character varying(25) NOT NULL, "last_name" character varying(25) NOT NULL, "email" character varying NOT NULL, "password_hash" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'user', "status" "public"."users_status_enum" NOT NULL DEFAULT 'new', "verification_token" character varying, "is_email_sent" boolean NOT NULL DEFAULT false, "reset_password_token" character varying, "is_online" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
    await queryRunner.query(
      `ALTER TABLE "auth_provider" ADD CONSTRAINT "FK_b258701252799b59135e88cc953" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "photos" ADD CONSTRAINT "FK_74da4f305b050f7d27c73b04263" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "photos" DROP CONSTRAINT "FK_74da4f305b050f7d27c73b04263"`);
    await queryRunner.query(`ALTER TABLE "auth_provider" DROP CONSTRAINT "FK_b258701252799b59135e88cc953"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "photos"`);
    await queryRunner.query(`DROP TABLE "auth_provider"`);
  }
}
