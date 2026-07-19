import type { Gym, GymMedia, MembershipPlan, Trainer } from '@gymhub/database';

type CompletenessInput = {
  description: string | null;
  address: string;
  phone: string | null;
  workingHours: unknown;
  media: Pick<GymMedia, 'id'>[];
  trainers: Pick<Trainer, 'id'>[];
  plans: Pick<MembershipPlan, 'id' | 'isActive'>[];
};

function descriptionLength(description: string | null): number {
  if (!description) return 0;
  const trimmed = description.trim();
  if (trimmed.startsWith('{') && trimmed.includes('"')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const record = parsed as Record<string, unknown>;
        const lengths = ['hy', 'en', 'ru']
          .map((key) => record[key])
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.length);
        if (lengths.length > 0) return Math.max(...lengths);
      }
    } catch {
      // plain string
    }
  }
  return description.length;
}

export function computeCompleteness(gym: CompletenessInput): number {
  let score = 0;
  const checks = [
    descriptionLength(gym.description) > 20,
    Boolean(gym.address && gym.address !== 'հասցեն կլրացվի'),
    Boolean(gym.phone),
    Boolean(gym.workingHours),
    gym.media.length >= 1,
    gym.media.length >= 3,
    gym.trainers.length >= 1,
    gym.plans.some((plan) => plan.isActive),
  ];
  const weight = Math.round(100 / checks.length);
  for (const ok of checks) {
    if (ok) score += weight;
  }
  return Math.min(100, score);
}

export function isProfileComplete(gym: CompletenessInput): boolean {
  return (
    computeCompleteness(gym) >= 60 &&
    gym.media.length >= 1 &&
    gym.plans.some((plan) => plan.isActive) &&
    Boolean(gym.phone) &&
    Boolean(gym.description)
  );
}

export type GymWithRelations = Gym & {
  media: GymMedia[];
  trainers: Trainer[];
  plans: MembershipPlan[];
};
