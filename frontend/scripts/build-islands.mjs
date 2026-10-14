// ===========================================================================
// Isole per la mappa del mondo (public/regions/islands.json).
//
//   node scripts/build-islands.mjs
//
// La mappa del mondo usa world-atlas a 110m, dove mancano:
//   - i paesi più piccoli (Maldive, Seychelles, Capo Verde, Malta, Singapore,
//     Andorra, ...), che non hanno proprio un poligono → kind "country";
//   - le isole lontane dalla costa dei paesi grandi (Canarie, Azzorre,
//     Baleari, Galápagos, isole greche, ...) → kind "islets", una geometria
//     per paese con tutte le sue isole mancanti.
// Entrambi si prendono dalla versione a 10m (stessi codici ISO numerici).
// Dopo aver rigenerato il file va aumentato ISLANDS_VERSION in src/lib/atlasGeo.ts.
// ===========================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mapshaper from 'mapshaper';
import { feature } from 'topojson-client';
import { geoArea, geoCentroid, geoContains, geoDistance } from 'd3-geo';

const here = path.dirname(fileURLToPath(import.meta.url));
const ATLAS = path.join(here, '..', 'node_modules', 'world-atlas');
const OUT = path.join(here, '..', 'public', 'regions', 'islands.json');
const EARTH_KM = 6371;
/** Isole più piccole di così (km²) non si aggiungono: sulla mappa del mondo non si vedrebbero. */
const MIN_ISLET_KM2 = 20;
/** Isole più vicine di così (km) alla costa già disegnata non servono: la costa le copre. */
const MIN_OFFSHORE_KM = 60;

const load = (file) => {
  const topo = JSON.parse(fs.readFileSync(path.join(ATLAS, file), 'utf8'));
  return feature(topo, topo.objects.countries).features;
};

const polygonsOf = (geometry) => (geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates]);
const padId = (id) => String(id).padStart(3, '0');

const coarse = new Map(load('countries-110m.json').map((f) => [f.id, f]));
const fine = load('countries-10m.json').filter((f) => f.id);

// Paesi interi che a 110m non ci sono.
const countries = fine
  .filter((f) => !coarse.has(f.id))
  .map((f) => ({
    type: 'Feature',
    properties: { id: padId(f.id), name: f.properties.name, kind: 'country' },
    geometry: f.geometry,
  }));

// Isole dei paesi che ci sono, ma lontane dalla loro forma a 110m.
const islets = [];
for (const f of fine) {
  const shape = coarse.get(f.id);
  if (!shape) continue;
  const coast = polygonsOf(shape.geometry).flatMap((p) => p[0]);
  const parts = polygonsOf(f.geometry).filter((p) => {
    const polygon = { type: 'Polygon', coordinates: p };
    if (geoArea(polygon) * EARTH_KM * EARTH_KM < MIN_ISLET_KM2) return false;
    const center = geoCentroid(polygon);
    if (geoContains(shape, center)) return false;
    return coast.every((v) => geoDistance(center, v) * EARTH_KM >= MIN_OFFSHORE_KM);
  });
  if (parts.length) {
    islets.push({
      type: 'Feature',
      properties: { id: padId(f.id), name: f.properties.name, kind: 'islets' },
      geometry: { type: 'MultiPolygon', coordinates: parts },
    });
  }
}

// Le isole dei paesi grandi si semplificano (sono tante); i paesi piccoli no,
// altrimenti gli atolli sparirebbero. Niente "-clean" per lo stesso motivo.
const simplified = await mapshaper.applyCommands('-i in.json -simplify 12% keep-shapes -o format=geojson out.json', {
  'in.json': { type: 'FeatureCollection', features: islets },
});
const all = {
  type: 'FeatureCollection',
  features: [...countries, ...JSON.parse(simplified['out.json'].toString()).features],
};
const out = await mapshaper.applyCommands('-i in.json -o format=topojson quantization=1000000 out.json', { 'in.json': all });
fs.writeFileSync(OUT, out['out.json'].toString());
console.log(
  `paesi piccoli: ${countries.length}, paesi con isole aggiunte: ${islets.length} → ${path.relative(process.cwd(), OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`
);
