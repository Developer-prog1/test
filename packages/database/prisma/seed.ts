import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

type Localized = { hy: string; en: string; ru: string };

function L(hy: string, en: string, ru: string): Localized {
  return { hy, en, ru };
}

function Ljson(hy: string, en: string, ru: string): string {
  return JSON.stringify(L(hy, en, ru));
}

const PLACEHOLDER = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80',
  'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=1200&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80',
  'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=1200&q=80',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&q=80',
  'https://images.unsplash.com/photo-1550345332-09e3ac987658?w=1200&q=80',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1200&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80',
];

const MALE_TRAINER_PHOTOS = [
  'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&crop=faces&w=800&h=1000&q=80',
  'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&crop=faces&w=800&h=1000&q=80',
  'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&crop=faces&w=800&h=1000&q=80',
  'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&crop=faces&w=800&h=1000&q=80',
];

const FEMALE_TRAINER_PHOTOS = [
  'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&crop=faces&w=800&h=1000&q=80',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&crop=faces&w=800&h=1000&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&crop=faces&w=800&h=1000&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&crop=faces&w=800&h=1000&q=80',
];

const DISTRICTS = [
  'Kentron',
  'Arabkir',
  'Ajapnyak',
  'Avan',
  'Davtashen',
  'Erebuni',
  'Malatia-Sebastia',
  'Nor Nork',
  'Shengavit',
  'Kanaker-Zeytun',
] as const;

type District = (typeof DISTRICTS)[number];

type GymDef = {
  name: string;
  slug: string;
  amenities: string[];
  featured: boolean;
  district?: District;
  address?: Localized;
  phone?: string;
  blurb?: Localized;
};

const DISTRICT_LABELS: Record<District, Localized> = {
  Kentron: L('Կենտրոն', 'Kentron', 'Кентрон'),
  Arabkir: L('Արաբկիր', 'Arabkir', 'Арабкир'),
  Ajapnyak: L('Աջափնյակ', 'Ajapnyak', 'Аджапняк'),
  Avan: L('Ավան', 'Avan', 'Аван'),
  Davtashen: L('Դավթաշեն', 'Davtashen', 'Давташен'),
  Erebuni: L('Էրեբունի', 'Erebuni', 'Эребуни'),
  'Malatia-Sebastia': L('Մալաթիա-Սեբաստիա', 'Malatia-Sebastia', 'Малатия-Себастия'),
  'Nor Nork': L('Նոր Նորք', 'Nor Nork', 'Нор Норк'),
  Shengavit: L('Շենգավիթ', 'Shengavit', 'Шенгавит'),
  'Kanaker-Zeytun': L('Քանաքեր-Զեյթուն', 'Kanaker-Zeytun', 'Канакер-Зейтун'),
};

