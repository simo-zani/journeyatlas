import { foldText } from '@/lib/countries';

export type Gradient = readonly [string, string];

export interface TrainOperator {
  id: string;
  name: string;
  code: string;
  country: string;
  logo: string | null;
  gradient: Gradient;
  aliases: string[];
}

export const TRAIN_OPERATORS: TrainOperator[] = [
  // ── Italia ──
  {
    id: 'trenitalia',
    name: 'Trenitalia',
    code: 'FS',
    country: 'IT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Trenitalia_logo.svg/250px-Trenitalia_logo.svg.png',
    gradient: ['#00693e', '#c1152a'],
    aliases: ['fs', 'ferrovie dello stato', 'treni italia', 'regionale', 'intercity'],
  },
  {
    id: 'italo',
    name: 'Italo',
    code: 'NTV',
    country: 'IT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Italo_Treno_Logo.svg/250px-Italo_Treno_Logo.svg.png',
    gradient: ['#6c0d1e', '#b81438'],
    aliases: ['ntv', 'nuovo trasporto viaggiatori', 'italotreno', 'italo evo'],
  },
  {
    id: 'frecciarossa',
    name: 'Frecciarossa',
    code: 'FR',
    country: 'IT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Logo_Frecciarossa.svg/250px-Logo_Frecciarossa.svg.png',
    gradient: ['#8f0014', '#d91b24'],
    aliases: ['freccia rossa', 'fr', 'trenitalia', '1000'],
  },
  {
    id: 'frecciargento',
    name: 'Frecciargento',
    code: 'FA',
    country: 'IT',
    logo: null,
    gradient: ['#383838', '#707070'],
    aliases: ['freccia argento', 'fa', 'trenitalia'],
  },
  {
    id: 'frecciabianca',
    name: 'Frecciabianca',
    code: 'FB',
    country: 'IT',
    logo: null,
    gradient: ['#002f5e', '#005eaa'],
    aliases: ['freccia bianca', 'fb', 'trenitalia'],
  },
  {
    id: 'trenord',
    name: 'Trenord',
    code: 'TN',
    country: 'IT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Trenord_logo.svg/250px-Trenord_logo.svg.png',
    gradient: ['#004f2f', '#009a49'],
    aliases: ['nord', 'fnm', 'ferrovie nord', 'malpensa express'],
  },
  {
    id: 'fse',
    name: 'Ferrovie del Sud Est',
    code: 'FSE',
    country: 'IT',
    logo: null,
    gradient: ['#9c0f24', '#cc1b34'],
    aliases: ['fse', 'sud est', 'puglia'],
  },
  {
    id: 'tper',
    name: 'TPER',
    code: 'TPER',
    country: 'IT',
    logo: null,
    gradient: ['#9b1227', '#db1e3a'],
    aliases: ['trenitalia tper', 'emilia romagna'],
  },

  // ── Giappone (Japan) ──
  {
    id: 'shinkansen',
    name: 'Shinkansen (JR Bullet Train)',
    code: 'JR',
    country: 'JP',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/JR_logo_%28East%29.svg/250px-JR_logo_%28East%29.svg.png',
    gradient: ['#003366', '#0066cc'],
    aliases: ['shinkansen', 'bullet train', 'japan railways', 'jr', 'nozomi', 'hikari', 'hayabusa', 'giappone', 'treno proiettile'],
  },
  {
    id: 'jr-east',
    name: 'JR East',
    code: 'JRE',
    country: 'JP',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/JR_logo_%28East%29.svg/250px-JR_logo_%28East%29.svg.png',
    gradient: ['#006c36', '#009448'],
    aliases: ['jr east', 'east japan railway', 'tokyo jr'],
  },
  {
    id: 'jr-central',
    name: 'JR Central',
    code: 'JRC',
    country: 'JP',
    logo: null,
    gradient: ['#c95100', '#f58220'],
    aliases: ['jr central', 'jr tokaido', 'nagoya jr'],
  },
  {
    id: 'jr-west',
    name: 'JR West',
    code: 'JRW',
    country: 'JP',
    logo: null,
    gradient: ['#005596', '#0085ca'],
    aliases: ['jr west', 'osaka jr', 'kyoto jr'],
  },

  // ── Cina (China) ──
  {
    id: 'china-railway',
    name: 'China Railway (CR 高铁)',
    code: 'CR',
    country: 'CN',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/China_Railway_logo.svg/250px-China_Railway_logo.svg.png',
    gradient: ['#a80000', '#d81b24'],
    aliases: ['china railway', 'cr', 'crh', 'gaotie', 'fuxing', 'hexie', 'cina', 'china high speed'],
  },

  // ── India ──
  {
    id: 'indian-railways',
    name: 'Indian Railways',
    code: 'IR',
    country: 'IN',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Indian_Railways_logo.svg/250px-Indian_Railways_logo.svg.png',
    gradient: ['#002855', '#c86f00'],
    aliases: ['indian railways', 'ir', 'rajdhani', 'shatabdi', 'irctc', 'india'],
  },
  {
    id: 'vande-bharat',
    name: 'Vande Bharat Express',
    code: 'VB',
    country: 'IN',
    logo: null,
    gradient: ['#1e3a8a', '#f59e0b'],
    aliases: ['vande bharat', 'train 18', 'india express'],
  },

  // ── Stati Uniti (USA) ──
  {
    id: 'amtrak',
    name: 'Amtrak',
    code: 'AMTK',
    country: 'US',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Amtrak_logo.svg/250px-Amtrak_logo.svg.png',
    gradient: ['#002552', '#004c82'],
    aliases: ['amtrak', 'acela', 'northeast regional', 'usa', 'america', 'stati uniti'],
  },
  {
    id: 'brightline',
    name: 'Brightline',
    code: 'BL',
    country: 'US',
    logo: null,
    gradient: ['#c99a00', '#facc15'],
    aliases: ['brightline', 'florida', 'miami orlando'],
  },

  // ── Canada ──
  {
    id: 'via-rail',
    name: 'VIA Rail Canada',
    code: 'VIA',
    country: 'CA',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/VIA_Rail_logo.svg/250px-VIA_Rail_logo.svg.png',
    gradient: ['#9a6700', '#eab308'],
    aliases: ['via rail', 'canada', 'the canadian', 'canadian train'],
  },
  {
    id: 'rocky-mountaineer',
    name: 'Rocky Mountaineer',
    code: 'RMR',
    country: 'CA',
    logo: null,
    gradient: ['#1e3a5f', '#b45309'],
    aliases: ['rocky mountaineer', 'banff vancouver', 'canada train'],
  },

  // ── Australia ──
  {
    id: 'journey-beyond',
    name: 'Journey Beyond (The Ghan / Indian Pacific)',
    code: 'JB',
    country: 'AU',
    logo: null,
    gradient: ['#78281f', '#b45309'],
    aliases: ['the ghan', 'indian pacific', 'overland', 'great southern', 'journey beyond', 'australia'],
  },
  {
    id: 'nsw-trainlink',
    name: 'NSW TrainLink',
    code: 'NSW',
    country: 'AU',
    logo: null,
    gradient: ['#c2410c', '#f97316'],
    aliases: ['nsw trainlink', 'sydney train', 'australia nsw'],
  },
  {
    id: 'vline',
    name: 'V/Line',
    code: 'VLINE',
    country: 'AU',
    logo: null,
    gradient: ['#581c87', '#9333ea'],
    aliases: ['vline', 'melbourne train', 'victoria train'],
  },
  {
    id: 'queensland-rail',
    name: 'Queensland Rail',
    code: 'QR',
    country: 'AU',
    logo: null,
    gradient: ['#831843', '#be185d'],
    aliases: ['queensland rail', 'spirit of queensland', 'brisbane cairns'],
  },

  // ── Corea del Sud (South Korea) ──
  {
    id: 'korail-ktx',
    name: 'Korail (KTX)',
    code: 'KTX',
    country: 'KR',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Korail_logo.svg/250px-Korail_logo.svg.png',
    gradient: ['#1d4ed8', '#0284c7'],
    aliases: ['korail', 'ktx', 'corea', 'south korea', 'seoul busan high speed'],
  },

  // ── Taiwan ──
  {
    id: 'thsr',
    name: 'Taiwan High Speed Rail',
    code: 'THSR',
    country: 'TW',
    logo: null,
    gradient: ['#ea580c', '#f97316'],
    aliases: ['thsr', 'taiwan rail', 'taipei kaohsiung'],
  },

  // ── Marocco (Morocco) ──
  {
    id: 'oncf-al-boraq',
    name: 'ONCF (Al Boraq)',
    code: 'ONCF',
    country: 'MA',
    logo: null,
    gradient: ['#047857', '#b91c1c'],
    aliases: ['al boraq', 'oncf', 'marocco', 'morocco tgv', 'casablanca tangeri'],
  },

  // ── Arabia Saudita (Saudi Arabia) ──
  {
    id: 'haramain',
    name: 'Haramain High Speed Rail',
    code: 'HHR',
    country: 'SA',
    logo: null,
    gradient: ['#15803d', '#ca8a04'],
    aliases: ['hhr', 'haramain', 'mecca medina', 'sar saudi'],
  },

  // ── Indonesia ──
  {
    id: 'whoosh',
    name: 'Whoosh (KCJIC)',
    code: 'KCIC',
    country: 'ID',
    logo: null,
    gradient: ['#b91c1c', '#dc2626'],
    aliases: ['whoosh', 'kcic', 'jakarta bandung', 'indonesia high speed'],
  },

  // ── Thailandia ──
  {
    id: 'srt-thailand',
    name: 'State Railway of Thailand',
    code: 'SRT',
    country: 'TH',
    logo: null,
    gradient: ['#701a75', '#a21caf'],
    aliases: ['srt', 'thailand railway', 'bangkok train'],
  },

  // ── Malesia ──
  {
    id: 'ktm-malaysia',
    name: 'KTM Berhad (ETS)',
    code: 'KTM',
    country: 'MY',
    logo: null,
    gradient: ['#0369a1', '#e11d48'],
    aliases: ['ktm', 'ets', 'malaysia train', 'kuala lumpur train'],
  },

  // ── Perù (Machu Picchu) ──
  {
    id: 'perurail',
    name: 'PeruRail / Inca Rail',
    code: 'PERU',
    country: 'PE',
    logo: null,
    gradient: ['#1e3a8a', '#d97706'],
    aliases: ['perurail', 'inca rail', 'machu picchu train', 'cuzco peru', 'hiram bingham'],
  },

  // ── Messico ──
  {
    id: 'tren-maya',
    name: 'Tren Maya',
    code: 'TREN',
    country: 'MX',
    logo: null,
    gradient: ['#065f46', '#d97706'],
    aliases: ['tren maya', 'mexico train', 'cancun train'],
  },

  // ── Francia & Europa ──
  {
    id: 'sncf',
    name: 'SNCF',
    code: 'SNCF',
    country: 'FR',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Logo_SNCF_2011.svg/250px-Logo_SNCF_2011.svg.png',
    gradient: ['#541426', '#871b38'],
    aliases: ['ter', 'france', 'tgv'],
  },
  {
    id: 'tgv-inoui',
    name: 'TGV inOui',
    code: 'TGV',
    country: 'FR',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Logo_TGV_InOui.svg/250px-Logo_TGV_InOui.svg.png',
    gradient: ['#282828', '#6a1228'],
    aliases: ['tgv', 'inoui', 'sncf'],
  },
  {
    id: 'ouigo',
    name: 'Ouigo',
    code: 'OUIGO',
    country: 'FR',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Ouigo_logo.svg/250px-Ouigo_logo.svg.png',
    gradient: ['#00779b', '#d80074'],
    aliases: ['sncf', 'ouigo train'],
  },
  {
    id: 'db',
    name: 'Deutsche Bahn (DB)',
    code: 'DB',
    country: 'DE',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Deutsche_Bahn_AG-Logo.svg/250px-Deutsche_Bahn_AG-Logo.svg.png',
    gradient: ['#b80c0c', '#e61414'],
    aliases: ['deutsche bahn', 'db', 'ice', 'bahn', 'germania'],
  },
  {
    id: 'renfe',
    name: 'Renfe',
    code: 'RENFE',
    country: 'ES',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Renfe_logo.svg/250px-Renfe_logo.svg.png',
    gradient: ['#61183e', '#91235b'],
    aliases: ['ave', 'spagna', 'cercanias', 'avant'],
  },
  {
    id: 'iryo',
    name: 'Iryo',
    code: 'IRYO',
    country: 'ES',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Logo_iryo.svg/250px-Logo_iryo.svg.png',
    gradient: ['#99091b', '#d91823'],
    aliases: ['alta velocidad', 'spagna', 'iryo tren'],
  },
  {
    id: 'sbb',
    name: 'SBB CFF FFS',
    code: 'SBB',
    country: 'CH',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/SBB_CFF_FFS_logo.svg/250px-SBB_CFF_FFS_logo.svg.png',
    gradient: ['#b30000', '#e60000'],
    aliases: ['ferrovie federali svizzere', 'cff', 'ffs', 'svizzera'],
  },
  {
    id: 'rhb-glacier',
    name: 'RhB (Glacier & Bernina Express)',
    code: 'RhB',
    country: 'CH',
    logo: null,
    gradient: ['#b91c1c', '#dc2626'],
    aliases: ['glacier express', 'bernina express', 'rhatische bahn', 'st moritz', 'zermatt'],
  },
  {
    id: 'obb',
    name: 'ÖBB',
    code: 'ÖBB',
    country: 'AT',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/%C3%96BB_Logo.svg/250px-%C3%96BB_Logo.svg.png',
    gradient: ['#ba190a', '#da2614'],
    aliases: ['oebb', 'nightjet', 'railjet', 'austria'],
  },
  {
    id: 'eurostar',
    name: 'Eurostar',
    code: 'EST',
    country: 'GB',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Eurostar_2023.svg/250px-Eurostar_2023.svg.png',
    gradient: ['#082a4d', '#e09b00'],
    aliases: ['thalys', 'tunnel', 'channel', 'londra parigi'],
  },
  {
    id: 'flixtrain',
    name: 'FlixTrain',
    code: 'FLIX',
    country: 'DE',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/FlixTrain_logo.svg/250px-FlixTrain_logo.svg.png',
    gradient: ['#3e7804', '#68c200'],
    aliases: ['flix', 'flixbus train'],
  },
  {
    id: 'ns',
    name: 'NS (Nederlandse Spoorwegen)',
    code: 'NS',
    country: 'NL',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Nederlandse_Spoorwegen_logo.svg/250px-Nederlandse_Spoorwegen_logo.svg.png',
    gradient: ['#002b75', '#f2b705'],
    aliases: ['olanda', 'netherlands', 'ns train', 'amsterdam'],
  },
  {
    id: 'sncb',
    name: 'NMBS/SNCB',
    code: 'SNCB',
    country: 'BE',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/NMBS_SNCB_logo.svg/250px-NMBS_SNCB_logo.svg.png',
    gradient: ['#004c87', '#007ab8'],
    aliases: ['belgio', 'nmbs', 'sncb', 'bruxelles'],
  },
  {
    id: 'cp',
    name: 'CP (Comboios de Portugal)',
    code: 'CP',
    country: 'PT',
    logo: null,
    gradient: ['#005a3e', '#1d8f5c'],
    aliases: ['portogallo', 'comboios', 'alfa pendular'],
  },
  {
    id: 'regiojet',
    name: 'RegioJet',
    code: 'RJ',
    country: 'CZ',
    logo: null,
    gradient: ['#262626', '#e6ab00'],
    aliases: ['student agency', 'repubblica ceca', 'praga'],
  },
  {
    id: 'westbahn',
    name: 'WESTbahn',
    code: 'WEST',
    country: 'AT',
    logo: null,
    gradient: ['#00437a', '#6baa35'],
    aliases: ['austria train', 'west', 'vienna salisburgo'],
  },
];

let cache: TrainOperator[] | null = null;

export const loadTrainOperators = async (): Promise<TrainOperator[]> => {
  if (cache) return cache;
  cache = TRAIN_OPERATORS;
  return cache;
};

export const trainOperatorByName = (
  all: TrainOperator[],
  value: string | null | undefined
): TrainOperator | null => {
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

const scoreOperator = (op: TrainOperator, query: string): number => {
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

export const searchTrainOperators = (
  all: TrainOperator[],
  query: string,
  limit = 8
): TrainOperator[] => {
  const q = foldText(query.trim());
  if (!q) return all.slice(0, limit);
  return all
    .map((op) => ({ op, s: scoreOperator(op, q) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s || x.op.name.localeCompare(y.op.name))
    .slice(0, limit)
    .map((x) => x.op);
};
