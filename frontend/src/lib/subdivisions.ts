/**
 * Regioni (codici ISO 3166-2) dei paesi con feste regionali in Nager.Date: nome da mostrare e nome
 * della stessa regione nei confini dell'atlante (`public/regions/{ISO3}.json`, campo shapeName), per
 * capire in quale regione cade una meta del viaggio.
 */

interface Subdivision {
  /** Nome come nei confini dell'atlante. */
  shape: string;
  /** Nome italiano, se diverso. */
  it?: string;
  /** Nome inglese, se diverso dallo shape. */
  en?: string;
}

const s = (shape: string, it?: string, en?: string): Subdivision => ({ shape, it, en });

const SUBDIVISIONS: Record<string, Subdivision> = {
  // Germania
  'DE-BW': s('Baden-Württemberg'),
  'DE-BY': s('Bayern', 'Baviera', 'Bavaria'),
  'DE-BE': s('Berlin', 'Berlino'),
  'DE-BB': s('Brandenburg', 'Brandeburgo'),
  'DE-HB': s('Bremen', 'Brema'),
  'DE-HH': s('Hamburg', 'Amburgo'),
  'DE-HE': s('Hessen', 'Assia', 'Hesse'),
  'DE-MV': s('Mecklenburg-Vorpommern', 'Meclemburgo-Pomerania Anteriore'),
  'DE-NI': s('Niedersachsen', 'Bassa Sassonia', 'Lower Saxony'),
  'DE-NW': s('Nordrhein-Westfalen', 'Renania Settentrionale-Vestfalia', 'North Rhine-Westphalia'),
  'DE-RP': s('Rheinland-Pfalz', 'Renania-Palatinato', 'Rhineland-Palatinate'),
  'DE-SL': s('Saarland'),
  'DE-SN': s('Sachsen', 'Sassonia', 'Saxony'),
  'DE-ST': s('Sachsen-Anhalt', 'Sassonia-Anhalt', 'Saxony-Anhalt'),
  'DE-SH': s('Schleswig-Holstein'),
  'DE-TH': s('Thüringen', 'Turingia', 'Thuringia'),
  // Austria
  'AT-1': s('Burgenland'),
  'AT-2': s('Kärnten', 'Carinzia', 'Carinthia'),
  'AT-3': s('Niederösterreich', 'Bassa Austria', 'Lower Austria'),
  'AT-4': s('Oberösterreich', 'Alta Austria', 'Upper Austria'),
  'AT-5': s('Salzburg', 'Salisburgo'),
  'AT-6': s('Steiermark', 'Stiria', 'Styria'),
  'AT-7': s('Tirol', 'Tirolo', 'Tyrol'),
  'AT-8': s('Vorarlberg'),
  'AT-9': s('Wien', 'Vienna', 'Vienna'),
  // Svizzera
  'CH-AG': s('Aargau', 'Argovia'),
  'CH-AI': s('Appenzell Innerrhoden', 'Appenzello Interno'),
  'CH-AR': s('Appenzell Ausserrhoden', 'Appenzello Esterno'),
  'CH-BE': s('Bern', 'Berna'),
  'CH-BL': s('Basel-Landschaft', 'Basilea Campagna'),
  'CH-BS': s('Basel-Stadt', 'Basilea Città'),
  'CH-FR': s('Fribourg', 'Friburgo'),
  'CH-GE': s('Genève', 'Ginevra', 'Geneva'),
  'CH-GL': s('Glarus', 'Glarona'),
  'CH-GR': s('Graubünden', 'Grigioni', 'Grisons'),
  'CH-JU': s('Jura', 'Giura'),
  'CH-LU': s('Luzern', 'Lucerna', 'Lucerne'),
  'CH-NE': s('Neuchâtel'),
  'CH-NW': s('Nidwalden', 'Nidvaldo'),
  'CH-OW': s('Obwalden', 'Obvaldo'),
  'CH-SG': s('St. Gallen', 'San Gallo'),
  'CH-SH': s('Schaffhausen', 'Sciaffusa'),
  'CH-SO': s('Solothurn', 'Soletta'),
  'CH-SZ': s('Schwyz', 'Svitto'),
  'CH-TG': s('Thurgau', 'Turgovia'),
  'CH-TI': s('Ticino'),
  'CH-UR': s('Uri'),
  'CH-VD': s('Vaud'),
  'CH-VS': s('Valais', 'Vallese'),
  'CH-ZG': s('Zug', 'Zugo'),
  'CH-ZH': s('Zürich', 'Zurigo', 'Zurich'),
  // Spagna
  'ES-AN': s('Andalucía', 'Andalusia', 'Andalusia'),
  'ES-AR': s('Aragón', 'Aragona', 'Aragon'),
  'ES-AS': s('Principado de Asturias', 'Asturie', 'Asturias'),
  'ES-CB': s('Cantabria'),
  'ES-CL': s('Castilla y León', 'Castiglia e León', 'Castile and León'),
  'ES-CM': s('Castilla-La Mancha', 'Castiglia-La Mancia'),
  'ES-CN': s('Canarias', 'Canarie', 'Canary Islands'),
  'ES-CT': s('Cataluña/Catalunya', 'Catalogna', 'Catalonia'),
  'ES-EX': s('Extremadura', 'Estremadura'),
  'ES-GA': s('Galicia', 'Galizia'),
  'ES-IB': s('Illes Balears', 'Baleari', 'Balearic Islands'),
  'ES-MC': s('Región de Murcia', 'Murcia', 'Murcia'),
  'ES-MD': s('Comunidad de Madrid', 'Comunità di Madrid', 'Community of Madrid'),
  'ES-NC': s('Comunidad Foral de Navarra', 'Navarra', 'Navarre'),
  'ES-PV': s('País Vasco/Euskadi', 'Paesi Baschi', 'Basque Country'),
  'ES-RI': s('La Rioja'),
  'ES-VC': s('Comunitat Valenciana', 'Comunità Valenciana', 'Valencian Community'),
  'ES-CE': s('Ciudad Autónoma de Ceuta', 'Ceuta', 'Ceuta'),
  'ES-ML': s('Ciudad Autónoma de Melilla', 'Melilla', 'Melilla'),
  // Portogallo
  'PT-20': s('Região Autónoma dos Açores', 'Azzorre', 'Azores'),
  'PT-30': s('Região Autónoma da Madeira', 'Madera', 'Madeira'),
  // Regno Unito
  'GB-ENG': s('England', 'Inghilterra'),
  'GB-NIR': s('Northern Ireland', 'Irlanda del Nord'),
  'GB-SCT': s('Scotland', 'Scozia'),
  'GB-WLS': s('Wales', 'Galles'),
  // Brasile
  'BR-SP': s('Sao Paulo', 'San Paolo', 'São Paulo'),
  // Canada
  'CA-AB': s('Alberta'),
  'CA-BC': s('British Columbia', 'Columbia Britannica'),
  'CA-MB': s('Manitoba'),
  'CA-NB': s('New Brunswick', 'Nuovo Brunswick'),
  'CA-NL': s('Newfoundland and Labrador', 'Terranova e Labrador'),
  'CA-NS': s('Nova Scotia', 'Nuova Scozia'),
  'CA-NT': s('Northwest Territories', 'Territori del Nord-Ovest'),
  'CA-NU': s('Nunavut'),
  'CA-ON': s('Ontario'),
  'CA-PE': s('Prince Edward Island', 'Isola del Principe Edoardo'),
  'CA-QC': s('Quebec', 'Québec', 'Québec'),
  'CA-SK': s('Saskatchewan'),
  'CA-YT': s('Yukon'),
  // Australia
  'AU-ACT': s('Australian Capital Territory', 'Territorio della Capitale (Canberra)'),
  'AU-NSW': s('New South Wales', 'Nuovo Galles del Sud'),
  'AU-NT': s('Northern Territory', 'Territorio del Nord'),
  'AU-QLD': s('Queensland'),
  'AU-SA': s('South Australia', 'Australia Meridionale'),
  'AU-TAS': s('Tasmania'),
  'AU-VIC': s('Victoria'),
  'AU-WA': s('Western Australia', 'Australia Occidentale'),
  // Nuova Zelanda
  'NZ-AUK': s('Auckland Region', 'Auckland', 'Auckland'),
  'NZ-BOP': s('Bay of Plenty Region', 'Bay of Plenty', 'Bay of Plenty'),
  'NZ-CAN': s('Canterbury Region', 'Canterbury', 'Canterbury'),
  'NZ-CIT': s('Chatham Islands Territory', 'Isole Chatham', 'Chatham Islands'),
  'NZ-GIS': s('Gisborne Region', 'Gisborne', 'Gisborne'),
  'NZ-HKB': s("Hawke's Bay Region", "Hawke's Bay", "Hawke's Bay"),
  'NZ-MBH': s('Marlborough Region', 'Marlborough', 'Marlborough'),
  'NZ-MWT': s('Manawatu-Wanganui Region', 'Manawatū-Whanganui', 'Manawatū-Whanganui'),
  'NZ-NSN': s('Nelson Region', 'Nelson', 'Nelson'),
  'NZ-NTL': s('Northland Region', 'Northland', 'Northland'),
  'NZ-OTA': s('Otago Region', 'Otago', 'Otago'),
  'NZ-STL': s('Southland Region', 'Southland', 'Southland'),
  'NZ-TAS': s('Tasman Region', 'Tasman', 'Tasman'),
  'NZ-TKI': s('Taranaki Region', 'Taranaki', 'Taranaki'),
  'NZ-WGN': s('Wellington Region', 'Wellington', 'Wellington'),
  'NZ-WKO': s('Waikato Region', 'Waikato', 'Waikato'),
  'NZ-WTC': s('West Coast Region', 'West Coast', 'West Coast'),
};

