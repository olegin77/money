import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalyticsMaterializedViews1708400000000 implements MigrationInterface {
  name = 'AddAnalyticsMaterializedViews1708400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------------------------------------------------------------
    // 1. mv_dashboard_summary
    //    Monthly aggregates per user: total expenses, income, counts, averages
    // ---------------------------------------------------------------
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW mv_dashboard_summary AS
      SELECT
        e.user_id,
        date_trunc('month', e.date) AS month,
        COALESCE(SUM(e.amount), 0)  AS total_expenses,
        COUNT(e.id)                  AS expense_count,
        COALESCE(AVG(e.amount), 0)  AS avg_expense,
        COALESCE(i.total_income, 0) AS total_income,
        COALESCE(i.income_count, 0) AS income_count,
        COALESCE(i.avg_income, 0)   AS avg_income
      FROM expenses e
      LEFT JOIN LATERAL (
        SELECT
          SUM(ir.amount) AS total_income,
          COUNT(ir.id)   AS income_count,
          AVG(ir.amount) AS avg_income
        FROM income_records ir
        WHERE ir.user_id = e.user_id
          AND date_trunc('month', ir.date) = date_trunc('month', e.date)
      ) i ON true
      GROUP BY e.user_id, date_trunc('month', e.date),
               i.total_income, i.income_count, i.avg_income

      UNION ALL

      -- Include months where there is only income (no expenses)
      SELECT
        ir2.user_id,
        date_trunc('month', ir2.date) AS month,
        0                              AS total_expenses,
        0                              AS expense_count,
        0                              AS avg_expense,
        SUM(ir2.amount)                AS total_income,
        COUNT(ir2.id)                  AS income_count,
        AVG(ir2.amount)                AS avg_income
      FROM income_records ir2
      WHERE NOT EXISTS (
        SELECT 1 FROM expenses ex
        WHERE ex.user_id = ir2.user_id
          AND date_trunc('month', ex.date) = date_trunc('month', ir2.date)
      )
      GROUP BY ir2.user_id, date_trunc('month', ir2.date)
      WITH DATA
    `);

    // Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_mv_dashboard_summary_user_month
      ON mv_dashboard_summary (user_id, month)
    `);

    // Additional lookup index
    await queryRunner.query(`
      CREATE INDEX idx_mv_dashboard_summary_month
      ON mv_dashboard_summary (month)
    `);

    // ---------------------------------------------------------------
    // 2. mv_category_breakdown
    //    Expense breakdown by category per user per month
    // ---------------------------------------------------------------
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW mv_category_breakdown AS
      SELECT
        e.user_id,
        date_trunc('month', e.date)        AS month,
        COALESCE(e.category_id, '00000000-0000-0000-0000-000000000000'::uuid)
                                            AS category_id,
        COALESCE(p.name, 'Uncategorized')  AS category_name,
        p.icon                              AS category_icon,
        p.color                             AS category_color,
        SUM(e.amount)                       AS total_amount,
        COUNT(e.id)                         AS expense_count,
        AVG(e.amount)                       AS avg_amount
      FROM expenses e
      LEFT JOIN perimeters p ON p.id = e.category_id
      GROUP BY
        e.user_id,
        date_trunc('month', e.date),
        COALESCE(e.category_id, '00000000-0000-0000-0000-000000000000'::uuid),
        p.name, p.icon, p.color
      WITH DATA
    `);

    // Unique index required for REFRESH MATERIALIZED VIEW CONCURRENTLY
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_mv_category_breakdown_user_month_cat
      ON mv_category_breakdown (user_id, month, category_id)
    `);

    // Lookup indexes
    await queryRunner.query(`
      CREATE INDEX idx_mv_category_breakdown_user
      ON mv_category_breakdown (user_id)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_mv_category_breakdown_month
      ON mv_category_breakdown (month)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_category_breakdown CASCADE`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_summary CASCADE`);
  }
}