/** Demo / placeholder clubs used for UI coverage. */
const DEMO_GYMS: GymDef[] = [
  { name: 'Iron Temple', slug: 'iron-temple', amenities: ['parking', 'shower', '24h'], featured: true },
  { name: 'Pulse Fitness', slug: 'pulse-fitness', amenities: ['cardio', 'group_classes', 'sauna'], featured: true },
  { name: 'Atlas Power', slug: 'atlas-power', amenities: ['personal_training', 'parking'], featured: true },
  { name: 'Nova Gym', slug: 'nova-gym', amenities: ['pool', 'sauna', 'shower'], featured: false },
  { name: 'Zenith CrossFit', slug: 'zenith-crossfit', amenities: ['crossfit', 'parking'], featured: true },
  { name: 'Lady Force', slug: 'lady-force', amenities: ['women_only', 'group_classes'], featured: false },
  { name: 'Olympia Club', slug: 'olympia-club', amenities: ['pool', 'parking', 'cardio'], featured: true },
  { name: 'Beast Mode', slug: 'beast-mode', amenities: ['24h', 'personal_training'], featured: false },
  { name: 'Harmony Fit', slug: 'harmony-fit', amenities: ['group_classes', 'sauna'], featured: false },
  { name: 'Titan House', slug: 'titan-house', amenities: ['parking', 'shower', 'cardio'], featured: true },
  { name: 'Velocity Gym', slug: 'velocity-gym', amenities: ['cardio', '24h'], featured: false },
  { name: 'Core Studio', slug: 'core-studio', amenities: ['group_classes', 'personal_training'], featured: false },
  { name: 'Summit Athletic', slug: 'summit-athletic', amenities: ['parking', 'pool', 'sauna'], featured: false },
  { name: 'Forge Strength', slug: 'forge-strength', amenities: ['personal_training', 'shower'], featured: false },
  { name: 'Apex Performance', slug: 'apex-performance', amenities: ['crossfit', 'cardio', 'parking'], featured: true },
  { name: 'Momentum Club', slug: 'momentum-club', amenities: ['cardio', 'group_classes', 'parking'], featured: true },
  { name: 'Volt Training', slug: 'volt-training', amenities: ['24h', 'shower', 'personal_training'], featured: false },
  { name: 'Cascade Fitness', slug: 'cascade-fitness', amenities: ['pool', 'sauna', 'parking'], featured: false },
  { name: 'Prime Athletics', slug: 'prime-athletics', amenities: ['crossfit', 'cardio'], featured: true },
  { name: 'Silk Strength', slug: 'silk-strength', amenities: ['women_only', 'sauna', 'group_classes'], featured: false },
  { name: 'Northside Gym', slug: 'northside-gym', amenities: ['parking', 'shower', 'cardio'], featured: false },
  { name: 'Echo Fit Lab', slug: 'echo-fit-lab', amenities: ['group_classes', 'personal_training', 'cardio'], featured: true },
  { name: 'Granite Barbell', slug: 'granite-barbell', amenities: ['personal_training', '24h'], featured: false },
  { name: 'Skyline Wellness', slug: 'skyline-wellness', amenities: ['pool', 'sauna', 'group_classes'], featured: false },
  { name: 'Raptor Strength', slug: 'raptor-strength', amenities: ['crossfit', 'parking', 'shower'], featured: true },
  { name: 'Bloom Studio', slug: 'bloom-studio', amenities: ['women_only', 'personal_training'], featured: false },
  { name: 'Metro Muscle', slug: 'metro-muscle', amenities: ['cardio', 'parking', '24h'], featured: false },
  { name: 'Orbit Performance', slug: 'orbit-performance', amenities: ['crossfit', 'sauna', 'cardio'], featured: false },
  { name: 'Phoenix Fit', slug: 'phoenix-fit', amenities: ['pool', 'parking', 'personal_training'], featured: true },
  { name: 'Steel District', slug: 'steel-district', amenities: ['shower', 'personal_training', 'group_classes'], featured: false },
];

/**
 * Real Yerevan clubs (public listing data — addresses/phones may change).
 * Sources: club sites, vCity, Yell.am, Visit Yerevan.
 */
