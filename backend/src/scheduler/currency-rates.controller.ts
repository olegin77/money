import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyRatesService } from './currency-rates.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('currency-rates')
export class CurrencyRatesController {
  constructor(private readonly currencyRatesService: CurrencyRatesService) {}

  @Public()
  @Get()
  async getLatestRates(@Query('base') base?: string) {
    const rates = await this.currencyRatesService.getLatestRates(base || 'USD');

    return {
      success: true,
      data: rates.map((r) => ({
        currency: r.targetCurrency,
        rate: Number(r.rate),
        date: r.date,
      })),
    };
  }
}
