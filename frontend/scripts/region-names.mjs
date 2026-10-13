// Nomi delle regioni di geoBoundaries: alcuni file (Cile, Portogallo, Seychelles)
// li hanno con UTF-8 decodificato due volte ("RegiÃ³n" invece di "Región").
// Condiviso da build-regions.mjs e build-region-flags.mjs, che devono vedere
// gli stessi nomi (sono anche le chiavi dei segni a mano, atlas_marks.region_key).
export const fixRegionName = (name) =>
  /Ã|Â|â€/.test(name) ? Buffer.from(name, 'latin1').toString('utf8') : name;

/** Unità da escludere: nell'atlante sono paesi a sé (territori USA) o non sono
 * vere regioni ("Other Territories" australiani: Jervis Bay, Isola di Natale…). */
export const EXCLUDE = {
  USA: ['American Samoa', 'Guam', 'Commonwealth of the Northern Mariana Islands', 'Puerto Rico', 'United States Virgin Islands'],
  AUS: ['Other Territories'],
};
