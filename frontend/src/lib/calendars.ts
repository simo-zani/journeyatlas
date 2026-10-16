/**
 * Calendari non gregoriani calcolati dal browser (Intl, dati ICU), senza API e senza scadenze:
 * date delle feste lunari di qualsiasi anno e anno "locale" (zodiaco cinese, era giapponese...).
 *
 * Le feste lunari si fissano con l'avvistamento della luna o con calcoli locali: le date qui
 * possono differire di un giorno da quelle ufficiali, per questo gli intervalli hanno un margine.
 */

import type { LocalText } from '@/lib/customs';

const DAY_MS = 86_400_000;

const formatters = new Map<string, Intl.DateTimeFormat>();
const formatter = (calendar: string, month: 'numeric' | 'long'): Intl.DateTimeFormat => {
  const key = `${calendar}:${month}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(`en-u-ca-${calendar}`, { timeZone: 'UTC', year: 'numeric', month, day: 'numeric' });
    formatters.set(key, f);
  }
  return f;
};

/** Mezzogiorno UTC del giorno ISO: lontano dai cambi di data in qualsiasi fuso. */
const noon = (iso: string): Date => new Date(`${iso}T12:00:00Z`);
const toIso = (d: Date): string => d.toISOString().slice(0, 10);
export const addDays = (iso: string, days: number): string => toIso(new Date(noon(iso).getTime() + days * DAY_MS));

const partsOf = (calendar: string, month: 'numeric' | 'long', d: Date): Record<string, string> =>
  Object.fromEntries(formatter(calendar, month).formatToParts(d).map((p) => [p.type, p.value]));

const cache = new Map<string, string[]>();
/** Giorni dell'anno gregoriano `year` che nel calendario `calendar` sono il giorno `day` del mese `month`. */
const datesInYear = (calendar: string, month: string, day: number, year: number, monthStyle: 'numeric' | 'long' = 'numeric'): string[] => {
  const key = `${calendar}:${month}:${day}:${year}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const found: string[] = [];
  for (let t = Date.UTC(year, 0, 1, 12); new Date(t).getUTCFullYear() === year; t += DAY_MS) {
    const p = partsOf(calendar, monthStyle, new Date(t));
    if (p.month === month && Number(p.day) === day) found.push(toIso(new Date(t)));
  }
  cache.set(key, found);
  return found;
};

/** Primo giorno di un mese lunare cinese (≈ luna nuova) che cade il giorno `fromMmDd` dell'anno o dopo. */
const newMoonOnOrAfter = (year: number, fromMmDd: string): string | null => {
  const from = `${year}-${fromMmDd}`;
  for (let i = 0; i < 40; i++) {
    const iso = addDays(from, i);
    if (Number(partsOf('chinese', 'numeric', noon(iso)).day) === 1) return iso;
  }
  return null;
};

type Range = [string, string];

// ---------------------------------------------------------------------------
// Feste lunari: intervalli (inclusi) che iniziano nell'anno gregoriano dato
// ---------------------------------------------------------------------------

/** Ramadan più i 3 giorni di Eid al-Fitr. In alcuni anni (es. 2030) il Ramadan inizia due volte. */
export const ramadanRanges = (year: number): Range[] =>
  datesInYear('islamic-umalqura', '9', 1, year).map((start) => {
    let i = 28;
    while (i < 32 && partsOf('islamic-umalqura', 'numeric', noon(addDays(start, i))).month !== '10') i++;
    return [start, addDays(start, i + 2)];
  });

/** Capodanno lunare (cinese, coreano, vietnamita): dalla vigilia a una settimana. */
export const lunarNewYearRanges = (year: number, calendar: 'chinese' | 'dangi' = 'chinese'): Range[] =>
  datesInYear(calendar, '1', 1, year).map((d) => [addDays(d, -1), addDays(d, 5)]);

/** Chuseok: 15° giorno dell'8° mese coreano, con il giorno prima e quello dopo. */
export const chuseokRanges = (year: number): Range[] => datesInYear('dangi', '8', 15, year).map((d) => [addDays(d, -1), addDays(d, 1)]);

/** Yom Kippur: 10 Tishri, dalla sera prima. */
export const yomKippurRanges = (year: number): Range[] =>
  datesInYear('hebrew', 'Tishri', 10, year, 'long').map((d) => [addDays(d, -1), d]);

/** Diwali: la luna nuova con il Sole in Bilancia siderale (dal ~17 ottobre; ora cinese, quindi dal 18).
 *  Il giorno è quello o il precedente. Verificato sulle date reali 2019-2027. */
export const diwaliRanges = (year: number): Range[] => {
  const nm = newMoonOnOrAfter(year, '10-18');
  return nm ? [[addDays(nm, -1), nm]] : [];
};

/** Holi: luna piena del mese Phalguna, che inizia con la luna nuova con il Sole in Acquario siderale
 *  (dal ~13 febbraio); la luna piena è ~15 giorni dopo e il giorno può slittare. Verificato 2019-2027. */
