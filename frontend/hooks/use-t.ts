import { useAuthStore } from '@/stores/auth.store';
import { translations, type Lang } from '@/lib/i18n/translations';

export function useT() {
  const lang = (useAuthStore(s => s.user?.language) ?? 'en') as Lang;
  const dict = translations[lang] ?? translations.en;
  return (key: keyof typeof translations.en): string => dict[key] ?? translations.en[key] ?? key;
}
