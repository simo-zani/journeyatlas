/**
 * Colori per la striscia sinistra della card "biglietto" dei mezzi.
 *
 * Le compagnie più comuni hanno la loro livrea reale (verificata a mano);
 * le altre ricevono un gradiente stabile calcolato dal nome, così ogni
 * compagnia ha sempre lo stesso colore da una visita all'altra senza dover
 * mantenere una tabella con tutte le ~100 compagnie del dataset.
 */

export type Gradient = readonly [string, string];

/** Chiave = designatore IATA a due lettere, come in `Airline.iata`. */
const AIRLINE_GRADIENTS: Record<string, Gradient> = {
  AZ: ['#0a1e42', '#1d3f7a'], // ITA Airways
  BA: ['#0a2a53', '#1c5aa8'], // British Airways
  IB: ['#7a0a1f', '#c60c30'], // Iberia
  FR: ['#073590', '#f2c608'], // Ryanair
  U2: ['#ff8c00', '#d54900'], // easyJet
  VY: ['#2b2b2b', '#ffcc00'], // Vueling
  AF: ['#0b1f4d', '#1b3f7a'], // Air France
  KL: ['#00305a', '#00a1de'], // KLM
  LH: ['#05164d', '#1c2f6b'], // Lufthansa
  LX: ['#7a0000', '#cc0000'], // SWISS
  OS: ['#7a0d12', '#ed1c24'], // Austrian Airlines
  AY: ['#0f1689', '#00ade6'], // Finnair
  DY: ['#7a1015', '#d2232a'], // Norwegian
  W6: ['#4a004f', '#c6007e'], // Wizz Air
  SK: ['#003057', '#1c5c99'], // SAS
  SN: ['#00205b', '#0072ce'], // Brussels Airlines
  OK: ['#004990', '#0071bc'], // Czech Airlines
  OU: ['#8a0212', '#d0021b'], // Croatia Airlines
  A3: ['#00338d', '#3e9be0'], // Aegean Airlines
  EK: ['#8a0f14', '#d71921'], // Emirates
  QR: ['#3a0420', '#5c0632'], // Qatar Airways
  TK: ['#7a0000', '#c90c0f'], // Turkish Airlines
  AA: ['#0f3c78', '#4189dd'], // American Airlines
  DL: ['#7a0a1d', '#c8102e'], // Delta Air Lines
  UA: ['#002244', '#005daa'], // United Airlines
  AS: ['#01426a', '#00b2a9'], // Alaska Airlines
  WN: ['#304cb2', '#1da1e5'], // Southwest Airlines
  B6: ['#00205b', '#0033a0'], // JetBlue
  AC: ['#1a1a1a', '#d22730'], // Air Canada
  LA: ['#4b0f2c', '#c8102e'], // LATAM Airlines
  AV: ['#7a0016', '#e4022d'], // Avianca
  CM: ['#003da5', '#54bbe9'], // Copa Airlines
  G3: ['#b34700', '#ff6900'], // Gol Linhas Aéreas
  AM: ['#0f2a5f', '#1c4f9c'], // Aeroméxico
  QF: ['#7a0212', '#e40521'], // Qantas
  SQ: ['#0033a0', '#f5a623'], // Singapore Airlines
  CX: ['#006564', '#00a19a'], // Cathay Pacific
  NH: ['#13448f', '#4aa8de'], // ANA
  JL: ['#7a0a15', '#c8102e'], // Japan Airlines
  KE: ['#00256c', '#1da1e5'], // Korean Air
  TG: ['#3a0a5c', '#4b0082'], // Thai Airways
  GA: ['#003876', '#2e9e6d'], // Garuda Indonesia
  UX: ['#5a0a10', '#a3122c'], // Air Europa
  EW: ['#4a0812', '#8f1b2c'], // Eurowings
  TP: ['#5a0010', '#a3122c'], // TAP Air Portugal
};

/** Palette usata per le compagnie senza colori curati: dieci coppie pensate
 *  per restare leggibili sotto un logo bianco e distinguersi bene tra loro. */
