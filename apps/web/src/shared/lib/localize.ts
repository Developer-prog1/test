export type AppLocale = 'hy' | 'en' | 'ru';

export type LocalizedString = {
  hy: string;
  en: string;
  ru: string;
};

export function isLocalizedRecord(value: unknown): value is LocalizedString {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.hy === 'string' ||
    typeof record.en === 'string' ||
    typeof record.ru === 'string'
  );
}

/** Resolve DB/API text that may be plain string or `{ hy, en, ru }` (object or JSON string). */
export function localizeText(value: unknown, locale: string): string {
  if (value == null) return '';

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') && trimmed.includes('"')) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (isLocalizedRecord(parsed)) {
          return pickLocalized(parsed, locale);
        }
      } catch {
        // plain string
      }
    }
    return value;
  }

  if (isLocalizedRecord(value)) {
    return pickLocalized(value, locale);
  }

  return String(value);
}

function pickLocalized(record: LocalizedString, locale: string): string {
  const key = locale as AppLocale;
  return record[key] || record.en || record.hy || record.ru || '';
}

export function localized(
  hy: string,
  en: string,
  ru: string,
): LocalizedString {
  return { hy, en, ru };
}

export function localizedJson(hy: string, en: string, ru: string): string {
  return JSON.stringify(localized(hy, en, ru));
}