const REAL_YEREVAN_GYMS: GymDef[] = [
  {
    name: "Gold's Gym Amiryan",
    slug: 'golds-gym-amiryan',
    district: 'Kentron',
    phone: '+37410505060',
    address: L('Ամիրյան 27/1', '27/1 Amiryan St', 'ул. Амиряна 27/1'),
    amenities: ['parking', 'cardio', 'personal_training', 'shower', 'group_classes'],
    featured: true,
    blurb: L(
      'Միջազգային Gold’s Gym ցանցի կենտրոնական մասնաճյուղ՝ ժամանակակից սարքավորումներով։',
      'Central Gold’s Gym branch with modern strength and cardio equipment.',
      'Центральный филиал Gold’s Gym с современным оборудованием.',
    ),
  },
  {
    name: "Gold's Gym Komitas",
    slug: 'golds-gym-komitas',
    district: 'Arabkir',
    phone: '+37410322010',
    address: L('Կոմիտասի պող. 40/1', '40/1 Komitas Ave', 'пр. Комитаса 40/1'),
    amenities: ['parking', 'cardio', 'personal_training', 'shower', 'group_classes'],
    featured: true,
    blurb: L(
      'Արաբկիրի Gold’s Gym՝ ուժային և կարդիո գոտիներով։',
      'Arabkir Gold’s Gym with full strength and cardio floors.',
      'Gold’s Gym в Арабкире с силовыми и кардиозонами.',
    ),
  },
  {
    name: "Gold's Gym Avan",
    slug: 'golds-gym-avan',
    district: 'Avan',
    phone: '+37410505060',
    address: L(
      'Մարշալ Բաբաջանյան 18/13',
      '18/13 Marshal Babajanyan St',
      'ул. Маршала Бабаджаняна 18/13',
    ),
    amenities: ['parking', 'cardio', 'personal_training', 'shower'],
    featured: false,
    blurb: L(
      'Ավանի Gold’s Gym մասնաճյուղ՝ հարմար հյուսիսային Երևանի համար։',
      'Avan Gold’s Gym location for northern Yerevan.',
      'Филиал Gold’s Gym в Аване для севера Еревана.',
    ),
  },
  {
    name: 'Reebok Sports Club',
    slug: 'reebok-sports-club',
    district: 'Davtashen',
    phone: '+37410363636',
    address: L('Փիրումյաններ 5', '5 Pirumyanner St', 'ул. Пирумяннер 5'),
    amenities: ['pool', 'sauna', 'parking', 'cardio', 'group_classes', 'shower'],
    featured: true,
    blurb: L(
      'Մեծ սպորտային համալիր՝ լողավազանով, սաունայով և ֆիթնես գոտիներով։',
      'Large sports club with pool, sauna, and full fitness floors.',
      'Крупный спортклуб с бассейном, сауной и фитнес-зонами.',
    ),
  },
  {
    name: 'Orange Premium Fitness',
    slug: 'orange-premium-fitness',
    district: 'Kentron',
    phone: '+37477522020',
    address: L(
      'Ծիծեռնակաբերդի խճուղի 7/1',
      '7/1 Tsitsernakaberd Highway',
      'Цицернакабердское шоссе 7/1',
    ),
    amenities: ['pool', 'sauna', 'parking', 'cardio', 'group_classes', 'personal_training'],
    featured: true,
    blurb: L(
      'Premium ակումբ՝ լողավազանով, SPA-ով և խմբային ծրագրերով։',
      'Premium club with pool, spa, and group programs.',
      'Премиум-клуб с бассейном, SPA и групповыми программами.',
    ),
  },
  {
    name: 'Grand Sport',
    slug: 'grand-sport-yerevan',
    district: 'Malatia-Sebastia',
    phone: '+37410447766',
    address: L('Հրանտ Վարդանյան 2', '2 Hrant Vardanyan St', 'ул. Гранта Варданяна 2'),
    amenities: ['parking', 'cardio', 'personal_training', 'shower', 'group_classes'],
    featured: true,
    blurb: L(
      'Սպորտային և առողջարար համալիր Մալաթիա-Սեբաստիայում։',
      'Sports and wellness complex in Malatia-Sebastia.',
      'Спортивно-оздоровительный комплекс в Малатии-Себастии.',
    ),
  },
  {
    name: 'Aquatek Sport Complex',
    slug: 'aquatek-sport-complex',
    district: 'Nor Nork',
    phone: '+37410588888',
    address: L('Մյասնիկյան պող. 40/2', '40/2 Myasnikyan Ave', 'пр. Мясникяна 40/2'),
    amenities: ['pool', 'parking', 'cardio', 'sauna', 'shower'],
    featured: true,
    blurb: L(
      'Սպորտաառողջարար համալիր լողավազանով և մարզասրահով։',
      'Sports complex with swimming pool and gym floors.',
      'Спортивно-оздоровительный комплекс с бассейном и залом.',
    ),
  },
  {
    name: 'FeelFit',
    slug: 'feelfit-yerevan',
    district: 'Arabkir',
    phone: '+37441776776',
    address: L('Նիկողայոս Ադոնց 6', '6 Nikoghayos Adonts St', 'ул. Никогайоса Адонца 6'),
    amenities: ['cardio', 'personal_training', 'group_classes', 'shower'],
    featured: false,
    blurb: L(
      'Ժամանակակից ֆիթնես ստուդիա Արաբկիրում։',
      'Modern fitness studio in Arabkir.',
      'Современная фитнес-студия в Арабкире.',
    ),
  },
  {
    name: 'Neo Gym',
    slug: 'neo-gym-yerevan',
    district: 'Arabkir',
    phone: '+37498505050',
    address: L(
      'Վաղարշ Վաղարշյան 12/4',
      '12/4 Vagharsh Vagharshyan St',
      'ул. Вагарша Вагаршяна 12/4',
    ),
    amenities: ['cardio', 'personal_training', 'shower', 'parking'],
    featured: false,
    blurb: L(
      'Կոմպակտ մարզասրահ ուժային և կարդիո պարապմունքների համար։',
      'Compact gym for strength and cardio training.',
      'Компактный зал для силовых и кардиотренировок.',
    ),
  },
  {
    name: 'Armenian Power Club',
    slug: 'armenian-power-club',
    district: 'Arabkir',
    phone: '+37494112233',
    address: L('Նիկողայոս Ադոնց 4/3', '4/3 Nikoghayos Adonts St', 'ул. Никогайоса Адонца 4/3'),
    amenities: ['personal_training', 'shower', 'cardio'],
    featured: false,
    blurb: L(
      'Ուժային պարապմունքների վրա կենտրոնացած ակումբ։',
      'Strength-focused training club.',
      'Клуб с упором на силовые тренировки.',
    ),
  },
  {
    name: 'Star Gym Alek Manukyan',
    slug: 'star-gym-alek-manukyan',
    district: 'Kentron',
    phone: '+37410555501',
    address: L('Ալեք Մանուկյան 9', '9 Alek Manukyan St', 'ул. Алека Манукяна 9'),
    amenities: ['cardio', 'personal_training', 'group_classes', 'shower'],
    featured: false,
    blurb: L(
      'Star Gym ցանցի մասնաճյուղ Ալեք Մանուկյան փողոցում։',
      'Star Gym branch on Alek Manukyan Street.',
      'Филиал Star Gym на улице Алека Манукяна.',
    ),
  },
  {
    name: 'Star Gym Arami',
    slug: 'star-gym-arami',
    district: 'Kentron',
    phone: '+37410555502',
    address: L('Արամի 70', '70 Arami St', 'ул. Арами 70'),
    amenities: ['cardio', 'personal_training', 'shower', '24h'],
    featured: false,
    blurb: L(
      'Կենտրոնի Star Gym՝ հարմար գրաֆիկով։',
      'Downtown Star Gym with flexible hours.',
      'Star Gym в центре с удобным графиком.',
    ),
  },
  {
    name: 'Multi Wellness Centre',
    slug: 'multi-wellness-centre',
    district: 'Kentron',
    phone: '+37411880880',
    address: L('Խանջյան 31', '31 Khanjyan St', 'ул. Ханджяна 31'),
    amenities: ['pool', 'sauna', 'cardio', 'group_classes', 'parking'],
    featured: true,
    blurb: L(
      'Առողջարար կենտրոն լողավազանով և ֆիթնես ծրագրերով։',
      'Wellness centre with pool and fitness programs.',
      'Велнес-центр с бассейном и фитнес-программами.',
    ),
  },
  {
    name: 'Body & Soul by Dvin',
    slug: 'body-soul-dvin',
    district: 'Kentron',
    phone: '+37410536600',
    address: L('Հանրապետության հրապարակ', 'Republic Square area', 'площадь Республики'),
    amenities: ['sauna', 'cardio', 'personal_training', 'group_classes'],
    featured: false,
    blurb: L(
      'Հյուրանոցային ֆիթնես կենտրոն կենտրոնում։',
      'Hotel fitness centre in downtown Yerevan.',
      'Отельный фитнес-центр в центре Еревана.',
    ),
  },
];

