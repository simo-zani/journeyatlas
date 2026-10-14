// ===========================================================================
// Bandiere dei paesi servite dall'app (public/flags/<alpha-2>.png).
//
//   node scripts/download-flags.mjs
//
// Si scaricano una volta da flags.restcountries.com (larghezza 320 px) per
// tutti i paesi di world-countries: così l'app non le richiede a ogni visita
// a un servizio esterno, e il browser le tiene in cache come gli altri file.
// ===========================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(here, '..', 'public', 'flags');
const COUNTRIES_URL = 'https://cdn.jsdelivr.net/npm/world-countries@5/countries.json';
const FLAG_CDN_BASE = 'https://flags.restcountries.com/v5/w320';

fs.mkdirSync(OUT_DIR, { recursive: true });
const countries = await (await fetch(COUNTRIES_URL)).json();
const codes = [...new Set(countries.map((c) => c.cca2.toLowerCase()))].sort();

let ok = 0;
const missing = [];
for (const code of codes) {
  const res = await fetch(`${FLAG_CDN_BASE}/${code}.png`);
  if (!res.ok) {
    missing.push(code);
    continue;
  }
  fs.writeFileSync(path.join(OUT_DIR, `${code}.png`), Buffer.from(await res.arrayBuffer()));
  ok++;
}
console.log(`bandiere: ${ok} → ${path.relative(process.cwd(), OUT_DIR)}${missing.length ? ` · mancanti: ${missing.join(', ')}` : ''}`);
