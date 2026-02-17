import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1708200000000 implements MigrationInterface {
  name = 'InitialSchema1708200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "username" character varying NOT NULL,
        "password" character varying NOT NULL,
        "full_name" character varying,
        "avatar" character varying,
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "language" character varying(5) NOT NULL DEFAULT 'en',
        "theme_mode" character varying NOT NULL DEFAULT 'dark',
        "email_verified" boolean NOT NULL DEFAULT false,
        "two_fa_enabled" boolean NOT NULL DEFAULT false,
        "two_fa_secret" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        "is_admin" boolean NOT NULL DEFAULT false,
        "last_login_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for users
    await queryRunner.query(`
      CREATE INDEX "IDX_users_email" ON "users" ("email")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_users_username" ON "users" ("username")
    `);

    // Create refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token" character varying NOT NULL,
        "user_id" uuid NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "user_agent" character varying,
        "ip_address" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for refresh_tokens
    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")
    `);

    // Add foreign key for refresh_tokens
    await queryRunner.query(`
      ALTER TABLE "refresh_tokens"
      ADD CONSTRAINT "FK_refresh_tokens_user"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Create perimeters table
    await queryRunner.query(`
      CREATE TABLE "perimeters" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "icon" character varying,
        "color" character varying,
        "budget" numeric(12,2),
        "budget_period" character varying,
        "owner_id" uuid NOT NULL,
        "is_shared" boolean NOT NULL DEFAULT false,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_perimeters" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for perimeters
    await queryRunner.query(`
      CREATE INDEX "IDX_perimeters_owner_id" ON "perimeters" ("owner_id")
    `);

    // Add foreign key for perimeters
    await queryRunner.query(`
      ALTER TABLE "perimeters"
      ADD CONSTRAINT "FK_perimeters_owner"
      FOREIGN KEY ("owner_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Create expenses table
    await queryRunner.query(`
      CREATE TABLE "expenses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "amount" numeric(12,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "description" text,
        "category_id" uuid,
        "date" date NOT NULL,
        "payment_method" character varying,
        "location" character varying,
        "tags" jsonb,
        "is_recurring" boolean NOT NULL DEFAULT false,
        "recurrence_rule" character varying,
        "attachments" jsonb,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_expenses" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for expenses
    await queryRunner.query(`
      CREATE INDEX "IDX_expenses_user_id" ON "expenses" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_expenses_category_id" ON "expenses" ("category_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_expenses_date" ON "expenses" ("date" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_expenses_user_category_date" ON "expenses" ("user_id", "category_id", "date" DESC)
    `);

    // Add foreign key for expenses
    await queryRunner.query(`
      ALTER TABLE "expenses"
      ADD CONSTRAINT "FK_expenses_user"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Create income_records table
    await queryRunner.query(`
      CREATE TABLE "income_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "amount" numeric(12,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "description" text,
        "source" character varying,
        "date" date NOT NULL,
        "tags" jsonb,
        "is_recurring" boolean NOT NULL DEFAULT false,
        "recurrence_rule" character varying,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_income_records" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for income_records
    await queryRunner.query(`
      CREATE INDEX "IDX_income_records_user_id" ON "income_records" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_income_records_date" ON "income_records" ("date" DESC)
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_income_records_user_date" ON "income_records" ("user_id", "date" DESC)
    `);

    // Add foreign key for income_records
    await queryRunner.query(`
      ALTER TABLE "income_records"
      ADD CONSTRAINT "FK_income_records_user"
      FOREIGN KEY ("user_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Create friendships table
    await queryRunner.query(`
      CREATE TABLE "friendships" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "requester_id" uuid NOT NULL,
        "addressee_id" uuid NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_friendships" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_friendships_requester_addressee" UNIQUE ("requester_id", "addressee_id"),
        CONSTRAINT "CHK_friendships_status" CHECK ("status" IN ('pending', 'accepted', 'rejected'))
      )
    `);

    // Create indexes for friendships
    await queryRunner.query(`
      CREATE INDEX "IDX_friendships_requester_id" ON "friendships" ("requester_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_friendships_addressee_id" ON "friendships" ("addressee_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_friendships_status" ON "friendships" ("status")
    `);

    // Add foreign keys for friendships
    await queryRunner.query(`
      ALTER TABLE "friendships"
      ADD CONSTRAINT "FK_friendships_requester"
      FOREIGN KEY ("requester_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "friendships"
      ADD CONSTRAINT "FK_friendships_addressee"
      FOREIGN KEY ("addressee_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Create perimeter_shares table (for shared perimeters)
    await queryRunner.query(`
      CREATE TABLE "perimeter_shares" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "perimeter_id" uuid NOT NULL,
        "shared_with_id" uuid NOT NULL,
        "role" character varying NOT NULL DEFAULT 'viewer',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_perimeter_shares" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_perimeter_shares" UNIQUE ("perimeter_id", "shared_with_id"),
        CONSTRAINT "CHK_perimeter_shares_role" CHECK ("role" IN ('viewer', 'contributor', 'manager'))
      )
    `);

    // Create indexes for perimeter_shares
    await queryRunner.query(`
      CREATE INDEX "IDX_perimeter_shares_perimeter_id" ON "perimeter_shares" ("perimeter_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_perimeter_shares_shared_with_id" ON "perimeter_shares" ("shared_with_id")
    `);

    // Add foreign keys for perimeter_shares
    await queryRunner.query(`
      ALTER TABLE "perimeter_shares"
      ADD CONSTRAINT "FK_perimeter_shares_perimeter"
      FOREIGN KEY ("perimeter_id")
      REFERENCES "perimeters"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "perimeter_shares"
      ADD CONSTRAINT "FK_perimeter_shares_user"
      FOREIGN KEY ("shared_with_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Create currency_rates table (for currency conversion)
    await queryRunner.query(`
      CREATE TABLE "currency_rates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "from_currency" character varying(3) NOT NULL,
        "to_currency" character varying(3) NOT NULL,
        "rate" numeric(12,6) NOT NULL,
        "fetched_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_currency_rates" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for currency_rates
    await queryRunner.query(`
      CREATE INDEX "IDX_currency_rates_from_to" ON "currency_rates" ("from_currency", "to_currency")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_currency_rates_fetched_at" ON "currency_rates" ("fetched_at" DESC)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    await queryRunner.query(`DROP TABLE "currency_rates"`);
    await queryRunner.query(`DROP TABLE "perimeter_shares"`);
    await queryRunner.query(`DROP TABLE "friendships"`);
    await queryRunner.query(`DROP TABLE "income_records"`);
    await queryRunner.query(`DROP TABLE "expenses"`);
    await queryRunner.query(`DROP TABLE "perimeters"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
