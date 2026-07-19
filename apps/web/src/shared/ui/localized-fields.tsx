'use client';

import { useTranslations } from 'next-intl';
import type { LocalizedString } from '../lib/localize';
import { AutoGrowTextarea } from './auto-grow-textarea';

const LOCALES = [
  { key: 'hy', label: 'ՀԱՅ' },
  { key: 'en', label: 'EN' },
  { key: 'ru', label: 'RU' },
] as const;

type LocalizedFieldsProps = {
  label: string;
  hint?: string;
  value: LocalizedString;
  onChange: (next: LocalizedString) => void;
  required?: boolean;
  multiline?: boolean;
  minRows?: number;
  inputName?: string;
};

export function LocalizedFields({
  label,
  hint,
  value,
  onChange,
  required = false,
  multiline = false,
  minRows = 4,
  inputName,
}: LocalizedFieldsProps) {
  const t = useTranslations('admin');
  const nameBase = inputName ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <fieldset className="space-y-3 rounded-2xl border border-[rgba(244,241,236,0.08)] bg-[rgba(255,255,255,0.02)] p-4 md:col-span-2">
      <legend className="px-1 text-sm text-[var(--muted)]">{label}</legend>
      {hint ? <p className="text-xs text-[var(--muted)]">{hint}</p> : null}
      <div className="space-y-3">
        {LOCALES.map(({ key, label: localeLabel }) => {
          const fieldId = `${nameBase}-${key}`;
          const isPrimary = key === 'hy';
          return (
            <label key={key} htmlFor={fieldId} className="block space-y-1.5">
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-[rgba(244,241,236,0.62)]">
                <span
                  className={
                    isPrimary
                      ? 'rounded-md bg-[rgba(214,255,62,0.14)] px-2 py-0.5 text-[10px] !text-[var(--accent)]'
                      : 'rounded-md border border-[rgba(244,241,236,0.1)] px-2 py-0.5 text-[10px]'
                  }
                >
                  {localeLabel}
                </span>
                {isPrimary && required ? (
                  <span className="text-[10px] font-medium normal-case tracking-normal text-[rgba(155,150,140,0.8)]">
                    {t('localizedRequired')}
                  </span>
                ) : null}
              </span>
              {multiline ? (
                <AutoGrowTextarea
                  id={fieldId}
                  name={fieldId}
                  minRows={minRows}
                  className="w-full"
                  value={value[key]}
                  required={required && isPrimary}
                  onChange={(event) =>
                    onChange({ ...value, [key]: event.target.value })
                  }
                />
              ) : (
                <input
                  id={fieldId}
                  name={fieldId}
                  className="field"
                  value={value[key]}
                  required={required && isPrimary}
                  onChange={(event) =>
                    onChange({ ...value, [key]: event.target.value })
                  }
                />
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
