import { api } from './client';

export interface CurrencyRate {
  currency: string;
  rate: number;
  date: string;
}

let cachedRates: CurrencyRate[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const currencyApi = {
  getRates: async (base = 'USD'): Promise<CurrencyRate[]> => {
    const now = Date.now();
    if (cachedRates && now - cacheTime < CACHE_TTL) {
      return cachedRates;
    }
    const response = await api.get('/currency-rates', { params: { base } });
    cachedRates = response.data.data;
    cacheTime = now;
    return cachedRates!;
  },
};

export function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: CurrencyRate[]
): number {
  if (fromCurrency === toCurrency) return amount;

  // rates are based on USD
  const fromRate = fromCurrency === 'USD' ? 1 : rates.find(r => r.currency === fromCurrency)?.rate;
  const toRate = toCurrency === 'USD' ? 1 : rates.find(r => r.currency === toCurrency)?.rate;

  if (!fromRate || !toRate) return amount; // fallback if rate not found

  // Convert: amount in fromCurrency → USD → toCurrency
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3',
    RUB: '\u20BD',
    JPY: '\u00A5',
  };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${Math.abs(amount).toFixed(2)}`;
}