const FALLBACK_GRADIENTS: readonly Gradient[] = [
  ['#1b2a4a', '#3a5a8c'],
  ['#2e1a47', '#6a3ea1'],
  ['#0f3d3e', '#1f7a6c'],
  ['#4a1942', '#a13e77'],
  ['#3a2410', '#a15c1f'],
  ['#1a3a1a', '#3f8f4f'],
  ['#4a1010', '#a12f2f'],
  ['#0d2b45', '#1d6fa5'],
  ['#3a1a1a', '#8c4a2f'],
  ['#20203a', '#4f4f8f'],
];

/** Hash stabile e semplice: non serve crittografico, solo deterministico. */
const hashString = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

/** Gradiente per una compagnia aerea, dato il suo codice IATA (se noto) e/o
 *  nome. Il nome guida l'hash di riserva così resta stabile anche per una
 *  compagnia scritta a mano, senza codice IATA riconosciuto. */
export const airlineGradient = (iata: string | null | undefined, name: string | null | undefined): Gradient => {
  const key = iata?.trim().toUpperCase();
  if (key && AIRLINE_GRADIENTS[key]) return AIRLINE_GRADIENTS[key];
  const seed = (name?.trim() || key || 'default').toLowerCase();
  return FALLBACK_GRADIENTS[hashString(seed) % FALLBACK_GRADIENTS.length];
};

/** Gradienti neutri per i mezzi senza compagnia (treno, pullman, traghetto,
 *  auto, altro) — non derivano da un hash: sono fissi, uno per tipo, per
 *  restare riconoscibili a colpo d'occhio nella lista. */
export const BUS_YELLOW_GRADIENT: Gradient = ['#b45309', '#f59e0b'];

export const TRANSPORT_TYPE_GRADIENTS: Record<string, Gradient> = {
  train: ['#1e293b', '#475569'],
  bus: BUS_YELLOW_GRADIENT,
  ferry: ['#0d2b45', '#1d6fa5'],
  car: ['#292524', '#78716c'],
  other: ['#1f2937', '#4b5563'],
};

export const trainOperatorGradient = (
  operator: { gradient: Gradient } | null | undefined,
  name: string | null | undefined
): Gradient => {
  if (operator?.gradient) return operator.gradient;
  const n = (name || '').trim().toLowerCase();
  if (n.includes('trenitalia') || n.includes('ferrovie')) return ['#00693e', '#c1152a'];
  if (n.includes('italo') || n.includes('ntv')) return ['#6c0d1e', '#b81438'];
  if (n.includes('frecciarossa')) return ['#8f0014', '#d91b24'];
  if (n.includes('trenord')) return ['#004f2f', '#009a49'];
  if (n.includes('sncf') || n.includes('tgv')) return ['#541426', '#871b38'];
  if (n.includes('db') || n.includes('deutsche')) return ['#b80c0c', '#e61414'];
  if (n.includes('renfe')) return ['#61183e', '#91235b'];
  if (n.includes('sbb')) return ['#b30000', '#e60000'];
  if (n.includes('obb') || n.includes('öbb')) return ['#ba190a', '#da2614'];
  if (n.includes('eurostar')) return ['#082a4d', '#e09b00'];
  if (n.includes('shinkansen') || n.includes('japan rail') || n.includes('jr')) return ['#003366', '#0066cc'];
  if (n.includes('china railway') || n.includes('gaotie')) return ['#a80000', '#d81b24'];
  if (n.includes('indian rail') || n.includes('vande bharat')) return ['#002855', '#c86f00'];
  if (n.includes('amtrak')) return ['#002552', '#004c82'];
  if (n.includes('brightline')) return ['#c99a00', '#facc15'];
  if (n.includes('via rail')) return ['#9a6700', '#eab308'];
  if (n.includes('ghan') || n.includes('journey beyond')) return ['#78281f', '#b45309'];
  if (n.includes('korail') || n.includes('ktx')) return ['#1d4ed8', '#0284c7'];
  if (n) return FALLBACK_GRADIENTS[hashString(n) % FALLBACK_GRADIENTS.length];
  return TRANSPORT_TYPE_GRADIENTS.train;
};

export const busOperatorGradient = (_name?: string | null | undefined): Gradient => {
  return BUS_YELLOW_GRADIENT;
};


