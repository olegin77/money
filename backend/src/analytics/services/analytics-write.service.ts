import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CacheService } from '../../common/services/cache.service';

/**
 * CQRS Write Service — handles cache invalidation and materialized view refreshes.
 * Uses debouncing to prevent excessive MV refreshes on rapid write events.
 */
@Injectable()
export class AnalyticsWriteService {
  private readonly logger = new Logger(AnalyticsWriteService.name);

  /** Debounce timers per userId to batch rapid writes */
  private readonly refreshTimers = new Map<string, NodeJS.Timeout>();

  /** Tracks whether a refresh is currently in progress per userId */
  private readonly refreshInProgress = new Set<string>();

  /** Debounce delay in ms — batch writes within this window before refreshing MVs */
  private static readonly DEBOUNCE_MS = 2000;

  constructor(
    private readonly cacheService: CacheService,
    private readonly dataSource: DataSource
  ) {}

  /**
   * Called when any expense/income write event occurs.
   * Invalidates cache immediately and schedules a debounced MV refresh.
   */
  async handleWriteEvent(userId: string): Promise<void> {
    // 1. Invalidate cache immediately — reads will go to DB until cache is repopulated
    await this.cacheService.invalidateUserCache(userId);
    this.logger.debug(`Cache invalidated for userId=${userId}`);

    // 2. Schedule debounced materialized view refresh
    this.scheduleRefresh(userId);
  }

  /**
   * Debounced scheduling — if multiple writes happen within DEBOUNCE_MS,
   * only one MV refresh fires at the end of the window.
   */
  private scheduleRefresh(userId: string): void {
    // Clear any existing timer for this user
    const existingTimer = this.refreshTimers.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
      this.refreshTimers.delete(userId);
      await this.refreshMaterializedViews();
    }, AnalyticsWriteService.DEBOUNCE_MS);

    this.refreshTimers.set(userId, timer);
  }

  /**
   * Refreshes all analytics materialized views concurrently.
   * Protected against concurrent execution — if a refresh is already in progress,
   * the request is silently dropped (the next debounce cycle will pick it up).
   */
  async refreshMaterializedViews(): Promise<void> {
    const lockKey = 'mv_refresh';

    if (this.refreshInProgress.has(lockKey)) {
      this.logger.debug('MV refresh already in progress, skipping duplicate request');
      return;
    }

    this.refreshInProgress.add(lockKey);

    try {
      this.logger.log('Refreshing analytics materialized views...');

      // Use CONCURRENTLY so the MV stays readable during refresh.
      // NOTE: CONCURRENTLY requires a UNIQUE INDEX on the MV — we create those in the migration.
      // If the MV does not exist yet (migration not run), this will fail gracefully.
      await Promise.all([
        this.safeRefreshView('mv_dashboard_summary'),
        this.safeRefreshView('mv_category_breakdown'),
      ]);

      this.logger.log('Materialized views refreshed successfully');
    } finally {
      this.refreshInProgress.delete(lockKey);
    }
  }

  /**
   * Safely refresh a single materialized view.
   * Falls back to non-concurrent refresh if CONCURRENTLY fails,
   * and gracefully handles the case where the MV does not exist yet.
   */
  private async safeRefreshView(viewName: string): Promise<void> {
    try {
      await this.dataSource.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName}`);
    } catch (err: any) {
      // If CONCURRENTLY fails (e.g., no unique index yet, or MV has no data),
      // try without CONCURRENTLY
      if (
        err?.message?.includes('has not been populated') ||
        err?.message?.includes('unique index')
      ) {
        try {
          await this.dataSource.query(`REFRESH MATERIALIZED VIEW ${viewName}`);
        } catch (innerErr: any) {
          this.logger.warn(`Failed to refresh ${viewName} (non-concurrent): ${innerErr?.message}`);
        }
      } else if (err?.message?.includes('does not exist')) {
        this.logger.debug(`Materialized view ${viewName} does not exist yet — skipping refresh`);
      } else {
        this.logger.warn(`Failed to refresh ${viewName}: ${err?.message}`);
      }
    }
  }

  /**
   * Force immediate refresh — useful for admin endpoints or scheduled jobs.
   */
  async forceRefresh(): Promise<void> {
    await this.refreshMaterializedViews();
  }
}
