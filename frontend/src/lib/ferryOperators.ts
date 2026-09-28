import { foldText } from '@/lib/countries';

export type Gradient = readonly [string, string];

export interface FerryOperator {
  id: string;
  name: string;
  code: string;
  country: string;
  logo: string | null;
  gradient: Gradient;
  aliases: string[];
}

export const FERRY_OPERATORS: FerryOperator[] = [
  // ── Italia: Traghetti & Compagnie Nazionali ──
  {
    id: 'moby',
    name: 'Moby Lines',
    code: 'MOBY',
    country: 'IT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Moby_Lines_Logo.svg/250px-Moby_Lines_Logo.svg.png',
    gradient: ['#003380', '#e6b800'],
    aliases: ['moby', 'moby lines', 'balena', 'sardegna', 'elba', 'corsica'],
  },
  {
    id: 'gnv',
    name: 'GNV (Grandi Navi Veloci)',
    code: 'GNV',
    country: 'IT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Grandi_Navi_Veloci_logo.svg/250px-Grandi_Navi_Veloci_logo.svg.png',
    gradient: ['#002244', '#0088cc'],
    aliases: ['gnv', 'grandi navi veloci', 'genova palermo', 'sicilia', 'sardegna'],
  },
  {
    id: 'tirrenia',
    name: 'Tirrenia',
    code: 'TIR',
    country: 'IT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Tirrenia_CIN_logo.svg/250px-Tirrenia_CIN_logo.svg.png',
    gradient: ['#002855', '#cc1b24'],
    aliases: ['tirrenia', 'cin', 'compagnia italiana navigazione', 'sardegna'],
  },
  {
    id: 'grimaldi',
    name: 'Grimaldi Lines',
    code: 'GRI',
    country: 'IT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Grimaldi_Lines_Logo.svg/250px-Grimaldi_Lines_Logo.svg.png',
    gradient: ['#001a4d', '#ffcc00'],
    aliases: ['grimaldi', 'grimaldi lines', 'spagna', 'grecia', 'sardegna'],
  },
  {
    id: 'corsica-ferries',
    name: 'Corsica Ferries - Sardinia Ferries',
    code: 'CF',
    country: 'IT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Corsica_Ferries_logo.svg/250px-Corsica_Ferries_logo.svg.png',
    gradient: ['#1a1a1a', '#e6b800'],
    aliases: ['corsica ferries', 'sardinia ferries', 'gialli', 'elba ferries'],
  },
  {
    id: 'caronte-tourist',
    name: 'Caronte & Tourist',
    code: 'C&T',
    country: 'IT',
    logo: null,
    gradient: ['#004488', '#e67300'],
    aliases: ['caronte', 'tourist', 'stretto messina', 'villa san giovanni'],
  },
  {
    id: 'caremar',
    name: 'Caremar',
    code: 'CAR',
    country: 'IT',
    logo: null,
    gradient: ['#003366', '#0077cc'],
    aliases: ['caremar', 'napoli', 'capri', 'ischia', 'procida'],
  },
  {
    id: 'snav',
    name: 'SNAV',
    code: 'SNAV',
    country: 'IT',
    logo: null,
    gradient: ['#002b55', '#0099cc'],
    aliases: ['snav', 'aliscafi', 'eolie', 'ancona spalato'],
  },
  {
    id: 'siremar',
    name: 'Siremar',
    code: 'SIR',
    country: 'IT',
    logo: null,
    gradient: ['#002a54', '#d9261c'],
    aliases: ['siremar', 'caronte', 'isole minori', 'egadi', 'eolie', 'pelagie'],
  },
  {
    id: 'delcomar',
    name: 'Delcomar',
    code: 'DEL',
    country: 'IT',
    logo: null,
    gradient: ['#003d73', '#3399ff'],
    aliases: ['delcomar', 'carloforte', 'la maddalena', 'calasetta'],
  },
  {
    id: 'msc-cruises',
    name: 'MSC Crociere',
    code: 'MSC',
    country: 'IT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/MSC_Cruises_logo.svg/250px-MSC_Cruises_logo.svg.png',
    gradient: ['#0a1d37', '#c29b38'],
    aliases: ['msc', 'msc crociere', 'msc cruises', 'crociera'],
  },
  {
    id: 'costa-cruises',
    name: 'Costa Crociere',
    code: 'COS',
    country: 'IT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Costa_Cruises_logo.svg/250px-Costa_Cruises_logo.svg.png',
    gradient: ['#00205b', '#f5be18'],
    aliases: ['costa', 'costa crociere', 'costa cruises', 'crociera'],
  },

  // ── Europa: Traghetti & Linee Marittime ──
  {
    id: 'dfds',
    name: 'DFDS Seaways',
    code: 'DFDS',
    country: 'DK',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/DFDS_Logo.svg/250px-DFDS_Logo.svg.png',
    gradient: ['#00203a', '#1064a3'],
    aliases: ['dfds', 'dfds seaways', 'dover calais', 'danimarca', 'manica'],
  },
  {
    id: 'po-ferries',
    name: 'P&O Ferries',
    code: 'PO',
    country: 'GB',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/P%26O_Ferries_Logo.svg/250px-P%26O_Ferries_Logo.svg.png',
    gradient: ['#002440', '#a80c2a'],
    aliases: ['po ferries', 'p and o', 'dover calais', 'uk ferry'],
  },
  {
    id: 'stena-line',
    name: 'Stena Line',
    code: 'STENA',
    country: 'SE',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Stena_Line_logo.svg/250px-Stena_Line_logo.svg.png',
    gradient: ['#00284d', '#d91424'],
    aliases: ['stena', 'stena line', 'svezia', 'irlanda', 'mare del nord'],
  },
  {
    id: 'brittany-ferries',
    name: 'Brittany Ferries',
    code: 'BF',
    country: 'FR',
    logo: null,
    gradient: ['#001a4d', '#cc0029'],
    aliases: ['brittany ferries', 'bretagna', 'uk spagna', 'manica'],
  },
  {
    id: 'irish-ferries',
    name: 'Irish Ferries',
    code: 'IF',
    country: 'IE',
    logo: null,
    gradient: ['#005a34', '#e66b00'],
    aliases: ['irish ferries', 'irlanda', 'dublino holyhead'],
  },
  {
    id: 'balearia',
    name: 'Baleària',
    code: 'BAL',
    country: 'ES',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Logo_Balearia.svg/250px-Logo_Balearia.svg.png',
    gradient: ['#006b6b', '#1ea89f'],
    aliases: ['balearia', 'baleari', 'ibiza', 'maiorca', 'formentera', 'spagna'],
  },
  {
    id: 'fred-olsen',
    name: 'Fred. Olsen Express',
    code: 'FRED',
    country: 'ES',
    logo: null,
    gradient: ['#002440', '#e6a800'],
    aliases: ['fred olsen', 'canarie', 'tenerife', 'gran canaria'],
  },
  {
    id: 'naviera-armas',
    name: 'Naviera Armas / Trasmed',
    code: 'ARMAS',
    country: 'ES',
    logo: null,
    gradient: ['#b3001e', '#e6a800'],
    aliases: ['naviera armas', 'trasmediterranea', 'trasmed', 'canarie'],
  },
  {
    id: 'blue-star-ferries',
    name: 'Blue Star Ferries',
    code: 'BSF',
    country: 'GR',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Blue_Star_Ferries_logo.svg/250px-Blue_Star_Ferries_logo.svg.png',
    gradient: ['#00284d', '#e69d00'],
    aliases: ['blue star', 'grecia', 'isole greche', 'cicladi', 'mykonos', 'santorini'],
  },
  {
    id: 'anek-lines',
    name: 'Anek Lines',
    code: 'ANEK',
    country: 'GR',
    logo: null,
    gradient: ['#002244', '#cc5500'],
    aliases: ['anek', 'anek lines', 'ancona grecia', 'patrasso', 'creta'],
  },
  {
    id: 'minoan-lines',
    name: 'Minoan Lines',
    code: 'MIN',
    country: 'GR',
    logo: null,
    gradient: ['#002454', '#b30922'],
    aliases: ['minoan', 'minoan lines', 'ancona igoumenitsa', 'creta'],
  },
  {
    id: 'hellenic-seaways',
    name: 'Hellenic Seaways',
    code: 'HSW',
    country: 'GR',
    logo: null,
    gradient: ['#001a4d', '#007acc'],
    aliases: ['hellenic seaways', 'highspeed', 'flying cat', 'pireo'],
  },
  {
    id: 'jadrolinija',
    name: 'Jadrolinija',
    code: 'JAD',
    country: 'HR',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Jadrolinija_logo.svg/250px-Jadrolinija_logo.svg.png',
    gradient: ['#002c66', '#bf1d23'],
    aliases: ['jadrolinija', 'croazia', 'spalato', 'dubrovnik', 'zara', 'hvar'],
  },
  {
    id: 'tallink-silja',
    name: 'Tallink & Silja Line',
    code: 'TAL',
    country: 'EE',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Tallink_Silja_logo.svg/250px-Tallink_Silja_logo.svg.png',
    gradient: ['#002866', '#008ecc'],
    aliases: ['tallink', 'silja line', 'helsinki tallinn', 'stoccolma', 'baltico'],
  },
  {
    id: 'viking-line',
    name: 'Viking Line',
    code: 'VIK',
    country: 'FI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Viking_Line_logo.svg/250px-Viking_Line_logo.svg.png',
    gradient: ['#a30822', '#c21b27'],
    aliases: ['viking line', 'finlandia', 'svezia', 'helsinki stoccolma'],
  },
  {
    id: 'color-line',
    name: 'Color Line',
    code: 'COL',
    country: 'NO',
    logo: null,
    gradient: ['#00224d', '#c21b27'],
    aliases: ['color line', 'norvegia', 'oslo kiel', 'kristiansand'],
  },
  {
    id: 'hurtigruten',
    name: 'Hurtigruten',
    code: 'HRG',
    country: 'NO',
    logo: null,
    gradient: ['#00203a', '#b31b1b'],
    aliases: ['hurtigruten', 'costa norvegese', 'fiordi', 'bergen kirkenes'],
  },

  // ── Mondo: Nord America, Oceania, Asia, America Latina ──
  {
    id: 'bc-ferries',
    name: 'BC Ferries',
    code: 'BCF',
    country: 'CA',
    logo: null,
    gradient: ['#002b55', '#008ecc'],
    aliases: ['bc ferries', 'british columbia', 'vancouver victoria', 'canada'],
  },
  {
    id: 'wsf',
    name: 'Washington State Ferries',
    code: 'WSF',
    country: 'US',
    logo: null,
    gradient: ['#003826', '#759975'],
    aliases: ['washington state ferries', 'seattle ferry', 'bainbridge island', 'puget sound'],
  },
  {
    id: 'nyc-ferry',
    name: 'NYC Ferry',
    code: 'NYCF',
    country: 'US',
    logo: null,
    gradient: ['#173385', '#0072b2'],
    aliases: ['nyc ferry', 'new york ferry', 'east river', 'brooklyn'],
  },
  {
    id: 'staten-island-ferry',
    name: 'Staten Island Ferry',
    code: 'SIF',
    country: 'US',
    logo: null,
    gradient: ['#d95300', '#002244'],
    aliases: ['staten island ferry', 'nyc', 'manhattan', 'statua della liberta'],
  },
  {
    id: 'interislander',
    name: 'Interislander (Cook Strait)',
    code: 'NZF',
    country: 'NZ',
    logo: null,
    gradient: ['#002244', '#16a34a'],
    aliases: ['interislander', 'bluebridge', 'nuova zelanda', 'wellington picton'],
  },
  {
    id: 'sydney-ferries',
    name: 'Sydney Ferries / Manly Ferry',
    code: 'SYDF',
    country: 'AU',
    logo: null,
    gradient: ['#004733', '#72b036'],
    aliases: ['sydney ferries', 'manly ferry', 'circular quay', 'australia'],
  },
  {
    id: 'rottnest-express',
    name: 'Rottnest Express',
    code: 'ROTT',
    country: 'AU',
    logo: null,
    gradient: ['#b3360b', '#ea580c'],
    aliases: ['rottnest express', 'perth', 'fremantle', 'quokka', 'australia'],
  },
  {
    id: 'star-ferry',
    name: 'Star Ferry',
    code: 'STAR',
    country: 'HK',
    logo: null,
    gradient: ['#004724', '#ffffff'],
    aliases: ['star ferry', 'hong kong', 'victoria harbour', 'tsim sha tsui'],
  },
  {
    id: 'turbojet',
    name: 'TurboJET / Cotai Water Jet',
    code: 'TJET',
    country: 'HK',
    logo: null,
    gradient: ['#b30922', '#001a4d'],
    aliases: ['turbojet', 'cotai water jet', 'hong kong macau ferry', 'aliscafo'],
  },
  {
    id: 'seatran-lomprayah',
    name: 'Lomprayah / Seatran Ferry',
    code: 'LOM',
    country: 'TH',
    logo: null,
    gradient: ['#026aa7', '#d97706'],
    aliases: ['lomprayah', 'seatran', 'thailand ferry', 'koh samui', 'koh phangan', 'koh tao'],
  },
  {
    id: 'batam-fast',
    name: 'Batam Fast Ferry',
    code: 'BFST',
    country: 'SG',
    logo: null,
    gradient: ['#b91c1c', '#1e3a8a'],
    aliases: ['batam fast', 'singapore batam', 'harbourfront'],
  },
  {
    id: 'buquebus',
    name: 'Buquebus / Colonia Express',
    code: 'BUQ',
    country: 'AR',
    logo: null,
    gradient: ['#002244', '#0284c7'],
    aliases: ['buquebus', 'colonia express', 'buenos aires montevideo', 'rio de la plata'],
  },
  {
    id: 'royal-caribbean',
    name: 'Royal Caribbean',
    code: 'RCCL',
    country: 'US',
    logo: null,
    gradient: ['#0a1d37', '#e6a800'],
    aliases: ['royal caribbean', 'crociera', 'celebrity cruises'],
  },
  {
    id: 'norwegian-cruise',
    name: 'Norwegian Cruise Line (NCL)',
    code: 'NCL',
    country: 'US',
    logo: null,
    gradient: ['#0277bd', '#0a1d37'],
    aliases: ['ncl', 'norwegian cruise line', 'crociera'],
  },
];