export const holiRanges = (year: number): Range[] => {
  const nm = newMoonOnOrAfter(year, '02-13');
  return nm ? [[addDays(nm, 13), addDays(nm, 16)]] : [];
};

/** Nyepi (Bali): il giorno della luna nuova dal 1° marzo in poi, o quello dopo. Verificato 2019-2026. */
export const nyepiRanges = (year: number): Range[] => {
  const nm = newMoonOnOrAfter(year, '03-01');
  return nm ? [[nm, addDays(nm, 1)]] : [];
};

/** Pasqua (gregoriana), algoritmo di Meeus/Jones/Butcher. */
const easter = (year: number): string => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/** Carnevale: dal venerdì al mercoledì delle Ceneri (46 giorni prima di Pasqua). */
export const carnivalRanges = (year: number): Range[] => {
  const ash = addDays(easter(year), -46);
  return [[addDays(ash, -5), ash]];
};

/** Settimana Santa: dalla Domenica delle Palme a Pasqua. */
export const holyWeekRanges = (year: number): Range[] => {
  const e = easter(year);
  return [[addDays(e, -7), e]];
};

/** Oktoberfest: finisce la prima domenica di ottobre (o il 3 ottobre se dopo), inizia il sabato 15 giorni prima. */
export const oktoberfestRanges = (year: number): Range[] => {
  const oct1 = noon(`${year}-10-01`);
  const firstSunday = addDays(`${year}-10-01`, (7 - oct1.getUTCDay()) % 7);
  const end = firstSunday < `${year}-10-03` ? `${year}-10-03` : firstSunday;
  return [[addDays(firstSunday, -15), end]];
};

/** Stesso intervallo ogni anno (MM-DD); se `end` viene prima di `start` finisce l'anno dopo. */
export const yearly =
  (start: string, end: string) =>
  (year: number): Range[] =>
    [[`${year}-${start}`, `${end < start ? year + 1 : year}-${end}`]];

// ---------------------------------------------------------------------------
// Anno "locale": zodiaco, ere e calendari usati su documenti e scontrini
// ---------------------------------------------------------------------------

const ANIMALS: { it: [string, string]; en: string }[] = [
  { it: ['del', 'Topo'], en: 'Rat' },
  { it: ['del', 'Bue'], en: 'Ox' },
  { it: ['della', 'Tigre'], en: 'Tiger' },
  { it: ['del', 'Coniglio'], en: 'Rabbit' },
  { it: ['del', 'Drago'], en: 'Dragon' },
  { it: ['del', 'Serpente'], en: 'Snake' },
  { it: ['del', 'Cavallo'], en: 'Horse' },
  { it: ['della', 'Capra'], en: 'Goat' },
  { it: ['della', 'Scimmia'], en: 'Monkey' },
  { it: ['del', 'Gallo'], en: 'Rooster' },
  { it: ['del', 'Cane'], en: 'Dog' },
  { it: ['del', 'Maiale'], en: 'Pig' },
];
/** Nello zodiaco vietnamita il Bue è il Bufalo e il Coniglio è il Gatto. */
const VIETNAMESE_ANIMALS: Record<number, (typeof ANIMALS)[number]> = {
  1: { it: ['del', 'Bufalo'], en: 'Buffalo' },
  3: { it: ['del', 'Gatto'], en: 'Cat' },
};
const ELEMENTS: LocalText[] = [
  { it: 'Legno', en: 'Wood' },
  { it: 'Fuoco', en: 'Fire' },
  { it: 'Terra', en: 'Earth' },
  { it: 'Metallo', en: 'Metal' },
  { it: 'Acqua', en: 'Water' },
];

const ZODIAC_COUNTRIES: Record<string, 'chinese' | 'dangi' | 'vietnamese'> = {
  CN: 'chinese',
  TW: 'chinese',
  HK: 'chinese',
  MO: 'chinese',
  SG: 'chinese',
  KR: 'dangi',
  VN: 'vietnamese',
};

export interface LocalYear {
  /** Il valore grande (es. "Anno del Cavallo di Fuoco", "令和8年 · Reiwa 8"). */
  value: LocalText;
  note: LocalText;
}

const fmtDate = (iso: string, locale: string) =>
  noon(iso).toLocaleDateString(locale, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });

const yearIn = (calendar: string, d: Date): string => partsOf(calendar, 'numeric', d).year;

