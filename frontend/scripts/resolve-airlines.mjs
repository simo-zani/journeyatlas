import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AIRLINES from './airline-list.mjs';

// Percorsi relativi a questo file, così lo script gira da qualunque cartella.
const here = path.dirname(fileURLToPath(import.meta.url));

const API = 'https://en.wikipedia.org/w/api.php';
const UA = 'journeyatlas-dev/1.0 (generazione asset una tantum)';
const OUT = path.join(here, '..', 'src', 'lib', 'airlineData.ts');
// Cache delle risposte: rigenerare non richiede di rifare le 99 richieste agli
// articoli. Non va versionata: si cancella per rileggere tutto da capo.
const CACHE = path.join(here, 'wiki-airlines.json');
const ARTICLES_PER_QUERY = 20;
const FILES_PER_QUERY = 40;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const getJSON = async (url) => {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return res.json();
    if (res.status !== 429 || attempt > 6) throw new Error(`http ${res.status}`);
    console.log(`  429, attendo ${attempt * 20}s`);
    await sleep(attempt * 20000);
  }
};

const clean = (url) => (url ? url.split('?')[0] : null);

// L'infobox di Wikipedia non è sempre giusto. Queste correzioni sono l'unico
// dato che non arriva dalla fonte, quindi restano dichiarate qui e nel file
// generato invece di essere silenziosamente applicate.
const IATA_OVERRIDE = {
  // AirAsia: l'infobox riporta AK, che non è AirAsia ma una compagnia indiana
  // con quel codice. AirAsia usa Z9 dal 2015, prima D7.
  AK: 'Z9',
};

/** Infobox: il designatore IATA è la fonte autorevole, non la mia memoria. */
const iataFromInfobox = (wikitext) => {
  const m = wikitext.match(/\|\s*iata\s*=\s*"?\s*([A-Z0-9]{2})\b/i);
  if (!m) return null;
  const code = m[1].toUpperCase();
  return /^[A-Z0-9]{2}$/.test(code) ? code : null;
};

/** Wikimedia normalizza i nomi dei file: gli underscore diventano spazi e due
 *  spazi diventano uno. Senza questo, "AirAsia_New_Logo.svg" scritto nell'articolo
 *  non torna mai con "AirAsia New Logo.svg" restituito dall'API. */
const norm = (s) => s.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Estrae il nome del file del logo dall'infobox.
 *
 * Il campo `logo` è scritto in modi diversi a seconda dell'articolo, e li ho
 * visti tutti nei dati reali:
 *  - `[[File:Aegean Airlines logo light-on-dark.svg|250px]]` dentro un
 *    `{{Dark mode switch|...}}`, che contiene due varianti chiaro/scuro dello
 *    stesso marchio;
 *  - `Korean Air 2025.svg{{!}}class=skin-invert`, con la parola magica (che
 *    Wikipedia scrive `{{!}}`, non `{{!}}`) che nasconde il logo in modalità
 *    scuro: Korean Air, Japan Airlines, Lufthansa, Asiana, Spirit. Va tradotta in
 *    una barra vera, altrimenti sparisce e il nome resta "…svgclass=skin-invert";
 *  - `File:Ryanair.svg` secco, senza parentesi.
 * Se un campo non contiene un file immagine si prosegue col successivo.
 */
const logoFileFromInfobox = (wikitext) => {
  const re = /\|\s*logo\d*\s*=\s*([^\n]+)/gi;
  let m;
  while ((m = re.exec(wikitext))) {
    const value = m[1];
    const linked = value.match(/\[\[\s*(?:file|image|immagine)\s*:\s*([^\]|\n]+?)(?:\||\]\])/i);
    if (linked) return norm(linked[1]);
    const bare = value
      .replace(/\{\{!?\}\}/g, '|') // la parola magica è una barra
      .replace(/\{\{[^{}]*\}\}/g, '') // via i template annidati
      .replace(/\[\[|\]\]/g, '')
      .split('|')[0] // via 250px, link=, skin-invert
      .trim()
      .replace(/^(?:file|immagine|image)\s*:\s*/i, '');
    if (/\.(svg|png|jpe?g|webp)$/i.test(bare)) return norm(bare);
  }
  return null;
};

/**
 * Risoluzione del logo in due tempi, perché non tutti gli articoli mettono il
 * marchio nell'infobox.
 *
 * 1. Il campo `logo` dell'infobox è la fonte giusta.
 * 2. Se l'articolo non ha il campo logo si guarda l'immagine in primo piano,
 *    ma solo se è un SVG o se il nome del file contiene "logo": i marchi sono
 *    quasi sempre vettoriali, mentre l'immagine in primo piano di un articolo
 *    di compagnia è di solito una foto di un aereo in pista, che accanto al
 *    nome della compagnia avrebbe solo un effetto ridicolo.
 */