const GYMS: GymDef[] = [...DEMO_GYMS, ...REAL_YEREVAN_GYMS];

function buildWorkingHours(index: number) {
  const weekday =
    index % 3 === 0 ? '06:00-23:00' : index % 3 === 1 ? '07:00-22:30' : '08:00-23:00';
  const saturday = index % 2 === 0 ? '09:00-21:00' : '08:00-22:00';
  const sunday =
    index % 4 === 0 ? 'closed' : index % 4 === 1 ? '10:00-18:00' : '09:00-20:00';

  return {
    mon: weekday,
    tue: weekday,
    wed: weekday,
    thu: weekday,
    fri: weekday,
    sat: saturday,
    sun: sunday,
    note:
      index % 2 === 0
        ? L(
            'Տոնական օրերին ժամերը կարող են փոխվել',
            'Hours may change on public holidays',
            'В праздничные дни часы могут меняться',
          )
        : L(
            'Առավոտյան խմբային պարապմունքներ՝ ըստ գրաֆիկի',
            'Morning group classes according to the schedule',
            'Утренние групповые занятия по расписанию',
          ),
  };
}

function buildGymDescription(
  gymName: string,
  district: District,
  blurb?: Localized,
): string {
  const d = DISTRICT_LABELS[district];
  if (blurb) {
    return Ljson(
      `${blurb.hy} Գտնվում է Երևանի ${d.hy} շրջանում։`,
      `${blurb.en} Located in Yerevan’s ${d.en} district.`,
      `${blurb.ru} Расположен в районе ${d.ru} Еревана.`,
    );
  }
  return Ljson(
    `${gymName}-ը Երևանի ${d.hy} շրջանում է։ Ժամանակակից սարքավորումներ, պրոֆեսիոնալ մարզիչներ և հարմարավետ միջավայր։`,
    `${gymName} is in Yerevan’s ${d.en} district. Modern equipment, professional trainers, and a comfortable space.`,
    `${gymName} находится в районе ${d.ru} Еревана. Современное оборудование, профессиональные тренеры и комфортная атмосфера.`,
  );
}

