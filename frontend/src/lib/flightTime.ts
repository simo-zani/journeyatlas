/**
 * Conversioni di fuso orario per la card "Mezzi".
 *
 * Gli orari dei voli sono salvati come numeri "a muro" (l'ora che l'utente ha
 * digitato per quell'aeroporto), non come istanti UTC affidabili: il form li
 * scrive con `new Date(local).toISOString()`, che li interpreta nel fuso del
 * dispositivo, non in quello dell'aeroporto di partenza/arrivo. Va bene per
 * salvarli e per rileggerli (la stessa conversione è simmetrica, vedi
 * `wallClockFromIso`), ma per calcolare durata reale e differenza di fuso
 * serve sapere in quale fuso ciascun orario a muro va interpretato — quello
 * dell'aeroporto, preso da `Airport.tz` — e da lì ricavare un istante UTC vero
 * con la sola API `Intl`, senza librerie di fuso orario a runtime.
 */

/** Riferimento di fallback quando il viaggiatore non ha impostato una città
 *  di casa nel profilo (o non è risolvibile in un fuso): il resto del tempo
 *  il riferimento vero è `nearestAirportTz` sulle coordinate del profilo,
 *  non questa costante. */
export const DEFAULT_HOME_TZ = 'Europe/Rome';

export interface WallClock {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number;
  minute: number;
}

/** Offset (minuti est di UTC) di un fuso IANA nell'istante indicato. */
const tzOffsetMinutes = (instant: Date, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  // Alcuni motori ICU restituiscono "24" per la mezzanotte anche con hour12:false.
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'));
  return (asUtc - instant.getTime()) / 60000;
};

/** Istante UTC reale in cui un orologio a muro segna `wall` nel fuso
 *  `timeZone`. Due passate: la prima stima l'offset trattando l'orario come se
 *  fosse già UTC, la seconda corregge con l'offset trovato — serve a cavallo
 *  di un cambio ora legale, dove una sola stima può sbagliare di un'ora. */
const wallClockToUtcMs = (wall: WallClock, timeZone: string): number => {
  const naive = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute);
  let ms = naive;
  for (let i = 0; i < 2; i++) {
    ms = naive - tzOffsetMinutes(new Date(ms), timeZone) * 60000;
  }
  return ms;
};

/** Le componenti a muro (anno/mese/giorno/ora/minuto) di un istante, lette nel
 *  fuso indicato. */
const wallClockAt = (instantMs: number, timeZone: string): WallClock => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(instantMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: get('year'), month: get('month'), day: get('day'), hour: get('hour') % 24, minute: get('minute') };
};

/** Le componenti a muro di un timestamp salvato, lette direttamente dalla
 *  stringa ISO senza conversione di fuso. I datetime dei trasporti sono
 *  ora salvati come stringhe wall-clock ("YYYY-MM-DDTHH:mm:ss" senza offset),
 *  quindi sliceare e' l'unico approccio corretto: new Date() applicherebbe il
 *  fuso del dispositivo corrente, che puo' differire da quello di pianificazione. */
export const wallClockFromIso = (iso: string): WallClock => {
  // I primi 16 caratteri sono sempre "YYYY-MM-DDTHH:mm" — corretti in ogni caso.
  return {
    year:   parseInt(iso.slice(0, 4),  10),
    month:  parseInt(iso.slice(5, 7),  10),
    day:    parseInt(iso.slice(8, 10), 10),
    hour:   parseInt(iso.slice(11, 13), 10),
    minute: parseInt(iso.slice(14, 16), 10),
  };
};

/** Lo stesso istante reale, riletto come orario a muro in un altro fuso. */
export const convertWallClock = (wall: WallClock, fromTz: string, toTz: string): WallClock =>
  wallClockAt(wallClockToUtcMs(wall, fromTz), toTz);

/** Differenza di fuso in minuti tra due orari a muro allo stesso istante
 *  reale: positivo se `toTz` è avanti rispetto a `fromTz` (es. +60 = un'ora
 *  in più a destinazione). */
export const tzDiffMinutes = (wall: WallClock, fromTz: string, toTz: string): number => {
  const instant = new Date(wallClockToUtcMs(wall, fromTz));
  return tzOffsetMinutes(instant, toTz) - tzOffsetMinutes(instant, fromTz);
};

/** Minuti reali trascorsi tra due orari a muro, ciascuno nel proprio fuso —
 *  la durata effettiva di un volo, non la differenza tra i numeri sul
 *  biglietto (che spesso sono in fusi diversi). */
export const wallClockDiffMinutes = (
  from: WallClock,
  fromTz: string,
  to: WallClock,
  toTz: string
): number => Math.round((wallClockToUtcMs(to, toTz) - wallClockToUtcMs(from, fromTz)) / 60000);
