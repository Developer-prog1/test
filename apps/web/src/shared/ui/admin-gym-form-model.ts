import type { LocalizedString } from '../lib/localize';
import { emptyLocalized, serializeLocalized } from '../lib/localize';

const AMENITY_KEYS = [
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

const DISTRICT_KEYS = [
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

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const SPEC_KEYS = ['strength', 'cardio_hiit', 'crossfit'] as const;

export { AMENITY_KEYS, DAY_KEYS, DISTRICT_KEYS, SPEC_KEYS };

export type AdminGymFormValues = {
  ownerEmail: string;
  ownerFullName: string;
  name: string;
  city: string;
  district: string;
  address: LocalizedString;
  phone: string;
  description: LocalizedString;
  amenities: string[];
  workingHours: Record<(typeof DAY_KEYS)[number], string> & { note: string };
  isFeatured: boolean;
  moderationStatus: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  activateMonths: number;
  mediaUrls: string[];
  trainers: Array<{
    id?: string;
    name: string;
    photoUrl: string;
    specialization: string;
    bio: string;
  }>;
  plans: Array<{
    id?: string;
    title: string;
    description: string;
    priceAmd: string;
    durationDays: string;
  }>;
};

export type AdminGymPayload = {
  ownerEmail: string;
  ownerFullName?: string;
  name: string;
  city: string;
  district?: string;
  address: string;
  phone?: string;
  description?: string;
  amenities: string[];
  workingHours: Record<string, unknown>;
  isFeatured: boolean;
  moderationStatus: AdminGymFormValues['moderationStatus'];
  activateMonths?: number;
  mediaUrls: string[];
  trainers: Array<{
    name: string;
    photoUrl?: string;
    specialization?: string;
    bio?: string;
  }>;
  plans: Array<{
    title: string;
    description?: string;
    priceAmd: number;
    durationDays: number;
    isActive: boolean;
  }>;
};

export type OwnerOption = { email: string; fullName: string | null };

export function emptyAdminGymForm(): AdminGymFormValues {
  return {
    ownerEmail: '',
    ownerFullName: '',
    name: '',
    city: 'Yerevan',
    district: 'Kentron',
    address: emptyLocalized(),
    phone: '',
    description: emptyLocalized(),
    amenities: [],
    workingHours: {
      mon: '07:00-22:00',
      tue: '07:00-22:00',
      wed: '07:00-22:00',
      thu: '07:00-22:00',
      fri: '07:00-22:00',
      sat: '09:00-21:00',
      sun: '10:00-18:00',
      note: '',
    },
    isFeatured: false,
    moderationStatus: 'APPROVED',
    activateMonths: 1,
    mediaUrls: [''],
    trainers: [
      { name: '', photoUrl: '', specialization: 'strength', bio: '' },
    ],
    plans: [
      {
        title: '',
        description: '',
        priceAmd: '15000',
        durationDays: '30',
      },
    ],
  };
}

export function toAdminGymPayload(
  values: AdminGymFormValues,
  mode: 'create' | 'edit',
): AdminGymPayload {
  const address = serializeLocalized(values.address);
  const description = serializeLocalized(values.description);

  const payload: AdminGymPayload = {
    ownerEmail: values.ownerEmail.trim(),
    name: values.name.trim(),
    city: values.city.trim(),
    district: values.district || undefined,
    address: address ?? '',
    phone: values.phone.trim() || undefined,
    description,
    amenities: values.amenities,
    workingHours: {
      ...DAY_KEYS.reduce(
        (acc, day) => {
          acc[day] = values.workingHours[day].trim() || 'closed';
          return acc;
        },
        {} as Record<string, string>,
      ),
      ...(values.workingHours.note.trim()
        ? { note: values.workingHours.note.trim() }
        : {}),
    },
    isFeatured: values.isFeatured,
    moderationStatus: values.moderationStatus,
    mediaUrls: values.mediaUrls.map((url) => url.trim()).filter(Boolean),
    trainers: values.trainers
      .filter((item) => item.name.trim())
      .map((item) => ({
        name: item.name.trim(),
        photoUrl: item.photoUrl.trim() || undefined,
        specialization: item.specialization || undefined,
        bio: item.bio.trim() || undefined,
      })),
    plans: values.plans
      .filter((item) => item.title.trim())
      .map((item) => ({
        title: item.title.trim(),
        description: item.description.trim() || undefined,
        priceAmd: Number(item.priceAmd) || 0,
        durationDays: Number(item.durationDays) || 30,
        isActive: true,
      })),
  };

  if (mode === 'create') {
    if (values.ownerFullName.trim()) {
      payload.ownerFullName = values.ownerFullName.trim();
    }
    if (values.activateMonths > 0) {
      payload.activateMonths = values.activateMonths;
    }
  }

  return payload;
}
