// ===========================================================================
// Bandiere delle regioni per l'atlante (campo `flags` di public/regions/index.json).
//
//   node scripts/build-region-flags.mjs            → tutti i paesi dell'indice
//   node scripts/build-region-flags.mjs ITA USA    → solo quelli indicati
//
// Va lanciato DOPO build-regions.mjs (usa i suoi download in .cache-regions).
//
// Fonte: Wikidata — per ogni paese (codice ISO alpha-3, P298) le suddivisioni
// che contiene (P150) con la loro bandiera (P41, file su Wikimedia Commons).
// Ogni regione della mappa si abbina a un elemento di Wikidata per codice ISO
// 3166-2 (P300 = shapeISO di geoBoundaries) quando c'è, altrimenti per nome
// (etichette in più lingue, normalizzate).
//
// Regola: un paese riceve le bandiere solo se TUTTE le sue regioni ne hanno
// una. Una bandiera sì e una no (es. il Messico, dove metà degli stati non ha
// una bandiera ufficiale) farebbe pensare a un dato mancante. I paesi
// incompleti sono elencati nel log con le regioni scoperte, per sistemarli a
// mano se serve (MANUAL).
// ===========================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixRegionName } from './region-names.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const INDEX = path.join(here, '..', 'public', 'regions', 'index.json');
const CACHE_DIR = path.join(here, '.cache-regions');
const SPARQL = 'https://query.wikidata.org/sparql';
const UA = 'journeyatlas-dev/1.0 (generazione asset una tantum)';
const LANGS = ['en', 'it', 'es', 'ca', 'eu', 'gl', 'fr', 'de', 'pt', 'nl', 'ja', 'ru', 'uk', 'zh', 'ar', 'tr', 'pl', 'sv', 'no', 'da', 'fi', 'ko', 'id', 'ms', 'vi', 'th', 'el', 'cs', 'hu', 'ro', 'hr', 'sr'];
const THUMB_WIDTH = 80;

/** Abbinamenti a mano: { ISO3: { 'nome regione sulla mappa': 'Q-id Wikidata' } }. */
const MANUAL = {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fold = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(
      /\b(region|regione|province|provincia|state|estado|prefecture|oblast|krai|kray|canton|department|departement|governorate|district|county|autonomous|community|comunidad|autonoma|republic|of|the|de|del|la|di)\b/g,
      ' '
    )
    .replace(/[^a-z0-9぀-ヿ一-鿿Ѐ-ӿ؀-ۿ]+/g, ' ')
    .trim();

const query = async (iso3) => {
  const file = path.join(CACHE_DIR, `wd-${iso3}.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const sparql = `
    SELECT ?r ?iso ?flag ?label WHERE {
      ?c wdt:P298 "${iso3}" .
      ?c wdt:P150 ?r .
      OPTIONAL { ?r wdt:P300 ?iso }
      OPTIONAL { ?r wdt:P41 ?flag }
      OPTIONAL { ?r rdfs:label ?label . FILTER(LANG(?label) IN (${LANGS.map((l) => `"${l}"`).join(',')})) }
    }`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${SPARQL}?query=${encodeURIComponent(sparql)}`, {
      headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA },
    });
    if (res.ok) {
      const json = await res.json();
      fs.writeFileSync(file, JSON.stringify(json));
      return json;
    }
    await sleep(2000 * (attempt + 1)); // 429 / timeout: si riprova con calma
  }
  throw new Error(`Wikidata ${iso3}: troppi errori`);
};

/** Elementi Wikidata del paese: id → { iso, flag, nomi normalizzati }. */
const itemsOf = (json) => {
  const items = new Map();
  for (const b of json.results.bindings) {
    const id = b.r.value.split('/').pop();
    const item = items.get(id) ?? { id, iso: null, flag: null, names: new Set() };
    if (b.iso) item.iso = b.iso.value.toUpperCase();
    if (b.flag) item.flag ??= b.flag.value;
    if (b.label) item.names.add(fold(b.label.value));
    items.set(id, item);
  }
  return [...items.values()];
};

/** Nome della regione e codice ISO 3166-2, dal file geoBoundaries già scaricato. */
const regionsOf = (iso3, level, excluded) => {
  const file = path.join(CACHE_DIR, `${iso3}-${level}.geojson`);
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  return raw.features
    .map((f) => ({
      name: f.properties?.shapeName ? fixRegionName(f.properties.shapeName) : null,
      iso: (f.properties?.shapeISO || '').toUpperCase(),
    }))
    .filter((r) => r.name && !excluded.has(r.name));
};

const thumb = (commonsUrl) => {
  // http://commons.wikimedia.org/wiki/Special:FilePath/Flag%20of%20X.svg → miniatura PNG larga THUMB_WIDTH
  const url = commonsUrl.replace(/^http:/, 'https:');
  return `${url}?width=${THUMB_WIDTH}`;
};

const match = (iso3, regions, items) => {
  const used = new Set();
  const flags = {};
  const missing = [];
  const byIso = new Map(items.filter((i) => i.iso).map((i) => [i.iso, i]));
  for (const region of regions) {
    const manual = MANUAL[iso3]?.[region.name];
    const n = fold(region.name);
    const candidates = items.filter((i) => !used.has(i.id));
    const item =
      (manual && items.find((i) => i.id === manual)) ||
      (region.iso && byIso.get(region.iso)) ||
      candidates.find((i) => i.names.has(n)) ||
      // contenimento: "Trentino-Alto Adige" ↔ "Trentino-Alto Adige/Südtirol" (solo se univoco)
      (() => {
        if (n.length < 4) return undefined;
        const hits = candidates.filter((i) => [...i.names].some((x) => x.length >= 4 && (x.includes(n) || n.includes(x))));
        return hits.length === 1 ? hits[0] : undefined;
      })();
    if (item?.flag && !used.has(item.id)) {
      used.add(item.id);
      flags[region.name] = thumb(item.flag);
    } else {
      missing.push(region.name);
    }
  }
  return { flags, missing };
};

// Stesse esclusioni di build-regions.mjs (territori che nell'atlante sono paesi a sé).
const EXCLUDE = {
  USA: ['American Samoa', 'Guam', 'Commonwealth of the Northern Mariana Islands', 'Puerto Rico', 'United States Virgin Islands'],
};

const main = async () => {
  const only = process.argv.slice(2).map((s) => s.toUpperCase());
  const index = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
  let complete = 0;
  const partial = [];
  for (const [iso3, entry] of Object.entries(index)) {
    if (only.length && !only.includes(iso3)) continue;
    try {
      const regions = regionsOf(iso3, entry.level, new Set(EXCLUDE[iso3] ?? []));
      const { flags, missing } = match(iso3, regions, itemsOf(await query(iso3)));
      if (missing.length === 0 && regions.length > 0) {
        entry.flags = flags;
        complete++;
        console.log(`${iso3}: ${regions.length}/${regions.length} bandiere`);
      } else {
        delete entry.flags;
        partial.push(`${iso3}: ${regions.length - missing.length}/${regions.length} (mancano: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? '…' : ''})`);
      }
    } catch (err) {
      console.warn(`${iso3}: ${err.message}`);
    }
    await sleep(300);
  }
  fs.writeFileSync(INDEX, JSON.stringify(index));
  console.log(`\n${complete} paesi con tutte le bandiere.`);
  console.log(`Incompleti (senza bandiere):\n  ${partial.join('\n  ')}`);
};

await main();
