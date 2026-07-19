export const APP_NAME = 'GymHub' as const;

export const ROLES = {
  USER: 'USER',
  GYM_OWNER: 'GYM_OWNER',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const GYM_MODERATION_STATUSES = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type GymModerationStatus =
  (typeof GYM_MODERATION_STATUSES)[keyof typeof GYM_MODERATION_STATUSES];

export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELED: 'CANCELED',
  PAST_DUE: 'PAST_DUE',
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUSES)[keyof typeof SUBSCRIPTION_STATUSES];

export const LEAD_STATUSES = {
  NEW: 'NEW',
  READ: 'READ',
  ARCHIVED: 'ARCHIVED',
} as const;

export type LeadStatus = (typeof LEAD_STATUSES)[keyof typeof LEAD_STATUSES];

export const AMENITIES = [
  'parking',
  'sauna',
  'crossfit',
  'women_only',
  '24h',
  'pool',
  'cardio',
  'personal_training',
  'group_classes',
  'shower',
] as const;

export type Amenity = (typeof AMENITIES)[number];

export const YEREVAN_DISTRICTS = [
  'Kentron',
  'Arabkir',
  'Ajapnyak',
  'Avan',
  'Davtashen',
  'Erebuni',
  'Kanaker-Zeytun',
  'Malatia-Sebastia',
  'Nor Nork',
  'Nork-Marash',
  'Nubarashen',
  'Shengavit',
] as const;

export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  LEAD_DUPLICATE: 'LEAD_DUPLICATE',
  GYM_NOT_PUBLIC: 'GYM_NOT_PUBLIC',
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  STORAGE_UNAVAILABLE: 'STORAGE_UNAVAILABLE',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export const SUBSCRIPTION_PRICE_AMD = 10_000;
