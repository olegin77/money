import { describe, it, expect } from 'vitest';
import { translations, Lang } from './translations';

describe('translations', () => {
  const langs: Lang[] = ['en', 'ru'];

  it('should have both en and ru translations', () => {
    expect(translations.en).toBeDefined();
    expect(translations.ru).toBeDefined();
  });

  it('should have the same keys in both languages', () => {
    const enKeys = Object.keys(translations.en).sort();
    const ruKeys = Object.keys(translations.ru).sort();

    expect(enKeys).toEqual(ruKeys);
  });

  it('should have no empty string values', () => {
    for (const lang of langs) {
      const entries = Object.entries(translations[lang]);
      for (const [key, value] of entries) {
        expect(value, `${lang}.${key} is empty`).not.toBe('');
      }
    }
  });

  it('should have navigation keys', () => {
    const navKeys = ['nav_dashboard', 'nav_expenses', 'nav_income', 'nav_settings'];
    for (const key of navKeys) {
      expect(translations.en).toHaveProperty(key);
      expect(translations.ru).toHaveProperty(key);
    }
  });

  it('should have auth keys', () => {
    const authKeys = ['auth_login_title', 'auth_register_title', 'auth_field_email'];
    for (const key of authKeys) {
      expect(translations.en).toHaveProperty(key);
      expect(translations.ru).toHaveProperty(key);
    }
  });
});
