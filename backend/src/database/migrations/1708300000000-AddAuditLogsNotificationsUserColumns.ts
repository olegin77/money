import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuditLogsNotificationsUserColumns1708300000000 implements MigrationInterface {
  name = 'AddAuditLogsNotificationsUserColumns1708300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" character varying,
        "method" character varying(10) NOT NULL,
        "path" character varying NOT NULL,
        "entity" character varying(50) NOT NULL,
        "entity_id" character varying,
        "status_code" integer NOT NULL,
        "ip_address" character varying,
        "user_agent" text,
        "changes" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for audit_logs
    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_user_id_created_at" ON "audit_logs" ("user_id", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_audit_logs_entity_created_at" ON "audit_logs" ("entity", "created_at")
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TYPE "notifications_type_enum" AS ENUM (
        'friend_request',
        'friend_accepted',
        'budget_warning',
        'budget_exceeded',
        'perimeter_shared',
        'system'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" "notifications_type_enum" NOT NULL DEFAULT 'system',
        "title" character varying NOT NULL,
        "message" character varying,
        "data" jsonb,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for notifications
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_id_is_read" ON "notifications" ("user_id", "is_read")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_id_created_at" ON "notifications" ("user_id", "created_at")
    `);

    // Add foreign key for notifications
    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD CONSTRAINT "FK_notifications_user"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Add missing user columns
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "consent_given_at" TIMESTAMP
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "notify_email" boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "notify_push" boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "notify_budget_alerts" boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "scheduled_for_deletion_at" TIMESTAMP
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove user columns
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "scheduled_for_deletion_at"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "notify_budget_alerts"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "notify_push"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "notify_email"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "consent_given_at"`);

    // Drop notifications table
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "notifications_type_enum"`);

    // Drop audit_logs table
    await queryRunner.query(`DROP TABLE "audit_logs"`);
  }
}