/** Anni e calendari locali da conoscere per un paese, calcolati per la data `iso` (inizio viaggio o oggi). */
export const localYearsFor = (countryCode: string, iso: string): LocalYear[] => {
  const d = noon(iso);
  const out: LocalYear[] = [];

  const zodiac = ZODIAC_COUNTRIES[countryCode];
  if (zodiac) {
    const calendar = zodiac === 'dangi' ? 'dangi' : 'chinese';
    const lunarYear = Number(partsOf(calendar, 'numeric', d).relatedYear);
    const index = (((lunarYear - 4) % 12) + 12) % 12;
    const animal = (zodiac === 'vietnamese' && VIETNAMESE_ANIMALS[index]) || ANIMALS[index];
    const element = ELEMENTS[Math.floor((((lunarYear - 4) % 10) + 10) % 10 / 2)];
    const start = datesInYear(calendar, '1', 1, lunarYear)[0];
    out.push({
      value: {
        it: `Anno ${animal.it[0]} ${animal.it[1]} di ${element.it}`,
        en: `Year of the ${element.en} ${animal.en}`,
      },
      note: {
        it: `Zodiaco lunare: l'anno è iniziato il ${fmtDate(start, 'it')} con il Capodanno lunare.`,
        en: `Lunar zodiac: the year began on ${fmtDate(start, 'en')} with the Lunar New Year.`,
      },
    });
  }

  switch (countryCode) {
    case 'JP': {
      const p = Object.fromEntries(
        new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { timeZone: 'UTC', era: 'long', year: 'numeric' }).formatToParts(d).map((x) => [x.type, x.value])
      );
      const en = Object.fromEntries(
        new Intl.DateTimeFormat('en-u-ca-japanese', { timeZone: 'UTC', era: 'long', year: 'numeric' }).formatToParts(d).map((x) => [x.type, x.value])
      );
      out.push({
        value: { it: `${p.era}${p.year}年 · ${en.era} ${en.year}`, en: `${p.era}${p.year}年 · ${en.era} ${en.year}` },
        note: {
          it: "Anno dell'era imperiale: si usa su documenti, moduli, scontrini e date di scadenza.",
          en: 'Imperial era year: used on documents, forms, receipts and expiry dates.',
        },
      });
      break;
    }
    case 'TH':
      out.push({
        value: { it: `${yearIn('buddhist', d)} E.B.`, en: `${yearIn('buddhist', d)} BE` },
        note: {
          it: "Era buddista (anno + 543): la trovi su documenti, scontrini e scadenze, es. latte che \"scade nel 2569\".",
          en: 'Buddhist era (year + 543): on documents, receipts and expiry dates, e.g. milk "expiring in 2569".',
        },
      });
      break;
    case 'TW':
      out.push({
        value: { it: `Anno ${yearIn('roc', d)} della Repubblica (民國)`, en: `Year ${yearIn('roc', d)} of the Republic (民國)` },
        note: {
          it: 'Calendario Minguo (anno - 1911): su documenti, scontrini e date di scadenza.',
          en: 'Minguo calendar (year - 1911): on documents, receipts and expiry dates.',
        },
      });
      break;
    case 'ET': {
      const p = partsOf('ethiopic', 'long', d);
      out.push({
        value: { it: `${p.day} ${p.month} ${p.year}`, en: `${p.day} ${p.month} ${p.year}` },
        note: {
          it: "Calendario etiope: 7-8 anni indietro, 13 mesi, capodanno (Enkutatash) l'11 settembre.",
          en: 'Ethiopian calendar: 7-8 years behind, 13 months, New Year (Enkutatash) on 11 September.',
        },
      });
      break;
    }
    case 'IR':
    case 'AF':
      out.push({
        value: { it: `Anno ${yearIn('persian', d)}`, en: `Year ${yearIn('persian', d)}` },
        note: {
          it: 'Calendario solare persiano, il più usato nella vita di tutti i giorni; capodanno (Nowruz) il 20-21 marzo.',
          en: 'Persian solar calendar, the one used day to day; New Year (Nowruz) on 20-21 March.',
        },
      });
      break;
    case 'SA':
      out.push({
        value: { it: `Anno ${yearIn('islamic-umalqura', d)} dell'Egira`, en: `Year ${yearIn('islamic-umalqura', d)} AH` },
        note: {
          it: 'Calendario islamico (lunare), ufficiale accanto al nostro: date e scadenze possono essere in questo formato.',
          en: 'Islamic (lunar) calendar, official alongside ours: dates and expiries may use it.',
        },
      });
      break;
    case 'IL':
      out.push({
        value: { it: `Anno ebraico ${yearIn('hebrew', d)}`, en: `Hebrew year ${yearIn('hebrew', d)}` },
        note: {
          it: 'Si usa per le feste religiose, che cadono in date diverse ogni anno; capodanno (Rosh Hashanah) a settembre-ottobre.',
          en: 'Used for religious holidays, which move every year; New Year (Rosh Hashanah) in September-October.',
        },
      });
      break;
    case 'NP': {
      // Vikram Samvat: il browser non lo conosce; l'anno cambia a metà aprile (1° Baisakh, ~14 aprile).
      const y = d.getUTCFullYear() + (iso.slice(5) >= '04-14' ? 57 : 56);
      out.push({
        value: { it: `Anno ${y} (Vikram Samvat)`, en: `Year ${y} (Vikram Samvat)` },
        note: {
          it: 'Calendario ufficiale del Nepal, circa 57 anni avanti; capodanno a metà aprile.',
          en: "Nepal's official calendar, about 57 years ahead; New Year in mid-April.",
        },
      });
      break;
    }
  }

  return out;
};