function buildAddress(district: District, streetNumber: number): string {
  const d = DISTRICT_LABELS[district];
  return Ljson(
    `${d.hy}, փողոց ${streetNumber}`,
    `${d.en}, street ${streetNumber}`,
    `${d.ru}, улица ${streetNumber}`,
  );
}

function formatAddress(address: Localized): string {
  return Ljson(address.hy, address.en, address.ru);
}

function buildPlans(index: number, gymName: string) {
  const base = 16000 + index * 700;
  return [
    {
      title: Ljson('Օրվա անցագիր', 'Day pass', 'Дневной абонемент'),
      description: Ljson(
        `1 օր մուտք ${gymName}՝ բոլոր գոտիներ`,
        `1-day access to ${gymName} — all zones`,
        `1 день доступа в ${gymName} — все зоны`,
      ),
      priceAmd: 2500 + index * 150,
      durationDays: 1 as number | null,
    },
    {
      title: Ljson('1 ամիս', '1 month', '1 месяц'),
      description: Ljson(
        'Անսահմանափակ մուտք · պահարան · ցնցուղ',
        'Unlimited access · locker · showers',
        'Безлимитный доступ · шкафчик · душ',
      ),
      priceAmd: base,
      durationDays: 30 as number | null,
    },
    {
      title: Ljson('3 ամիս', '3 months', '3 месяца'),
      description: Ljson(
        'Խնայող փաթեթ · 1 անվճար անհատական պարապմունք',
        'Value pack · 1 free personal training session',
        'Выгодный пакет · 1 бесплатная персональная тренировка',
      ),
      priceAmd: Math.round(base * 2.6),
      durationDays: 90 as number | null,
    },
    {
      title: Ljson('12 ամիս', '12 months', '12 месяцев'),
      description: Ljson(
        'Ամենաեկամտաբեր · սառեցում մինչև 30 օր',
        'Best annual value · freeze up to 30 days',
        'Самый выгодный год · заморозка до 30 дней',
      ),
      priceAmd: Math.round(base * 9.2),
      durationDays: 365 as number | null,
    },
    {
      title: Ljson(
        'Անհատական · 8 պարապմունք',
        'Personal training · 8 sessions',
        'Персональные · 8 тренировок',
      ),
      description: Ljson(
        'Անհատական մարզումներ մարզչի հետ',
        'Personal training sessions with a coach',
        'Индивидуальные тренировки с тренером',
      ),
      priceAmd: 48000 + index * 2000,
      durationDays: null as number | null,
    },
  ];
}