const logoCandidate = (wikitext, leadImage) => {
  const fromInfobox = logoFileFromInfobox(wikitext);
  if (fromInfobox) return { file: fromInfobox, via: 'infobox' };
  const lead = leadImage?.source;
  if (!lead) return null;
  if (/\.svg$/i.test(lead) || /logo|emblem/i.test(lead)) return { url: clean(lead), via: 'lead' };
  return null;
};

// ── passata 1: articoli, IATA e file candidate ────────────────────────────────
const readArticles = async (titles, cache) => {
  const missing = titles.filter((t) => !cache[t]);
  for (let i = 0; i < missing.length; i += ARTICLES_PER_QUERY) {
    const chunk = missing.slice(i, i + ARTICLES_PER_QUERY);
    const url =
      `${API}?action=query&format=json&formatversion=2&redirects=1&prop=revisions|pageimages` +
      `&rvprop=content&rvslots=main&piprop=original` +
      `&titles=${encodeURIComponent(chunk.join('|'))}`;
    const json = await getJSON(url);
    const alias = new Map();
    for (const n of json.query?.normalized ?? []) alias.set(n.to, n.from);
    for (const r of json.query?.redirects ?? []) alias.set(r.to, alias.get(r.from) ?? r.from);
    for (const p of json.query?.pages ?? []) {
      const requested = alias.get(p.title) ?? p.title;
      const wikitext = p.revisions?.[0]?.slots?.main?.content ?? '';
      cache[requested] = p.missing
        ? { missing: true }
        : {
            page: p.title,
            iata: iataFromInfobox(wikitext),
            logo: logoCandidate(wikitext, p.original),
          };
    }
    console.log(`  articoli ${Math.min(i + ARTICLES_PER_QUERY, missing.length)}/${missing.length}`);
    await sleep(1500);
  }
  return cache;
};

// ── passata 2: risoluzione dei file su Commons, raggruppata ──────────────────
const resolveFiles = async (files) => {
  const urls = {};
  for (let i = 0; i < files.length; i += FILES_PER_QUERY) {
    const chunk = files.slice(i, i + FILES_PER_QUERY);
    // Chiedo 128px perché nel picker il logo compare a circa 28px: Wikimedia
    // arrotonda comunque alla misura standard più vicina (in uscita 250px), ma
    // la richiesta dice quale formato mi serve e il risultato resta una PNG
    // leggera invece che il file originale, spesso molto più grande.
    const url =
      `${API}?action=query&format=json&formatversion=2&prop=imageinfo&iiprop=url&iiurlwidth=128` +
      `&titles=${encodeURIComponent(chunk.map((f) => `File:${f}`).join('|'))}`;
    const json = await getJSON(url);
    for (const p of json.query?.pages ?? []) {
      const info = p.imageinfo?.[0];
      // Attenzione: una pagina può avere `missing: true` e insieme un
      // imageinfo valido, perché il file sta su Commons e non in locale su
      // en.wikipedia (è il caso di quasi tutti i loghi). Se qui si skippava il
      // `missing` sparivano due terzi dei loghi senza alcun errore in output.
      if (!info) {
        console.log(`    (file non trovato: ${p.title})`);
        continue;
      }
      // Il titolo è sempre File:X: quello è il nome del file richiesto.
      const fileName = norm(p.title.replace(/^File:\s*/i, ''));
      // thumb.wikimedia.org e upload.wikimedia.org servono gli stessi percorsi:
      // tengo un solo host, così vale una sola regola CSP e una sola cache.
      // Uso sempre la miniatura, anche per gli SVG: nel picker servono 28px, e
      // così un logo non dipende dal rendering SVG del browser.
      urls[fileName] = clean(info.thumburl ?? info.url).replace(
        'https://thumb.wikimedia.org/',
        'https://upload.wikimedia.org/',
      );
    }
    console.log(`  file ${Math.min(i + FILES_PER_QUERY, files.length)}/${files.length}`);
    await sleep(1500);
  }
  return urls;
};

