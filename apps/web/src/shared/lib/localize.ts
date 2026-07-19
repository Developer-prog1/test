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

export function emptyLocalized(): LocalizedString {
  return { hy: '', en: '', ru: '' };
}

/** Parse DB/API text into a full `{ hy, en, ru }` form value. */
export function parseLocalizedInput(value: unknown): LocalizedString {
  if (value == null) return emptyLocalized();

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return emptyLocalized();
    if (trimmed.startsWith('{') && trimmed.includes('"')) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (isLocalizedRecord(parsed)) {
          return {
            hy: parsed.hy ?? '',
            en: parsed.en ?? '',
            ru: parsed.ru ?? '',
          };
        }
      } catch {
        // plain string
      }
    }
    return { hy: value, en: value, ru: value };
  }

  if (isLocalizedRecord(value)) {
    return {
      hy: value.hy ?? '',
      en: value.en ?? '',
      ru: value.ru ?? '',
    };
  }

  return emptyLocalized();
}

/** Serialize form locales for API/DB string columns. */
export function serializeLocalized(
  value: LocalizedString,
): string | undefined {
  const next: LocalizedString = {
    hy: value.hy.trim(),
    en: value.en.trim(),
    ru: value.ru.trim(),
  };
  if (!next.hy && !next.en && !next.ru) return undefined;
  return JSON.stringify(next);
}

export function localizedJson(hy: string, en: string, ru: string): string {
  return JSON.stringify(localized(hy, en, ru));
}
