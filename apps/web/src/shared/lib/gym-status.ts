export const GYM_STATUS_KEYS = [
  'womenOnly',
  'open24h',
  'crossfit',
  'withPool',
  'strongest',
  'bestCardio',
  'groupClasses',
  'recovery',
  'topPick',
] as const;

export type GymStatusKey = (typeof GYM_STATUS_KEYS)[number];

/**
 * Picks one display status for a gym card from amenities / featured flag.
 * Priority matches distinctive selling points first.
 */
export function resolveGymStatus(
  amenities: string[],
  isFeatured: boolean,
): GymStatusKey | null {
  const set = new Set(amenities);

  if (set.has('women_only')) return 'womenOnly';
  if (set.has('24h')) return 'open24h';
  if (set.has('crossfit')) return 'crossfit';
  if (set.has('pool')) return 'withPool';
  if (set.has('personal_training')) return 'strongest';
  if (set.has('cardio')) return 'bestCardio';
  if (set.has('group_classes')) return 'groupClasses';
  if (set.has('sauna')) return 'recovery';
  if (isFeatured) return 'topPick';
  return null;
}