async function upsertUser(
  email: string,
  role: Role,
  fullName: string,
  password: string,
  avatarUrl?: string,
) {
  const passwordHash = await argon2.hash(password);
  return prisma.user.upsert({
    where: { email },
    update: { role, fullName, passwordHash, avatarUrl },
    create: { email, role, fullName, passwordHash, avatarUrl },
  });
}

async function main() {
  const admin = await upsertUser(
    'admin@gymhub.am',
    'ADMIN',
    'GymHub Admin',
    'Admin123!',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80',
  );
  const demoUser = await upsertUser(
    'user@gymhub.am',
    'USER',
    'Demo User',
    'User12345!',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
  );

  const reebokOwner = await upsertUser(
    'reebok@gymhub.am',
    'GYM_OWNER',
    'Reebok Owner',
    'Owner123!',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&crop=faces&w=200&h=200&q=80',
  );

  const owners = [];
  for (let i = 0; i < GYMS.length; i += 1) {
    if (GYMS[i].slug === 'reebok-sports-club') {
      owners.push(reebokOwner);
      continue;
    }
    owners.push(
      await upsertUser(
        `owner${i + 1}@gymhub.am`,
        'GYM_OWNER',
        `${GYMS[i].name} Owner`,
        'Owner123!',
      ),
    );
  }

  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setMonth(endsAt.getMonth() + 2);

  for (let i = 0; i < GYMS.length; i += 1) {
    const def = GYMS[i];
    const owner = owners[i];
    const district = def.district ?? DISTRICTS[i % DISTRICTS.length];
    const isPending = def.slug === 'steel-district';
    const isExpired = def.slug === 'phoenix-fit';
    const description = buildGymDescription(def.name, district, def.blurb);
    const address = def.address
      ? formatAddress(def.address)
      : buildAddress(district, 10 + i);
    const phone = def.phone ?? `+3749111${String(1000 + i).slice(-4)}`;

    const gym = await prisma.gym.upsert({
      where: { slug: def.slug },
      update: {
        name: def.name,
        description,
        city: 'Yerevan',
        district,
        address,
        phone,
        amenities: def.amenities,
        isFeatured: def.featured,
        moderationStatus: isPending ? 'PENDING' : 'APPROVED',
        completenessScore: 90,
        workingHours: buildWorkingHours(i),
        ratingAvg: 4.2 + (i % 8) * 0.1,
        ratingCount: 12 + i * 3,
        viewCount: 50 + i * 17,
        ownerId: owner.id,
      },
      create: {
        ownerId: owner.id,
        slug: def.slug,
        name: def.name,
        description,
        city: 'Yerevan',
        district,
        address,
        phone,
        amenities: def.amenities,
        isFeatured: def.featured,
        moderationStatus: isPending ? 'PENDING' : 'APPROVED',
        completenessScore: 90,
        workingHours: buildWorkingHours(i),
        ratingAvg: 4.2 + (i % 8) * 0.1,
        ratingCount: 12 + i * 3,
        viewCount: 50 + i * 17,
      },
    });

    await prisma.gymMedia.deleteMany({ where: { gymId: gym.id } });
    await prisma.trainer.deleteMany({ where: { gymId: gym.id } });
    await prisma.membershipPlan.deleteMany({ where: { gymId: gym.id } });
    await prisma.lead.deleteMany({ where: { gymId: gym.id } });

    for (let m = 0; m < 5; m += 1) {
      await prisma.gymMedia.create({
        data: {
          gymId: gym.id,
          url: PLACEHOLDER[(i + m) % PLACEHOLDER.length],
          kind: m === 0 ? 'cover' : 'gallery',
          sortOrder: m,
        },
      });
    }

    const trainers = [
      {
        name: 'Aram Sargsyan',
        specialization: 'strength',
        gender: 'male' as const,
        bio: Ljson(
          'Aram Sargsyan — փորձառու ուժային մարզիչ։',
          'Aram Sargsyan — experienced strength coach.',
          'Aram Sargsyan — опытный тренер по силовым.',
        ),
      },
      {
        name: 'Ani Hovhannisyan',
        specialization: 'cardio_hiit',
        gender: 'female' as const,
        bio: Ljson(
          'Ani Hovhannisyan — կարդիո և HIIT մասնագետ։',
          'Ani Hovhannisyan — Cardio / HIIT specialist.',
          'Ani Hovhannisyan — специалист по кардио и HIIT.',
        ),
      },
      {
        name: 'Davit Grigoryan',
        specialization: 'crossfit',
        gender: 'male' as const,
        bio: Ljson(
          'Davit Grigoryan — CrossFit մարզիչ։',
          'Davit Grigoryan — CrossFit coach.',
          'Davit Grigoryan — тренер CrossFit.',
        ),
      },
    ];
    for (let tIndex = 0; tIndex < trainers.slice(0, 2 + (i % 2)).length; tIndex += 1) {
      const t = trainers[tIndex];
      const pool =
        t.gender === 'female' ? FEMALE_TRAINER_PHOTOS : MALE_TRAINER_PHOTOS;
      await prisma.trainer.create({
        data: {
          gymId: gym.id,
          name: t.name,
          specialization: t.specialization,
          photoUrl: pool[(i + tIndex) % pool.length],
          bio: t.bio,
        },
      });
    }

    const plans = buildPlans(i, def.name);
    for (const plan of plans) {
      await prisma.membershipPlan.create({
        data: {
          gymId: gym.id,
          title: plan.title,
          description: plan.description,
          priceAmd: plan.priceAmd,
          durationDays: plan.durationDays,
          isActive: true,
        },
      });
    }

    await prisma.gymSubscription.deleteMany({ where: { gymId: gym.id } });
    if (!isPending) {
      await prisma.gymSubscription.create({
        data: {
          gymId: gym.id,
          status: isExpired ? 'EXPIRED' : 'ACTIVE',
          priceAmd: 10000,
          startsAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
          endsAt: isExpired
            ? new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
            : endsAt,
        },
      });
    }

    if (!isPending && !isExpired) {
      await prisma.lead.create({
        data: {
          gymId: gym.id,
          userId: demoUser.id,
          name: 'Narek Petrosyan',
          phone: '+37491112233',
          note: Ljson(
            'Ուզում եմ փորձել 1 օր',
            'Want a 1-day trial',
            'Хочу пробный день',
          ),
          wantsTrialDay: true,
          status: i % 2 === 0 ? 'NEW' : 'READ',
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete', {
    admin: admin.email,
    owners: owners.length,
    gyms: GYMS.length,
    demoUser: demoUser.email,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
