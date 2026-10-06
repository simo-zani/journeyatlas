/**
 * Meteo dei giorni del viaggio (Open-Meteo), con tre fonti a seconda di quando cadono i giorni:
 *  - previsioni (e ultimi mesi già trascorsi): `forecast` API, che accetta start/end_date da ~3 mesi
 *    fa a 16 giorni avanti;
 *  - giorni più vecchi: archivio storico (`archive`, dal 1940);
 *  - giorni troppo lontani per avere previsioni: clima tipico, media degli stessi giorni negli
 *    ultimi anni dall'archivio.
 */
export type DaySource = 'forecast' | 'archive' | 'climate';

export interface DayWeather {
  date: string;
  code: number;
  tMax: number;
  tMin: number;
  /** Probabilità di pioggia in % (previsioni) o quota di anni piovosi (clima tipico). */
  rainChance: number | null;
  /** Precipitazioni misurate in mm (giorni passati). */
  precipMm: number | null;
  source: DaySource;
}

export interface HourWeather {
  hour: number;
  temp: number;
  code: number;
  rainChance: number | null;
  precipMm: number | null;
  wind: number | null;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Anni di storico usati per il clima tipico. */
export const CLIMATE_YEARS = 5;
/** Quanti giorni nel passato la forecast API copre in modo affidabile. */
const FORECAST_PAST_DAYS = 90;
/** Quanti giorni nel futuro ci sono previsioni. */
const FORECAST_FUTURE_DAYS = 15;

// ─── Date ────────────────────────────────────────────────────────────────────

export const localDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Somma giorni a una data YYYY-MM-DD passando da UTC, senza scarti per il fuso. */
export const addDays = (date: string, n: number): string =>
  new Date(new Date(`${date}T00:00:00Z`).getTime() + n * DAY_MS).toISOString().slice(0, 10);

const datesBetween = (start: string, end: string): string[] => {
  const out: string[] = [];
  for (let d = start; d <= end && out.length < 120; d = addDays(d, 1)) out.push(d);
  return out;
};

// ─── Cache ───────────────────────────────────────────────────────────────────

const cached = async <T>(key: string, ttl: number, load: () => Promise<T>): Promise<T> => {
  const k = `ja-wx2:${key}`;
  try {
    const raw = localStorage.getItem(k);
    if (raw) {
      const { at, value } = JSON.parse(raw) as { at: number; value: T };
      if (Date.now() - at < ttl) return value;
    }
  } catch {
    // cache non disponibile: si ricarica
  }
  const value = await load();
  try {
    localStorage.setItem(k, JSON.stringify({ at: Date.now(), value }));
  } catch {
    // ignore storage errors
  }
  return value;
};

const TTL_FORECAST = HOUR_MS;
const TTL_ARCHIVE = 7 * DAY_MS;

// ─── Chiamate ────────────────────────────────────────────────────────────────

interface DailyResponse {
  daily: {
    time: string[];
    weather_code: (number | null)[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_probability_max?: (number | null)[];
    precipitation_sum?: (number | null)[];
  };
}

const fetchDaily = async (
  base: string,
  lat: number,
  lon: number,
  start: string,
  end: string,
  withProbability: boolean
): Promise<DailyResponse['daily']> => {
  const url = new URL(base);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set(
    'daily',
    `weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum${
      withProbability ? ',precipitation_probability_max' : ''
    }`
  );
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('start_date', start);
  url.searchParams.set('end_date', end);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  return ((await res.json()) as DailyResponse).daily;
};

const toDays = (d: DailyResponse['daily'], source: DaySource): DayWeather[] =>
  d.time.flatMap((date, i) => {
    const tMax = d.temperature_2m_max[i];
    const tMin = d.temperature_2m_min[i];
    const code = d.weather_code[i];
    if (tMax == null || tMin == null || code == null) return [];
    return [
      {
        date,
        code,
        tMax,
        tMin,
        rainChance: d.precipitation_probability_max?.[i] ?? null,
        precipMm: d.precipitation_sum?.[i] ?? null,
        source,
      },
    ];
  });

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

/** Clima tipico: media degli stessi giorni (mese-giorno) negli ultimi anni. */
const fetchClimate = async (lat: number, lon: number, dates: string[]): Promise<DayWeather[]> => {
  if (dates.length === 0) return [];
  const first = dates[0];
  const last = dates[dates.length - 1];
  // 0 se il viaggio sta in un solo anno solare, 1 se scavalla Capodanno
  const spanYears = Number(last.slice(0, 4)) - Number(first.slice(0, 4));
  const thisYear = new Date().getFullYear();

  const samples = new Map<string, DayWeather[]>(); // "MM-DD" -> campioni
  for (let k = 1; k <= CLIMATE_YEARS; k++) {
    const y = thisYear - k;
    const start = `${y}${first.slice(4)}`;
    const end = `${y + spanYears}${last.slice(4)}`;
    try {
      const daily = await cached(`clim:${lat.toFixed(2)},${lon.toFixed(2)}:${start}:${end}`, 30 * DAY_MS, () =>
        fetchDaily(ARCHIVE_URL, lat, lon, start, end, false)
      );
      for (const day of toDays(daily, 'climate')) {
        const md = day.date.slice(5);
        samples.set(md, [...(samples.get(md) ?? []), day]);
      }
    } catch {
      // un anno mancante non invalida la media degli altri
    }
  }

  return dates.flatMap((date) => {
    const list = samples.get(date.slice(5));
    if (!list || list.length === 0) return [];
    const avg = (f: (d: DayWeather) => number) => list.reduce((s, d) => s + f(d), 0) / list.length;
    // codice meteo più frequente tra gli anni
    const counts = new Map<number, number>();
    list.forEach((d) => counts.set(d.code, (counts.get(d.code) ?? 0) + 1));
    const code = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    const rainy = list.filter((d) => (d.precipMm ?? 0) >= 1).length;
    return [
      {
        date,
        code,
        tMax: avg((d) => d.tMax),
        tMin: avg((d) => d.tMin),
        rainChance: Math.round((rainy / list.length) * 100),
        precipMm: null,
        source: 'climate' as const,
      },
    ];
  });
};

/**
 * Meteo dei giorni [start, end] per un punto: ogni giorno viene dalla fonte adatta a quando cade
 * (archivio, previsioni o clima tipico) e il risultato è già ordinato per data.
 */
export const fetchTripWeather = async (
  lat: number,
  lon: number,
  start: string,
  end: string
): Promise<DayWeather[]> => {
  const today = localDateStr(new Date());
  const pastLimit = addDays(today, -FORECAST_PAST_DAYS);
  const futureLimit = addDays(today, FORECAST_FUTURE_DAYS);
  const dates = datesBetween(start, end);

  const archiveDates = dates.filter((d) => d < pastLimit);
  const forecastDates = dates.filter((d) => d >= pastLimit && d <= futureLimit);
  const climateDates = dates.filter((d) => d > futureLimit);
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;

  const parts = await Promise.all([
    archiveDates.length
      ? cached(`arch:${key}:${archiveDates[0]}:${archiveDates[archiveDates.length - 1]}`, TTL_ARCHIVE, async () =>
          toDays(
            await fetchDaily(ARCHIVE_URL, lat, lon, archiveDates[0], archiveDates[archiveDates.length - 1], false),
            'archive'
          )
        ).catch(() => [] as DayWeather[])
      : Promise.resolve([] as DayWeather[]),
    forecastDates.length
      ? cached(`fc:${key}:${forecastDates[0]}:${forecastDates[forecastDates.length - 1]}`, TTL_FORECAST, async () =>
          toDays(
            await fetchDaily(FORECAST_URL, lat, lon, forecastDates[0], forecastDates[forecastDates.length - 1], true),
            'forecast'
          )
        ).catch(() => [] as DayWeather[])
      : Promise.resolve([] as DayWeather[]),
    fetchClimate(lat, lon, climateDates),
  ]);

  return parts.flat().sort((a, b) => a.date.localeCompare(b.date));
};

/** Ultimi giorni da oggi: usato quando il viaggio non ha date. */
export const fetchNextDays = (lat: number, lon: number, days = 7): Promise<DayWeather[]> => {
  const today = localDateStr(new Date());
  return fetchTripWeather(lat, lon, today, addDays(today, days - 1));
};

// ─── Ora per ora ─────────────────────────────────────────────────────────────

interface HourlyResponse {
  hourly: {
    time: string[];
    temperature_2m: (number | null)[];
    weather_code: (number | null)[];
    precipitation_probability?: (number | null)[];
    precipitation?: (number | null)[];
    wind_speed_10m?: (number | null)[];
  };
}

/** Andamento orario di un giorno. Disponibile dove ci sono previsioni o storico, non per il clima tipico. */
export const fetchHourly = async (lat: number, lon: number, date: string): Promise<HourWeather[]> => {
  const today = localDateStr(new Date());
  const archive = date < addDays(today, -FORECAST_PAST_DAYS);
  const base = archive ? ARCHIVE_URL : FORECAST_URL;
  const key = `h:${lat.toFixed(2)},${lon.toFixed(2)}:${date}`;

  return cached(key, archive ? TTL_ARCHIVE : TTL_FORECAST, async () => {
    const url = new URL(base);
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set(
      'hourly',
      `temperature_2m,weather_code,precipitation,wind_speed_10m${archive ? '' : ',precipitation_probability'}`
    );
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('start_date', date);
    url.searchParams.set('end_date', date);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const h = ((await res.json()) as HourlyResponse).hourly;
    return h.time.flatMap((time, i) => {
      const temp = h.temperature_2m[i];
      const code = h.weather_code[i];
      if (temp == null || code == null) return [];
      return [
        {
          hour: Number(time.slice(11, 13)),
          temp,
          code,
          rainChance: h.precipitation_probability?.[i] ?? null,
          precipMm: h.precipitation?.[i] ?? null,
          wind: h.wind_speed_10m?.[i] ?? null,
        },
      ];
    });
  });
};