let cache: FerryOperator[] | null = null;

export const loadFerryOperators = async (): Promise<FerryOperator[]> => {
  if (cache) return cache;
  cache = FERRY_OPERATORS;
  return cache;
};

export const ferryOperatorByName = (
  all: FerryOperator[],
  value: string | null | undefined
): FerryOperator | null => {
  if (!value) return null;
  const q = foldText(value.trim());
  if (!q) return null;
  return (
    all.find((o) => {
      if (foldText(o.name) === q || foldText(o.code) === q || foldText(o.id) === q) return true;
      return o.aliases.some((alias) => foldText(alias) === q);
    }) ?? null
  );
};

const scoreFerryOperator = (op: FerryOperator, query: string): number => {
  const name = foldText(op.name);
  const code = foldText(op.code);
  const id = foldText(op.id);
  if (name === query || code === query || id === query) return 100;
  if (op.aliases.some((a) => foldText(a) === query)) return 95;
  if (name.startsWith(query) || code.startsWith(query) || id.startsWith(query)) return 80;
  if (op.aliases.some((a) => foldText(a).startsWith(query))) return 70;
  if (name.includes(query) || code.includes(query) || id.includes(query)) return 50;
  if (op.aliases.some((a) => foldText(a).includes(query))) return 40;
  return 0;
};

export const searchFerryOperators = (
  all: FerryOperator[],
  query: string,
  limit = 8
): FerryOperator[] => {
  const q = foldText(query.trim());
  if (!q) return all.slice(0, limit);
  return all
    .map((op) => ({ op, s: scoreFerryOperator(op, q) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s || x.op.name.localeCompare(y.op.name))
    .slice(0, limit)
    .map((x) => x.op);
};