/** Stati USA: nome uguale nei confini; in italiano cambiano solo alcuni. */
const US_STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut',
  DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois',
  IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana',
  NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};
const US_STATES_IT: Record<string, string> = {
  NC: 'Carolina del Nord', SC: 'Carolina del Sud', ND: 'Dakota del Nord', SD: 'Dakota del Sud',
  NM: 'Nuovo Messico', WV: 'Virginia Occidentale', PA: 'Pennsylvania', HI: 'Hawaii',
};
for (const [code, name] of Object.entries(US_STATES)) SUBDIVISIONS[`US-${code}`] = s(name, US_STATES_IT[code]);

/** Nome leggibile di una regione dal codice ISO 3166-2; se sconosciuta resta il codice. */
export const subdivisionName = (code: string, lang: 'it' | 'en'): string => {
  const sub = SUBDIVISIONS[code];
  if (!sub) return code;
  return (lang === 'it' ? sub.it : sub.en) ?? sub.shape;
};

/** Codice ISO 3166-2 della regione che nei confini dell'atlante si chiama `shape`. */
export const subdivisionForShape = (countryCode: string, shape: string): string | null => {
  const prefix = `${countryCode.toUpperCase()}-`;
  for (const [code, sub] of Object.entries(SUBDIVISIONS)) {
    if (code.startsWith(prefix) && sub.shape === shape) return code;
  }
  return null;
};
