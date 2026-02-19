import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyRate } from '../common/entities/currency-rate.entity';

const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'RUB',
  'JPY',
  'CNY',
  'INR',
  'BRL',
  'CAD',
  'AUD',
];

@Injectable()
export class CurrencyRatesService {
  private readonly logger = new Logger(CurrencyRatesService.name);

  constructor(
    @InjectRepository(CurrencyRate)
    private readonly currencyRateRepository: Repository<CurrencyRate>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async fetchDailyRates() {
    this.logger.log('Fetching daily currency exchange rates...');

    try {
      // Using the free exchangerate.host API (no key required)
      const response = await fetch(
        'https://api.exchangerate.host/latest?base=USD',
      );

      if (!response.ok) {
        this.logger.warn(`Exchange rate API returned ${response.status}`);
        return;
      }

      const data = (await response.json()) as {
        rates?: Record<string, number>;
      };

      if (!data.rates) {
        this.logger.warn('No rates in API response');
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      const rates: Partial<CurrencyRate>[] = [];

      for (const currency of SUPPORTED_CURRENCIES) {
        if (currency === 'USD') continue;
        const rate = data.rates[currency];
        if (rate) {
          rates.push({
            baseCurrency: 'USD',
            targetCurrency: currency,
            rate,
            date: today,
          });
        }
      }

      // Upsert — use save with conflict handling
      for (const rate of rates) {
        await this.currencyRateRepository
          .createQueryBuilder()
          .insert()
          .into(CurrencyRate)
          .values(rate)
          .orUpdate(['rate'], ['base_currency', 'target_currency', 'date'])
          .execute();
      }

      this.logger.log(`Saved ${rates.length} currency rates for ${today}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to fetch currency rates: ${err.message}`,
        err.stack,
      );
    }
  }

  async getLatestRates(
    baseCurrency = 'USD',
  ): Promise<CurrencyRate[]> {
    // Get most recent date available
    const latest = await this.currencyRateRepository
      .createQueryBuilder('rate')
      .where('rate.baseCurrency = :baseCurrency', { baseCurrency })
      .orderBy('rate.date', 'DESC')
      .limit(1)
      .getOne();

    if (!latest) return [];

    return this.currencyRateRepository.find({
      where: {
        baseCurrency,
        date: latest.date,
      },
      order: { targetCurrency: 'ASC' },
    });
  }
}
