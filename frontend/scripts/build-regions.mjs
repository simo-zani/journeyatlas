// ===========================================================================
// Genera i confini delle regioni per l'atlante (public/regions/*.json).
//
//   node scripts/build-regions.mjs            → tutti i paesi
//   node scripts/build-regions.mjs ITA USA    → solo quelli indicati
//
// Fonte: geoBoundaries (gbOpen, https://www.geoboundaries.org — Runfola et al.
// 2020, CC BY 4.0; licenza di ogni paese nell'indice). I file "simplified" di
// geoBoundaries pesano ancora troppo per il browser (USA 5,4 MB): qui vengono
// semplificati con mapshaper e salvati in TopoJSON (USA ~50 KB, Italia ~15 KB).
//
// Il livello amministrativo "giusto" cambia da paese a paese: per l'Italia il
// primo livello sono le 5 macro-aree NUTS, le 20 regioni sono il secondo
// (LEVEL_OVERRIDES). Si escludono le parti che nell'atlante sono già paesi a
// sé (i territori USA: Porto Rico, Guam...).
//
// In più: public/regions/breakaway.json con Abcasia, Ossezia del Sud e
// Transnistria (Natural Earth 50m, pubblico dominio), che la mappa del mondo
// a bassa risoluzione non contiene.
//
// Le risposte scaricate restano in scripts/.cache-regions (non versionata):
// rigenerare non riscarica tutto.
// ===========================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mapshaper from 'mapshaper';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(here, '..', 'public', 'regions');
const CACHE_DIR = path.join(here, '.cache-regions');
const API = 'https://www.geoboundaries.org/api/current/gbOpen';
const NE_BREAKAWAY =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_admin_0_breakaway_disputed_areas.geojson';

/** Paesi in cui le "regioni" stanno a un livello diverso dal primo. */
const LEVEL_OVERRIDES = { ITA: 'ADM2' };

/** Unità da escludere perché nell'atlante sono paesi a sé. */
const EXCLUDE = {
  USA: ['American Samoa', 'Guam', 'Commonwealth of the Northern Mariana Islands', 'Puerto Rico', 'United States Virgin Islands'],
};

/** Stati a riconoscimento limitato presi dal layer "breakaway" di Natural Earth. */
const BREAKAWAY = { B35: 'X-ABK', B37: 'X-SOS', B36: 'X-TRN' };

const SIMPLIFY = '6%';
const CONCURRENCY = 4;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(CACHE_DIR, { recursive: true });

const cached = async (key, url) => {
  const file = path.join(CACHE_DIR, key);
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = await res.text();
  fs.writeFileSync(file, text);
  return text;
};

const toTopo = async (geojson, fields, simplify = SIMPLIFY) => {
  // Senza semplificazione si tiene anche più precisione nelle coordinate.
  const simplifyCmd = simplify ? `-simplify ${simplify} keep-shapes` : '';
  const quantization = simplify ? 10000 : 100000;
  const out = await mapshaper.applyCommands(
    `-i in.json -filter-fields ${fields} ${simplifyCmd} -clean -o format=topojson quantization=${quantization} out.json`,
    { 'in.json': geojson }
  );
  return out['out.json'].toString();
};

const buildCountry = async (meta) => {
  const iso = meta.boundaryISO;
  const raw = JSON.parse(await cached(`${iso}-${meta.boundaryType}.geojson`, meta.simplifiedGeometryGeoJSON));
  const excluded = new Set(EXCLUDE[iso] ?? []);
  raw.features = raw.features.filter((f) => f.properties?.shapeName && !excluded.has(f.properties.shapeName));
  if (raw.features.length < 2) return null; // un'unica "regione" non dice nulla
  const topo = await toTopo(raw, 'shapeName');
  fs.writeFileSync(path.join(OUT_DIR, `${iso}.json`), topo);
  return {
    level: meta.boundaryType,
    count: raw.features.length,
    license: meta.boundaryLicense,
    source: meta.boundarySource,
    bytes: Buffer.byteLength(topo),
  };
};

const buildBreakaway = async () => {
  const raw = JSON.parse(await cached('ne_50m_breakaway.geojson', NE_BREAKAWAY));
  raw.features = raw.features
    .filter((f) => BREAKAWAY[f.properties.BRK_A3])
    .map((f) => ({ ...f, properties: { code: BREAKAWAY[f.properties.BRK_A3] } }));
  // Niente semplificazione: sono poche aree piccole, e strisce sottili come la
  // Transnistria semplificate perderebbero città intere (Tiraspol).
  fs.writeFileSync(path.join(OUT_DIR, 'breakaway.json'), await toTopo(raw, 'code', null));
  console.log(`breakaway: ${raw.features.length} aree`);
};

const main = async () => {
  const only = process.argv.slice(2).map((s) => s.toUpperCase());
  const all = JSON.parse(await cached('ALL-ADM1.json', `${API}/ALL/ADM1/`));
  const metas = [];
  for (const m of all) {
    if (only.length && !only.includes(m.boundaryISO)) continue;
    const level = LEVEL_OVERRIDES[m.boundaryISO];
    metas.push(level ? JSON.parse(await cached(`${m.boundaryISO}-${level}.meta.json`, `${API}/${m.boundaryISO}/${level}/`)) : m);
  }

  const indexFile = path.join(OUT_DIR, 'index.json');
  const index = only.length && fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, 'utf8')) : {};
  let next = 0;
  const worker = async () => {
    while (next < metas.length) {
      const meta = metas[next++];
      try {
        const info = await buildCountry(meta);
        if (info) {
          index[meta.boundaryISO] = info;
          console.log(`${meta.boundaryISO} ${info.level}: ${info.count} regioni, ${(info.bytes / 1024).toFixed(1)} KB`);
        } else {
          delete index[meta.boundaryISO];
        }
      } catch (err) {
        console.warn(`${meta.boundaryISO}: ${err.message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // `bytes` serve solo al log: nell'indice restano i dati utili all'app e all'attribuzione.
  const clean = Object.fromEntries(
    Object.entries(index)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([iso, { bytes: _bytes, ...rest }]) => [iso, rest])
  );
  fs.writeFileSync(indexFile, JSON.stringify(clean));
  await buildBreakaway();
  const total = fs.readdirSync(OUT_DIR).reduce((s, f) => s + fs.statSync(path.join(OUT_DIR, f)).size, 0);
  console.log(`\n${Object.keys(clean).length} paesi, ${(total / 1024 / 1024).toFixed(2)} MB in public/regions`);
};

await main();