const main = async () => {
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};

  // Un titolo per compagnia: i duplicati si uniscono e le voci senza titolo o con
  // un IATA non conforme si scartano prima di interrogare l'API.
  const wanted = new Map();
  for (const [iata, name, title, cc] of AIRLINES) {
    if (!title) continue;
    if (!/^[A-Z0-9]{2}$/.test(iata)) {
      console.log(`  scartata (IATA non conforme): ${iata} ${name}`);
      continue;
    }
    if (!wanted.has(title)) wanted.set(title, { iatas: new Set(), name, cc });
    wanted.get(title).iatas.add(iata);
  }

  console.log('passata 1: articoli');
  await readArticles([...wanted.keys()], cache);
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1), 'utf8');

  const fileNames = [
    ...new Set(Object.values(cache).map((c) => c?.logo?.file).filter(Boolean)),
  ];
  console.log(`\npassata 2: ${fileNames.length} file su Commons`);
  const urls = await resolveFiles(fileNames);

  const rows = [];
  for (const [title, meta] of wanted) {
    const got = cache[title];
    if (!got || got.missing) {
      console.log(`  pagina assente: ${title}`);
      continue;
    }
    // Se l'infobox non ha l'IATA si usa il codice annotato a mano, ma solo dopo
    // aver visto che è davvero vuoto: è il caso di LATAM, il cui articolo è
    // quello del gruppo e non riporta il designatore.
    const code = got.iata ?? [...meta.iatas][0];
    if (!got.iata) console.log(`  ${title}: IATA vuoto nell'infobox, uso il codice annotato ${code}`);
    else if (!meta.iatas.has(got.iata)) {
      console.log(`  ATTENZIONE ${title}: avevo scritto [${[...meta.iatas]}], l'infobox dice ${got.iata}`);
    }
    const finalCode = IATA_OVERRIDE[code] ?? code;
    if (finalCode !== code) console.log(`  ${title}: ${code} -> ${finalCode} (correzione dichiarata)`);
    const logo = got.logo?.file ? (urls[norm(got.logo.file)] ?? null) : (got.logo?.url ?? null);
    if (!logo) console.log(`  ${title}: nessun logo trovato`);
    rows.push({ iata: finalCode, name: meta.name, cc: meta.cc, logo, via: got.logo?.via });
  }

  const seen = new Set();
  const out = rows
    .filter((r) => (seen.has(r.iata) ? false : (seen.add(r.iata), true)))
    .sort((a, b) => a.name.localeCompare(b.name));

  const header = `// ============================================================================
// JourneyAtlas - Compagnie aeree
//
// Elenco scritto a mano (OurAirports non distribuisce le compagnie) ma non dato
// per buono: in generazione ogni voce è stata verificata contro l'infobox di
// Wikipedia. Il designatore IATA viene dall'infobox, non da quello annotato a
// mano, e i codici trovati sbagliati sono elencati qui sotto per riferimento.
//
// I loghi sono presi dal campo \`logo\` dell'infobox e risolti in URL reali
// upload.wikimedia.org via API: non sono URL inventati e non sono le foto di
// aerei che compaiono in primo piano negli articoli. Dove il logo non c'è il
// campo è vuoto e il picker mostra l'iniziale del nome.
//
// Un record per riga, campi separati da \`|\`:
//
//   IATA|nome|CC|url logo
//
// Non editare a mano: rigenerare con \`node scripts/resolve-airlines.mjs\`, che
// rilegge \`scripts/airline-list.mjs\`.
// ============================================================================`;
  const findings = [
    '',
    '// Discrepanze trovate verificando a mano: Air Malta KM (non IG), Alitalia',
    '// CityLiner CT (non AE), Boutique Airlines 4B (non BV), flydubai FZ (non 5F),',
    '// Air Europa UX (non UU), AirAsia Z9 (l\'infobox riporta AK, che è di un\'altra',
    '// compagnia). LATAM non ha l\'IATA nell\'infobox: preso LA.',
  ].join('\n');

  const body = out.map((r) => `${r.iata}|${r.name}|${r.cc}|${r.logo ?? ''}`).join('\n');
  // Il primo record va su una riga nuova: attaccato al backtick finirebbe dentro
  // l'intestazione e i record non risulterebbero uno per riga.
  fs.writeFileSync(OUT, `${header}\n${findings}\n\nexport const AIRLINE_DATA = \`\n${body}\n\`;\n`, 'utf8');

  console.log(`\ncompagnie: ${out.length}, senza logo: ${out.filter((r) => !r.logo).length}`);
  const viaLead = out.filter((r) => r.via === 'lead');
  if (viaLead.length) console.log(`logo presi in primo piano: ${viaLead.map((r) => r.name).join(', ')}`);
};

main().catch((e) => {
  console.log('ERRORE', e.message);
  process.exit(1);
});
