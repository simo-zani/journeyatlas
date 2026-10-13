// Nomi delle regioni di geoBoundaries: alcuni file (Cile, Portogallo, Seychelles)
// li hanno con UTF-8 decodificato due volte ("RegiÃ³n" invece di "Región").
// Condiviso da build-regions.mjs e build-region-flags.mjs, che devono vedere
// gli stessi nomi (sono anche le chiavi dei segni a mano, atlas_marks.region_key).
export const fixRegionName = (name) =>
  /Ã|Â|â€/.test(name) ? Buffer.from(name, 'latin1').toString('utf8') : name;
