export interface DayForecast {
  date: string;
  code: number;
  tMax: number;
  tMin: number;
  rainChance: number | null;
}

const TTL_MS = 60 * 60 * 1000;

export const fetchForecast = async (lat: number, lon: number): Promise<DayForecast[]> => {
  const key = `ja-weather:${lat.toFixed(2)},${lon.toFixed(2)}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const { at, value } = JSON.parse(raw) as { at: number; value: DayForecast[] };
      if (Date.now() - at < TTL_MS) return value;
    }
  } catch {
    // cache non disponibile: si ricarica
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = (await res.json()) as {
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
      precipitation_probability_max?: (number | null)[];
    };
  };
  const d = json.daily;
  const value = d.time.map((date, i) => ({
    date,
    code: d.weather_code[i],
    tMax: d.temperature_2m_max[i],
    tMin: d.temperature_2m_min[i],
    rainChance: d.precipitation_probability_max?.[i] ?? null,
  }));
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), value }));
  } catch {
    // ignore storage errors
  }
  return value;
};
