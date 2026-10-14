// ===========================================================================
// Capitali dei paesi per l'atlante (public/capitals.json).
//
//   node scripts/build-capitals.mjs
//
// Fonte: Wikidata — per ogni paese con codice ISO alpha-2 (P297) la capitale
// (P36) attuale (senza data di fine, preferendo il rango "preferred"), con
// coordinate (P625) e nome in italiano e inglese. Gli stati senza codice ISO
// (Somaliland, Abcasia, ...) si aggiungono con il loro Q-id (UNRECOGNIZED).
//
// Uscita: { "IT": { "lat": 41.89, "lon": 12.48, "it": "Roma", "en": "Rome" }, ... }
// ===========================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, '..', 'public', 'capitals.json');
const SPARQL = 'https://query.wikidata.org/sparql';
const UA = 'journeyatlas-dev/1.0 (generazione asset una tantum)';

/** Codici dell'atlante per gli stati senza ISO → elemento Wikidata del paese. */
const UNRECOGNIZED = {
  'X-SOL': 'Q34754', // Somaliland
  'X-NCY': 'Q23681', // Cipro del Nord
  'X-ABK': 'Q23334', // Abcasia
  'X-SOS': 'Q23427', // Ossezia del Sud
  'X-TRN': 'Q907112', // Transnistria
};

/** Paesi con più capitali: quella di governo, invece della prima trovata. */
const MANUAL = {
  ZA: { lat: -25.7461, lon: 28.1881, it: 'Pretoria', en: 'Pretoria' },
};

const query = (countryClause) => `
SELECT ?code ?country ?capital ?rank ?coord ?it ?en WHERE {
  ${countryClause}
  ?country p:P36 ?st .
  ?st ps:P36 ?capital ; wikibase:rank ?rank .
  FILTER(?rank != wikibase:DeprecatedRank)
  FILTER NOT EXISTS { ?st pq:P582 ?end }
  ?capital wdt:P625 ?coord .
  OPTIONAL { ?capital rdfs:label ?it FILTER(LANG(?it) = "it") }
  OPTIONAL { ?capital rdfs:label ?en FILTER(LANG(?en) = "en") }
}`;

const run = async (sparql) => {
  const res = await fetch(`${SPARQL}?query=${encodeURIComponent(sparql)}`, {
    headers: { Accept: 'application/sparql-results+json', 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`Wikidata HTTP ${res.status}`);
  return (await res.json()).results.bindings;
};

const parsePoint = (wkt) => {
  const m = /Point\(([-\d.eE]+) ([-\d.eE]+)\)/.exec(wkt);
  return m ? { lon: Number(m[1]), lat: Number(m[2]) } : null;
};

const round = (n) => Math.round(n * 1e4) / 1e4;

const rows = [
  ...(await run(query('?country wdt:P297 ?code . ?country wdt:P31/wdt:P279* wd:Q6256 .'))),
  ...(await run(query('?country wdt:P297 ?code .'))),
];
for (const [code, qid] of Object.entries(UNRECOGNIZED)) {
  for (const r of await run(query(`BIND(wd:${qid} AS ?country) BIND("${code}" AS ?code)`))) rows.push(r);
}

/** Per ogni codice la capitale migliore: rango preferred prima, poi la prima trovata. */
const best = new Map();
for (const r of rows) {
  const code = r.code.value.toUpperCase();
  const point = parsePoint(r.coord.value);
  if (!point) continue;
  const preferred = r.rank.value.endsWith('PreferredRank');
  const prev = best.get(code);
  if (prev && (prev.preferred || !preferred)) continue;
  best.set(code, {
    preferred,
    lat: round(point.lat),
    lon: round(point.lon),
    it: r.it?.value ?? r.en?.value ?? '',
    en: r.en?.value ?? r.it?.value ?? '',
  });
}

const out = {};
for (const code of [...best.keys()].sort()) {
  const { preferred: _preferred, ...c } = best.get(code);
  if (c.it || c.en) out[code] = c;
}
Object.assign(out, MANUAL);
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`capitali: ${Object.keys(out).length} → ${path.relative(process.cwd(), OUT)}`);
