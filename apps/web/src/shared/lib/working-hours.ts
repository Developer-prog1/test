export type GymWorkingHours = {
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
  note?: unknown;
};

export const WORKING_DAY_KEYS = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
] as const;

export type WorkingDayKey = (typeof WORKING_DAY_KEYS)[number];

export function parseWorkingHours(value: unknown): GymWorkingHours | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const result: GymWorkingHours = {};

  for (const key of WORKING_DAY_KEYS) {
    const day = record[key];
    if (typeof day === 'string') {
      result[key] = day;
    }
  }

  if ('note' in record) {
    result.note = record.note;
  }

  return result;
}

export function isClosedHours(value: string | undefined): boolean {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === 'closed' || normalized === 'փակ' || normalized === 'закрыто';
}
