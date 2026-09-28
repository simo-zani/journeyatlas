import { foldText } from '@/lib/countries';
import { distanceKm } from '@/lib/airports';
import type { Coordinates, Destination } from '@/lib/types';

export interface TrainStation {
  id: string;
  name: string;
  city: string;
  country: string;
  code: string;
  lat: number;
  lon: number;
  tz: string;
  major: boolean;
  m: {
    name: string;
    city: string;
    code: string;
    tokens: string[];
  };
}

export interface StationWithDistance {
  station: TrainStation;
  km: number;
}

export interface StationGroup {
  label: string;
  items: StationWithDistance[];
}

export const NEAR_STATION_RADIUS_KM = 80;
export const NEAR_STATION_LIMIT = 4;
const SEARCH_LIMIT = 8;

const RAW_STATIONS: Array<{
  id: string;
  name: string;
  city: string;
  country: string;
  code: string;
  lat: number;
  lon: number;
  tz: string;
  major?: boolean;
  keywords?: string;
}> = [
  // ── Italia: Hub Principali e Alta Velocità ──
  { id: 'it-rom-ter', name: 'Roma Termini', city: 'Roma', country: 'IT', code: 'ROM', lat: 41.9014, lon: 12.5008, tz: 'Europe/Rome', major: true, keywords: 'termini lazio capitale' },
  { id: 'it-rom-tib', name: 'Roma Tiburtina', city: 'Roma', country: 'IT', code: 'RMT', lat: 41.9097, lon: 12.5292, tz: 'Europe/Rome', major: true, keywords: 'tiburtina av alta velocita' },
  { id: 'it-rom-ost', name: 'Roma Ostiense', city: 'Roma', country: 'IT', code: 'RMO', lat: 41.8722, lon: 12.4842, tz: 'Europe/Rome', keywords: 'ostiense piramide italo' },
  { id: 'it-fco-aer', name: 'Fiumicino Aeroporto', city: 'Roma', country: 'IT', code: 'FCO', lat: 41.7933, lon: 12.2522, tz: 'Europe/Rome', keywords: 'aeroporto leonardo express' },
  { id: 'it-mil-cen', name: 'Milano Centrale', city: 'Milano', country: 'IT', code: 'MIL', lat: 45.4858, lon: 9.2045, tz: 'Europe/Rome', major: true, keywords: 'centrale piazza duca daosta' },
  { id: 'it-mil-gar', name: 'Milano Porta Garibaldi', city: 'Milano', country: 'IT', code: 'GAR', lat: 45.4842, lon: 9.1883, tz: 'Europe/Rome', major: true, keywords: 'garibaldi gae aulenti italo' },
  { id: 'it-mil-rog', name: 'Milano Rogoredo', city: 'Milano', country: 'IT', code: 'ROG', lat: 45.4336, lon: 9.2392, tz: 'Europe/Rome', keywords: 'rogoredo av italo' },
  { id: 'it-mil-cad', name: 'Milano Cadorna', city: 'Milano', country: 'IT', code: 'CAD', lat: 45.4686, lon: 9.1764, tz: 'Europe/Rome', keywords: 'cadorna malpensa express ferrovienord' },
  { id: 'it-mxp-aer', name: 'Malpensa Aeroporto', city: 'Milano', country: 'IT', code: 'MXP', lat: 45.6275, lon: 8.7122, tz: 'Europe/Rome', keywords: 'terminal 1 malpensa express' },
  { id: 'it-fir-smn', name: 'Firenze Santa Maria Novella', city: 'Firenze', country: 'IT', code: 'FIR', lat: 43.7765, lon: 11.2479, tz: 'Europe/Rome', major: true, keywords: 'smn florence toscana' },
  { id: 'it-fir-cdm', name: 'Firenze Campo di Marte', city: 'Firenze', country: 'IT', code: 'FCM', lat: 43.7772, lon: 11.2778, tz: 'Europe/Rome', keywords: 'campo di marte stadio' },
  { id: 'it-bol-cen', name: 'Bologna Centrale', city: 'Bologna', country: 'IT', code: 'BOL', lat: 44.5058, lon: 11.3417, tz: 'Europe/Rome', major: true, keywords: 'centrale av emilia romagna hub' },
  { id: 'it-nap-cen', name: 'Napoli Centrale', city: 'Napoli', country: 'IT', code: 'NAP', lat: 40.8528, lon: 14.2725, tz: 'Europe/Rome', major: true, keywords: 'centrale piazza garibaldi campania' },
  { id: 'it-nap-afr', name: 'Napoli Afragola', city: 'Napoli', country: 'IT', code: 'AFR', lat: 40.9317, lon: 14.3314, tz: 'Europe/Rome', major: true, keywords: 'afragola av zaha hadid' },
  { id: 'it-tor-pnu', name: 'Torino Porta Nuova', city: 'Torino', country: 'IT', code: 'TOR', lat: 45.0622, lon: 7.6783, tz: 'Europe/Rome', major: true, keywords: 'porta nuova piemonte turin' },
  { id: 'it-tor-psu', name: 'Torino Porta Susa', city: 'Torino', country: 'IT', code: 'TPS', lat: 45.0717, lon: 7.6653, tz: 'Europe/Rome', major: true, keywords: 'porta susa av spina' },
  { id: 'it-ven-slu', name: 'Venezia Santa Lucia', city: 'Venezia', country: 'IT', code: 'VEN', lat: 45.4414, lon: 12.3211, tz: 'Europe/Rome', major: true, keywords: 'santa lucia canal grande venice' },
  { id: 'it-ven-mes', name: 'Venezia Mestre', city: 'Venezia', country: 'IT', code: 'VME', lat: 45.4828, lon: 12.2319, tz: 'Europe/Rome', major: true, keywords: 'mestre terraferma' },
  { id: 'it-ver-pnu', name: 'Verona Porta Nuova', city: 'Verona', country: 'IT', code: 'VER', lat: 45.4289, lon: 10.9822, tz: 'Europe/Rome', major: true, keywords: 'porta nuova veneto arena' },
  { id: 'it-pad-cen', name: 'Padova', city: 'Padova', country: 'IT', code: 'PAD', lat: 45.4172, lon: 11.8797, tz: 'Europe/Rome', major: true, keywords: 'padua centrale' },
  { id: 'it-gen-pri', name: 'Genova Piazza Principe', city: 'Genova', country: 'IT', code: 'GEN', lat: 44.4172, lon: 8.9217, tz: 'Europe/Rome', major: true, keywords: 'piazza principe liguria genoa' },
  { id: 'it-gen-bri', name: 'Genova Brignole', city: 'Genova', country: 'IT', code: 'GBR', lat: 44.4069, lon: 8.9467, tz: 'Europe/Rome', keywords: 'brignole levante' },
  { id: 'it-bar-cen', name: 'Bari Centrale', city: 'Bari', country: 'IT', code: 'BAR', lat: 41.1178, lon: 16.8703, tz: 'Europe/Rome', major: true, keywords: 'centrale puglia' },
  { id: 'it-sal-cen', name: 'Salerno', city: 'Salerno', country: 'IT', code: 'SAL', lat: 40.6756, lon: 14.7725, tz: 'Europe/Rome', major: true, keywords: 'salerno costiera amalfitana av' },
  { id: 'it-bre-cen', name: 'Brescia', city: 'Brescia', country: 'IT', code: 'BRE', lat: 45.5328, lon: 10.2133, tz: 'Europe/Rome', major: true, keywords: 'brescia av lombardia' },
  { id: 'it-ber-cen', name: 'Bergamo', city: 'Bergamo', country: 'IT', code: 'BGM', lat: 45.6917, lon: 9.6756, tz: 'Europe/Rome', keywords: 'bergamo orio' },
  { id: 'it-tri-cen', name: 'Trieste Centrale', city: 'Trieste', country: 'IT', code: 'TRS', lat: 45.6575, lon: 13.7719, tz: 'Europe/Rome', major: true, keywords: 'trieste fvg' },
  { id: 'it-anc-cen', name: 'Ancona', city: 'Ancona', country: 'IT', code: 'ANC', lat: 43.6067, lon: 13.4983, tz: 'Europe/Rome', major: true, keywords: 'ancona marche adriatica' },
  { id: 'it-rim-cen', name: 'Rimini', city: 'Rimini', country: 'IT', code: 'RIM', lat: 44.0642, lon: 12.5742, tz: 'Europe/Rome', keywords: 'rimini riviera romagnola' },
  { id: 'it-pes-cen', name: 'Pescara Centrale', city: 'Pescara', country: 'IT', code: 'PES', lat: 42.4689, lon: 14.2056, tz: 'Europe/Rome', major: true, keywords: 'pescara abruzzo adriatica' },
  { id: 'it-rc-cen', name: 'Reggio Calabria Centrale', city: 'Reggio Calabria', country: 'IT', code: 'REG', lat: 38.0989, lon: 15.6453, tz: 'Europe/Rome', major: true, keywords: 'reggio calabria stretto' },
  { id: 'it-pal-cen', name: 'Palermo Centrale', city: 'Palermo', country: 'IT', code: 'PAL', lat: 38.1097, lon: 13.3672, tz: 'Europe/Rome', major: true, keywords: 'palermo sicilia' },
  { id: 'it-cat-cen', name: 'Catania Centrale', city: 'Catania', country: 'IT', code: 'CAT', lat: 37.5078, lon: 15.0994, tz: 'Europe/Rome', major: true, keywords: 'catania sicilia etna' },

  // ── Italia: Altre Città Capoluogo e Snodi ──
  { id: 'it-re-av', name: 'Reggio Emilia AV Mediopadana', city: 'Reggio Emilia', country: 'IT', code: 'REV', lat: 44.7247, lon: 10.6558, tz: 'Europe/Rome', major: true, keywords: 'mediopadana calatrava av' },
  { id: 'it-re-cen', name: 'Reggio Emilia', city: 'Reggio Emilia', country: 'IT', code: 'RGE', lat: 44.6989, lon: 10.6406, tz: 'Europe/Rome', keywords: 'reggio emilia storica' },
  { id: 'it-par-cen', name: 'Parma', city: 'Parma', country: 'IT', code: 'PAR', lat: 44.8089, lon: 10.3283, tz: 'Europe/Rome', keywords: 'parma emilia' },
  { id: 'it-mod-cen', name: 'Modena', city: 'Modena', country: 'IT', code: 'MOD', lat: 44.6533, lon: 10.9328, tz: 'Europe/Rome', keywords: 'modena emilia' },
  { id: 'it-pia-cen', name: 'Piacenza', city: 'Piacenza', country: 'IT', code: 'PCN', lat: 45.0536, lon: 9.7042, tz: 'Europe/Rome', keywords: 'piacenza' },
  { id: 'it-fer-cen', name: 'Ferrara', city: 'Ferrara', country: 'IT', code: 'FER', lat: 44.8428, lon: 11.6033, tz: 'Europe/Rome', keywords: 'ferrara emilia' },
  { id: 'it-rav-cen', name: 'Ravenna', city: 'Ravenna', country: 'IT', code: 'RAV', lat: 44.4181, lon: 12.2086, tz: 'Europe/Rome', keywords: 'ravenna mosaici' },
  { id: 'it-for-cen', name: 'Forlì', city: 'Forlì', country: 'IT', code: 'FRL', lat: 44.2253, lon: 12.0547, tz: 'Europe/Rome', keywords: 'forli romagna' },
  { id: 'it-ces-cen', name: 'Cesena', city: 'Cesena', country: 'IT', code: 'CES', lat: 44.1436, lon: 12.2475, tz: 'Europe/Rome', keywords: 'cesena romagna' },
  { id: 'it-pis-cen', name: 'Pisa Centrale', city: 'Pisa', country: 'IT', code: 'PIS', lat: 43.7083, lon: 10.3986, tz: 'Europe/Rome', major: true, keywords: 'pisa toscana torre' },
  { id: 'it-liv-cen', name: 'Livorno Centrale', city: 'Livorno', country: 'IT', code: 'LIV', lat: 43.5539, lon: 10.3347, tz: 'Europe/Rome', keywords: 'livorno porto toscana' },
  { id: 'it-luc-cen', name: 'Lucca', city: 'Lucca', country: 'IT', code: 'LUC', lat: 43.8378, lon: 10.5056, tz: 'Europe/Rome', keywords: 'lucca toscana mura' },
  { id: 'it-sie-cen', name: 'Siena', city: 'Siena', country: 'IT', code: 'SIE', lat: 43.3314, lon: 11.3236, tz: 'Europe/Rome', keywords: 'siena toscana piazza del campo' },
  { id: 'it-are-cen', name: 'Arezzo', city: 'Arezzo', country: 'IT', code: 'ARZ', lat: 43.4619, lon: 11.8767, tz: 'Europe/Rome', keywords: 'arezzo toscana av' },
  { id: 'it-gro-cen', name: 'Grosseto', city: 'Grosseto', country: 'IT', code: 'GRO', lat: 42.7667, lon: 11.1194, tz: 'Europe/Rome', keywords: 'grosseto maremma' },
  { id: 'it-spe-cen', name: 'La Spezia Centrale', city: 'La Spezia', country: 'IT', code: 'SPE', lat: 44.1106, lon: 9.8147, tz: 'Europe/Rome', major: true, keywords: 'cinque terre spezia liguria' },
  { id: 'it-sav-cen', name: 'Savona', city: 'Savona', country: 'IT', code: 'SAV', lat: 44.3056, lon: 8.4719, tz: 'Europe/Rome', keywords: 'savona liguria costa' },
  { id: 'it-san-cen', name: 'Sanremo', city: 'Sanremo', country: 'IT', code: 'SRE', lat: 43.8183, lon: 7.7817, tz: 'Europe/Rome', keywords: 'sanremo riviera festival' },
  { id: 'it-ven-cen', name: 'Ventimiglia', city: 'Ventimiglia', country: 'IT', code: 'VTM', lat: 43.7917, lon: 7.6042, tz: 'Europe/Rome', keywords: 'ventimiglia confine francia' },
  { id: 'it-tre-cen', name: 'Trento', city: 'Trento', country: 'IT', code: 'TRN', lat: 46.0719, lon: 11.1189, tz: 'Europe/Rome', major: true, keywords: 'trento trentino brennero' },
  { id: 'it-bol-zno', name: 'Bolzano / Bozen', city: 'Bolzano', country: 'IT', code: 'BZO', lat: 46.4967, lon: 11.3578, tz: 'Europe/Rome', major: true, keywords: 'bolzano bozen alto adige sudtirol' },
  { id: 'it-rov-cen', name: 'Rovereto', city: 'Rovereto', country: 'IT', code: 'ROV', lat: 45.8906, lon: 11.0333, tz: 'Europe/Rome', keywords: 'rovereto mart' },
  { id: 'it-bre-ssx', name: 'Bressanone / Brixen', city: 'Bressanone', country: 'IT', code: 'BXI', lat: 46.7111, lon: 11.6506, tz: 'Europe/Rome', keywords: 'brixen val isarco' },
  { id: 'it-mon-cen', name: 'Monza', city: 'Monza', country: 'IT', code: 'MNZ', lat: 45.5786, lon: 9.2736, tz: 'Europe/Rome', keywords: 'monza brianza autodromo' },
  { id: 'it-com-sg', name: 'Como San Giovanni', city: 'Como', country: 'IT', code: 'COMS', lat: 45.8089, lon: 9.0728, tz: 'Europe/Rome', keywords: 'como lago gottardo' },
  { id: 'it-lec-cen', name: 'Lecco', city: 'Lecco', country: 'IT', code: 'LEC', lat: 45.8561, lon: 9.3942, tz: 'Europe/Rome', keywords: 'lecco lago di como' },
  { id: 'it-pav-cen', name: 'Pavia', city: 'Pavia', country: 'IT', code: 'PAV', lat: 45.1878, lon: 9.1458, tz: 'Europe/Rome', keywords: 'pavia universita' },
  { id: 'it-cre-cen', name: 'Cremona', city: 'Cremona', country: 'IT', code: 'CRM', lat: 45.1439, lon: 10.0244, tz: 'Europe/Rome', keywords: 'cremona liutai' },
  { id: 'it-man-cen', name: 'Mantova', city: 'Mantova', country: 'IT', code: 'MAN', lat: 45.1583, lon: 10.7831, tz: 'Europe/Rome', keywords: 'mantova lombardia' },
  { id: 'it-nov-cen', name: 'Novara', city: 'Novara', country: 'IT', code: 'NOV', lat: 45.4519, lon: 8.6253, tz: 'Europe/Rome', keywords: 'novara piemonte av' },
  { id: 'it-ale-cen', name: 'Alessandria', city: 'Alessandria', country: 'IT', code: 'ALX', lat: 44.9089, lon: 8.6081, tz: 'Europe/Rome', keywords: 'alessandria piemonte' },
  { id: 'it-ast-cen', name: 'Asti', city: 'Asti', country: 'IT', code: 'AST', lat: 44.8967, lon: 8.2081, tz: 'Europe/Rome', keywords: 'asti monferrato' },
  { id: 'it-cun-cen', name: 'Cuneo', city: 'Cuneo', country: 'IT', code: 'CUO', lat: 44.3853, lon: 7.5381, tz: 'Europe/Rome', keywords: 'cuneo piemonte' },
  { id: 'it-aos-cen', name: 'Aosta', city: 'Aosta', country: 'IT', code: 'AOS', lat: 45.7336, lon: 7.3208, tz: 'Europe/Rome', keywords: 'aosta valle daosta' },
  { id: 'it-dom-cen', name: 'Domodossola', city: 'Domodossola', country: 'IT', code: 'DOM', lat: 46.1158, lon: 8.2975, tz: 'Europe/Rome', keywords: 'sempione svizzera centovalli' },
  { id: 'it-udi-cen', name: 'Udine', city: 'Udine', country: 'IT', code: 'UDI', lat: 46.0567, lon: 13.2422, tz: 'Europe/Rome', major: true, keywords: 'udine friuli fvg' },
  { id: 'it-por-cen', name: 'Pordenone', city: 'Pordenone', country: 'IT', code: 'POR', lat: 45.9547, lon: 12.6567, tz: 'Europe/Rome', keywords: 'pordenone friuli' },
  { id: 'it-per-cen', name: 'Perugia Fontivegge', city: 'Perugia', country: 'IT', code: 'PER', lat: 43.1044, lon: 12.3756, tz: 'Europe/Rome', keywords: 'fontivegge umbria' },
  { id: 'it-ter-cen', name: 'Terni', city: 'Terni', country: 'IT', code: 'TER', lat: 42.5661, lon: 12.6536, tz: 'Europe/Rome', keywords: 'terni umbria' },
  { id: 'it-civ-cen', name: 'Civitavecchia', city: 'Civitavecchia', country: 'IT', code: 'CIV', lat: 42.0917, lon: 11.7967, tz: 'Europe/Rome', keywords: 'civitavecchia porto crociere' },
  { id: 'it-cas-cen', name: 'Caserta', city: 'Caserta', country: 'IT', code: 'CAS', lat: 41.0683, lon: 14.3278, tz: 'Europe/Rome', major: true, keywords: 'caserta reggia av' },
  { id: 'it-ben-cen', name: 'Benevento', city: 'Benevento', country: 'IT', code: 'BEN', lat: 41.1378, lon: 14.7744, tz: 'Europe/Rome', keywords: 'benevento campania' },
  { id: 'it-fog-cen', name: 'Foggia', city: 'Foggia', country: 'IT', code: 'FOG', lat: 41.4647, lon: 15.5558, tz: 'Europe/Rome', major: true, keywords: 'foggia puglia gargano av' },
  { id: 'it-brn-cen', name: 'Brindisi', city: 'Brindisi', country: 'IT', code: 'BDI', lat: 40.6342, lon: 17.9358, tz: 'Europe/Rome', keywords: 'brindisi porto puglia' },
  { id: 'it-lec-pce', name: 'Lecce', city: 'Lecce', country: 'IT', code: 'LCE', lat: 40.3517, lon: 18.1628, tz: 'Europe/Rome', major: true, keywords: 'lecce salento puglia' },
  { id: 'it-tar-cen', name: 'Taranto', city: 'Taranto', country: 'IT', code: 'TAR', lat: 40.4817, lon: 17.2181, tz: 'Europe/Rome', keywords: 'taranto puglia jonio' },
  { id: 'it-pot-cen', name: 'Potenza Centrale', city: 'Potenza', country: 'IT', code: 'POT', lat: 40.6319, lon: 15.8017, tz: 'Europe/Rome', keywords: 'potenza basilicata' },
  { id: 'it-mat-cen', name: 'Matera Centrale', city: 'Matera', country: 'IT', code: 'MAT', lat: 40.6669, lon: 16.6022, tz: 'Europe/Rome', keywords: 'matera sassi fal' },
  { id: 'it-cos-cen', name: 'Cosenza', city: 'Cosenza', country: 'IT', code: 'COS', lat: 39.3142, lon: 16.2575, tz: 'Europe/Rome', keywords: 'cosenza calabria' },
  { id: 'it-lam-cen', name: 'Lamezia Terme Centrale', city: 'Lamezia Terme', country: 'IT', code: 'LAM', lat: 38.9186, lon: 16.2519, tz: 'Europe/Rome', major: true, keywords: 'lamezia calabria av hub' },
  { id: 'it-vil-cen', name: 'Villa San Giovanni', city: 'Villa San Giovanni', country: 'IT', code: 'VSG', lat: 38.2197, lon: 15.6339, tz: 'Europe/Rome', major: true, keywords: 'traghetti messina sicilia stretto' },
  { id: 'it-mes-cen', name: 'Messina Centrale', city: 'Messina', country: 'IT', code: 'MES', lat: 38.1856, lon: 15.5583, tz: 'Europe/Rome', major: true, keywords: 'messina sicilia' },
  { id: 'it-sir-cen', name: 'Siracusa', city: 'Siracusa', country: 'IT', code: 'SIR', lat: 37.0678, lon: 15.2797, tz: 'Europe/Rome', keywords: 'siracusa ortigia sicilia' },
  { id: 'it-agr-cen', name: 'Agrigento Centrale', city: 'Agrigento', country: 'IT', code: 'AGR', lat: 37.3106, lon: 13.5858, tz: 'Europe/Rome', keywords: 'agrigento valle dei templi' },
  { id: 'it-cag-cen', name: 'Cagliari', city: 'Cagliari', country: 'IT', code: 'CAG', lat: 39.2158, lon: 9.1086, tz: 'Europe/Rome', major: true, keywords: 'cagliari sardegna' },
  { id: 'it-sas-cen', name: 'Sassari', city: 'Sassari', country: 'IT', code: 'SAS', lat: 40.7303, lon: 8.5561, tz: 'Europe/Rome', keywords: 'sassari sardegna' },
  { id: 'it-olb-cen', name: 'Olbia', city: 'Olbia', country: 'IT', code: 'OLB', lat: 40.9253, lon: 9.5008, tz: 'Europe/Rome', keywords: 'olbia sardegna costa smeralda' },

  // ── Europa: Principali Hub Ferroviari Internazionali ──
  // Francia
  { id: 'fr-par-lyo', name: 'Paris Gare de Lyon', city: 'Parigi', country: 'FR', code: 'PLY', lat: 48.8448, lon: 2.3735, tz: 'Europe/Paris', major: true, keywords: 'paris tgv lione italia frecciarossa' },
  { id: 'fr-par-nor', name: 'Paris Gare du Nord', city: 'Parigi', country: 'FR', code: 'PNO', lat: 48.8809, lon: 2.3553, tz: 'Europe/Paris', major: true, keywords: 'paris eurostar thalys londra bruxelles' },
  { id: 'fr-par-mon', name: 'Paris Montparnasse', city: 'Parigi', country: 'FR', code: 'PMO', lat: 48.8412, lon: 2.3204, tz: 'Europe/Paris', major: true, keywords: 'paris tgv atlantique bordeaux' },
  { id: 'fr-par-est', name: 'Paris Gare de l\'Est', city: 'Parigi', country: 'FR', code: 'PES', lat: 48.8767, lon: 2.3592, tz: 'Europe/Paris', keywords: 'paris germania strasburgo' },
  { id: 'fr-lyo-par', name: 'Lyon Part-Dieu', city: 'Lione', country: 'FR', code: 'LPD', lat: 45.7606, lon: 4.8597, tz: 'Europe/Paris', major: true, keywords: 'lyon frecciarossa tgv' },
  { id: 'fr-mar-stc', name: 'Marseille Saint-Charles', city: 'Marsiglia', country: 'FR', code: 'MSC', lat: 43.3031, lon: 5.3806, tz: 'Europe/Paris', major: true, keywords: 'marseille provenza costa azzurra' },
  { id: 'fr-nic-vil', name: 'Nice-Ville', city: 'Nizza', country: 'FR', code: 'NCE', lat: 43.7047, lon: 7.2619, tz: 'Europe/Paris', major: true, keywords: 'nice costa azzurra' },
  { id: 'fr-str-vil', name: 'Strasbourg-Ville', city: 'Strasburgo', country: 'FR', code: 'SXB', lat: 48.5853, lon: 7.7344, tz: 'Europe/Paris', keywords: 'strasbourg alsazia' },
  { id: 'fr-bor-stj', name: 'Bordeaux Saint-Jean', city: 'Bordeaux', country: 'FR', code: 'BOD', lat: 44.8258, lon: -0.5564, tz: 'Europe/Paris', keywords: 'bordeaux aquitania' },

  // Svizzera
  { id: 'ch-zur-hb', name: 'Zürich HB', city: 'Zurigo', country: 'CH', code: 'ZRH', lat: 47.3782, lon: 8.5403, tz: 'Europe/Zurich', major: true, keywords: 'zurigo hauptbahnhof sbb' },
  { id: 'ch-gen-cor', name: 'Genève Cornavin', city: 'Ginevra', country: 'CH', code: 'GVA', lat: 46.2103, lon: 6.1425, tz: 'Europe/Zurich', major: true, keywords: 'geneve ginevra sbb' },
  { id: 'ch-bas-sbb', name: 'Basel SBB', city: 'Basilea', country: 'CH', code: 'BSL', lat: 47.5475, lon: 7.5897, tz: 'Europe/Zurich', major: true, keywords: 'basilea basel brennero reno' },
  { id: 'ch-ber-hb', name: 'Bern', city: 'Berna', country: 'CH', code: 'BRN', lat: 46.9489, lon: 7.4394, tz: 'Europe/Zurich', keywords: 'berna bern capitale' },
  { id: 'ch-lau-cen', name: 'Lausanne', city: 'Losanna', country: 'CH', code: 'LAU', lat: 46.5169, lon: 6.6292, tz: 'Europe/Zurich', keywords: 'losanna lemano' },
  { id: 'ch-lug-cen', name: 'Lugano', city: 'Lugano', country: 'CH', code: 'LUG', lat: 46.0053, lon: 8.9472, tz: 'Europe/Zurich', major: true, keywords: 'lugano ticino gottardo' },

  // Regno Unito
  { id: 'gb-lon-stp', name: 'London St Pancras Int.', city: 'Londra', country: 'GB', code: 'STP', lat: 51.5314, lon: -0.1261, tz: 'Europe/London', major: true, keywords: 'london eurostar kings cross parigi' },
  { id: 'gb-lon-pad', name: 'London Paddington', city: 'Londra', country: 'GB', code: 'PAD', lat: 51.5154, lon: -0.1755, tz: 'Europe/London', keywords: 'paddington heathrow express' },
  { id: 'gb-lon-eus', name: 'London Euston', city: 'Londra', country: 'GB', code: 'EUS', lat: 51.5281, lon: -0.1336, tz: 'Europe/London', keywords: 'euston scozia manchester' },
  { id: 'gb-edi-wav', name: 'Edinburgh Waverley', city: 'Edimburgo', country: 'GB', code: 'EDB', lat: 55.9522, lon: -3.1889, tz: 'Europe/London', major: true, keywords: 'edinburgh scozia' },

  // Germania
  { id: 'de-ber-hbf', name: 'Berlin Hbf', city: 'Berlino', country: 'DE', code: 'BLN', lat: 52.5256, lon: 13.3694, tz: 'Europe/Berlin', major: true, keywords: 'berlin hauptbahnhof db ice' },
  { id: 'de-mun-hbf', name: 'München Hbf', city: 'Monaco di Baviera', country: 'DE', code: 'MUC', lat: 48.1403, lon: 11.5583, tz: 'Europe/Berlin', major: true, keywords: 'munchen monaco baviera brennero' },
  { id: 'de-fra-hbf', name: 'Frankfurt (Main) Hbf', city: 'Francoforte', country: 'DE', code: 'FRA', lat: 50.1072, lon: 8.6636, tz: 'Europe/Berlin', major: true, keywords: 'frankfurt db hub centrale' },
  { id: 'de-kol-hbf', name: 'Köln Hbf', city: 'Colonia', country: 'DE', code: 'CGN', lat: 50.9431, lon: 6.9586, tz: 'Europe/Berlin', keywords: 'cologne duomo reno' },
  { id: 'de-ham-hbf', name: 'Hamburg Hbf', city: 'Amburgo', country: 'DE', code: 'HAM', lat: 53.5531, lon: 10.0067, tz: 'Europe/Berlin', keywords: 'hamburg' },
  { id: 'de-stu-hbf', name: 'Stuttgart Hbf', city: 'Stoccarda', country: 'DE', code: 'STR', lat: 48.7839, lon: 9.1817, tz: 'Europe/Berlin', keywords: 'stuttgart' },

  // Austria
  { id: 'at-vie-hbf', name: 'Wien Hbf', city: 'Vienna', country: 'AT', code: 'VIE', lat: 48.1853, lon: 16.3778, tz: 'Europe/Vienna', major: true, keywords: 'vienna wien obb nightjet' },
  { id: 'at-sal-hbf', name: 'Salzburg Hbf', city: 'Salisburgo', country: 'AT', code: 'SZG', lat: 47.8131, lon: 13.0456, tz: 'Europe/Vienna', keywords: 'salzburg mozart' },
  { id: 'at-inn-hbf', name: 'Innsbruck Hbf', city: 'Innsbruck', country: 'AT', code: 'INN', lat: 47.2636, lon: 11.4011, tz: 'Europe/Vienna', major: true, keywords: 'innsbruck tirol brennero' },

  // Spagna
  { id: 'es-mad-ato', name: 'Madrid Puerta de Atocha', city: 'Madrid', country: 'ES', code: 'ATO', lat: 40.4069, lon: -3.6908, tz: 'Europe/Madrid', major: true, keywords: 'madrid atocha ave renfe iryo' },
  { id: 'es-mad-cha', name: 'Madrid Chamartín', city: 'Madrid', country: 'ES', code: 'CHA', lat: 40.4722, lon: -3.6825, tz: 'Europe/Madrid', keywords: 'chamartin nord galizia' },
  { id: 'es-bar-san', name: 'Barcelona Sants', city: 'Barcellona', country: 'ES', code: 'BCN', lat: 41.3792, lon: 2.1403, tz: 'Europe/Madrid', major: true, keywords: 'barcelona sants ave tgv' },
  { id: 'es-val-jso', name: 'Valencia Joaquín Sorolla', city: 'Valencia', country: 'ES', code: 'VLC', lat: 39.4608, lon: -0.3814, tz: 'Europe/Madrid', keywords: 'valencia ave' },
  { id: 'es-sev-sju', name: 'Sevilla Santa Justa', city: 'Siviglia', country: 'ES', code: 'SVQ', lat: 37.3917, lon: -5.9753, tz: 'Europe/Madrid', keywords: 'sevilla andalusia' },

  // Belgio e Paesi Bassi
  { id: 'be-bru-mid', name: 'Bruxelles-Midi / Brussel-Zuid', city: 'Bruxelles', country: 'BE', code: 'ZYR', lat: 50.8358, lon: 4.3364, tz: 'Europe/Brussels', major: true, keywords: 'brussels midi eurostar thalys' },
  { id: 'nl-ams-cen', name: 'Amsterdam Centraal', city: 'Amsterdam', country: 'NL', code: 'AMS', lat: 52.3789, lon: 4.9006, tz: 'Europe/Amsterdam', major: true, keywords: 'amsterdam eurostar ns' },
  { id: 'nl-rot-cen', name: 'Rotterdam Centraal', city: 'Rotterdam', country: 'NL', code: 'RTM', lat: 51.9250, lon: 4.4689, tz: 'Europe/Amsterdam', keywords: 'rotterdam' },

  // Altre capitali europee
  { id: 'cz-pra-hln', name: 'Praha hlavní nádraží', city: 'Praga', country: 'CZ', code: 'PRG', lat: 50.0831, lon: 14.4353, tz: 'Europe/Prague', major: true, keywords: 'prague praga hl n' },
  { id: 'hu-bud-kel', name: 'Budapest Keleti', city: 'Budapest', country: 'HU', code: 'BUD', lat: 47.5003, lon: 19.0839, tz: 'Europe/Budapest', keywords: 'budapest keleti ungari' },
  { id: 'pl-war-cen', name: 'Warszawa Centralna', city: 'Varsavia', country: 'PL', code: 'WAW', lat: 52.2289, lon: 21.0033, tz: 'Europe/Warsaw', keywords: 'warsaw varsavia pkp' },
  { id: 'pt-lis-ori', name: 'Lisboa Oriente', city: 'Lisbona', country: 'PT', code: 'LIS', lat: 38.7678, lon: -9.0994, tz: 'Europe/Lisbon', keywords: 'lisbona calatrava comboios' },

  // ── Giappone (Japan - Shinkansen & Hubs) ──
  { id: 'jp-tyo-sta', name: 'Tokyo Station', city: 'Tokyo', country: 'JP', code: 'TYO', lat: 35.6812, lon: 139.7671, tz: 'Asia/Tokyo', major: true, keywords: 'tokyo shinkansen marunouchi jr tokaido tohoku' },
  { id: 'jp-tyo-sgw', name: 'Shinagawa', city: 'Tokyo', country: 'JP', code: 'SGW', lat: 35.6285, lon: 139.7388, tz: 'Asia/Tokyo', major: true, keywords: 'shinagawa shinkansen tokyo haneda' },
  { id: 'jp-tyo-sjk', name: 'Shinjuku', city: 'Tokyo', country: 'JP', code: 'SJK', lat: 35.6896, lon: 139.7006, tz: 'Asia/Tokyo', major: true, keywords: 'shinjuku yamanote chuo' },
  { id: 'jp-kyo-sta', name: 'Kyoto Station', city: 'Kyoto', country: 'JP', code: 'KYO', lat: 34.9858, lon: 135.7588, tz: 'Asia/Tokyo', major: true, keywords: 'kyoto shinkansen tokaido kansai' },
  { id: 'jp-osa-sos', name: 'Shin-Osaka', city: 'Osaka', country: 'JP', code: 'SOK', lat: 34.7335, lon: 135.5003, tz: 'Asia/Tokyo', major: true, keywords: 'shin osaka shinkansen sanyo tokaido' },
  { id: 'jp-osa-sta', name: 'Osaka Station', city: 'Osaka', country: 'JP', code: 'OSA', lat: 34.7025, lon: 135.4960, tz: 'Asia/Tokyo', major: true, keywords: 'osaka umeda' },
  { id: 'jp-ngo-sta', name: 'Nagoya Station', city: 'Nagoya', country: 'JP', code: 'NGO', lat: 35.1709, lon: 136.8815, tz: 'Asia/Tokyo', major: true, keywords: 'nagoya shinkansen chubu' },
  { id: 'jp-hij-sta', name: 'Hiroshima Station', city: 'Hiroshima', country: 'JP', code: 'HIJ', lat: 34.3976, lon: 132.4753, tz: 'Asia/Tokyo', major: true, keywords: 'hiroshima shinkansen' },
  { id: 'jp-hkt-sta', name: 'Hakata Station (Fukuoka)', city: 'Fukuoka', country: 'JP', code: 'HKT', lat: 33.5900, lon: 130.4206, tz: 'Asia/Tokyo', major: true, keywords: 'hakata fukuoka kyushu shinkansen' },
  { id: 'jp-syo-sta', name: 'Shin-Yokohama', city: 'Yokohama', country: 'JP', code: 'SYO', lat: 35.5069, lon: 139.6175, tz: 'Asia/Tokyo', keywords: 'shin yokohama shinkansen' },
  { id: 'jp-knz-sta', name: 'Kanazawa Station', city: 'Kanazawa', country: 'JP', code: 'KNZ', lat: 36.5781, lon: 136.6478, tz: 'Asia/Tokyo', keywords: 'kanazawa hokuriku shinkansen' },
  { id: 'jp-spk-sta', name: 'Sapporo Station', city: 'Sapporo', country: 'JP', code: 'SPK', lat: 43.0686, lon: 141.3508, tz: 'Asia/Tokyo', major: true, keywords: 'sapporo hokkaido jr' },

  // ── Cina (China) & Hong Kong ──
  { id: 'cn-bjs-sta', name: 'Beijing South (北京南)', city: 'Pechino', country: 'CN', code: 'VNP', lat: 39.8650, lon: 116.3786, tz: 'Asia/Shanghai', major: true, keywords: 'beijing pechino south gaotie high speed' },
  { id: 'cn-bjw-sta', name: 'Beijing West (北京西)', city: 'Pechino', country: 'CN', code: 'BXP', lat: 39.8942, lon: 116.3219, tz: 'Asia/Shanghai', major: true, keywords: 'beijing west' },
  { id: 'cn-shh-hqo', name: 'Shanghai Hongqiao (上海虹桥)', city: 'Shanghai', country: 'CN', code: 'AOH', lat: 31.1942, lon: 121.3197, tz: 'Asia/Shanghai', major: true, keywords: 'shanghai hongqiao gaotie airport' },
  { id: 'cn-shh-sta', name: 'Shanghai Railway Station (上海站)', city: 'Shanghai', country: 'CN', code: 'SHH', lat: 31.2494, lon: 121.4556, tz: 'Asia/Shanghai', keywords: 'shanghai central' },
  { id: 'cn-gzs-sta', name: 'Guangzhou South (广州南)', city: 'Canton', country: 'CN', code: 'GZQ', lat: 22.9889, lon: 113.2683, tz: 'Asia/Shanghai', major: true, keywords: 'guangzhou canton south' },
  { id: 'cn-szn-sta', name: 'Shenzhen North (深圳北)', city: 'Shenzhen', country: 'CN', code: 'IOQ', lat: 22.6092, lon: 114.0294, tz: 'Asia/Shanghai', major: true, keywords: 'shenzhen north' },
  { id: 'hk-hkg-kow', name: 'Hong Kong West Kowloon (香港西九龍)', city: 'Hong Kong', country: 'HK', code: 'WEK', lat: 22.3042, lon: 114.1658, tz: 'Asia/Hong_Kong', major: true, keywords: 'hong kong kowloon high speed express rail' },
  { id: 'cn-xian-nor', name: 'Xi\'an North (西安北)', city: 'Xi\'an', country: 'CN', code: 'EAY', lat: 34.3769, lon: 108.9389, tz: 'Asia/Shanghai', major: true, keywords: 'xian terracotta gaotie' },
  { id: 'cn-chg-eas', name: 'Chengdu East (成都东)', city: 'Chengdu', country: 'CN', code: 'ICW', lat: 30.6294, lon: 104.1417, tz: 'Asia/Shanghai', major: true, keywords: 'chengdu sichuan gaotie' },

  // ── India ──
  { id: 'in-del-ndl', name: 'New Delhi Railway Station', city: 'Nuova Delhi', country: 'IN', code: 'NDLS', lat: 28.6427, lon: 77.2195, tz: 'Asia/Kolkata', major: true, keywords: 'new delhi ndls paharganj vande bharat' },
  { id: 'in-del-nzm', name: 'Hazrat Nizamuddin', city: 'Nuova Delhi', country: 'IN', code: 'NZM', lat: 28.5889, lon: 77.2536, tz: 'Asia/Kolkata', keywords: 'nizamuddin delhi rajdhani' },
  { id: 'in-mum-csm', name: 'Mumbai CSMT (Victoria Terminus)', city: 'Mumbai', country: 'IN', code: 'CSMT', lat: 18.9400, lon: 72.8353, tz: 'Asia/Kolkata', major: true, keywords: 'mumbai csmt bombay victoria unesco' },
  { id: 'in-mum-cen', name: 'Mumbai Central', city: 'Mumbai', country: 'IN', code: 'MMCT', lat: 18.9697, lon: 72.8194, tz: 'Asia/Kolkata', keywords: 'mumbai central western railway' },
  { id: 'in-blr-ksr', name: 'KSR Bengaluru City', city: 'Bangalore', country: 'IN', code: 'SBC', lat: 12.9781, lon: 77.5694, tz: 'Asia/Kolkata', major: true, keywords: 'bangalore bengaluru ksr sbc karnataka' },
  { id: 'in-kol-hwh', name: 'Howrah Junction (Kolkata)', city: 'Calcutta', country: 'IN', code: 'HWH', lat: 22.5839, lon: 88.3428, tz: 'Asia/Kolkata', major: true, keywords: 'howrah kolkata calcutta' },
  { id: 'in-che-mas', name: 'Chennai Central', city: 'Chennai', country: 'IN', code: 'MAS', lat: 13.0825, lon: 80.2750, tz: 'Asia/Kolkata', major: true, keywords: 'chennai madras mas' },
  { id: 'in-agr-agc', name: 'Agra Cantt', city: 'Agra', country: 'IN', code: 'AGC', lat: 27.1581, lon: 77.9903, tz: 'Asia/Kolkata', major: true, keywords: 'agra cantt taj mahal gatimaan express' },
  { id: 'in-jai-jpr', name: 'Jaipur Junction', city: 'Jaipur', country: 'IN', code: 'JP', lat: 26.9197, lon: 75.7878, tz: 'Asia/Kolkata', keywords: 'jaipur rajasthan' },
  { id: 'in-var-bsb', name: 'Varanasi Junction', city: 'Varanasi', country: 'IN', code: 'BSB', lat: 25.3275, lon: 82.9864, tz: 'Asia/Kolkata', keywords: 'varanasi benares ganges bsb' },

  // ── Stati Uniti (USA) ──
  { id: 'us-nyc-pen', name: 'New York Penn Station', city: 'New York', country: 'US', code: 'NYP', lat: 40.7506, lon: -73.9935, tz: 'America/New_York', major: true, keywords: 'new york penn amtrak moynihan manhattan acel' },
  { id: 'us-nyc-gct', name: 'Grand Central Terminal', city: 'New York', country: 'US', code: 'NYG', lat: 40.7527, lon: -73.9772, tz: 'America/New_York', major: true, keywords: 'grand central manhattan metro north' },
  { id: 'us-was-uni', name: 'Washington Union Station', city: 'Washington', country: 'US', code: 'WAS', lat: 38.8978, lon: -77.0061, tz: 'America/New_York', major: true, keywords: 'washington dc union station amtrak acela' },
  { id: 'us-bos-sou', name: 'Boston South Station', city: 'Boston', country: 'US', code: 'BOS', lat: 42.3519, lon: -71.0552, tz: 'America/New_York', major: true, keywords: 'boston south amtrak acela' },
  { id: 'us-chi-uni', name: 'Chicago Union Station', city: 'Chicago', country: 'US', code: 'CHI', lat: 41.8787, lon: -87.6403, tz: 'America/Chicago', major: true, keywords: 'chicago union amtrak hub midwest' },
  { id: 'us-phl-30t', name: 'Philadelphia 30th Street', city: 'Filadelfia', country: 'US', code: 'PHL', lat: 39.9558, lon: -75.1820, tz: 'America/New_York', major: true, keywords: 'philadelphia 30th amtrak' },
  { id: 'us-lax-uni', name: 'Los Angeles Union Station', city: 'Los Angeles', country: 'US', code: 'LAX', lat: 34.0562, lon: -118.2365, tz: 'America/Los_Angeles', major: true, keywords: 'los angeles union station amtrak surfliner' },
  { id: 'us-sfo-4th', name: 'San Francisco 4th & King', city: 'San Francisco', country: 'US', code: 'SFO', lat: 37.7764, lon: -122.3942, tz: 'America/Los_Angeles', major: true, keywords: 'san francisco caltrain' },
  { id: 'us-mia-cen', name: 'MiamiCentral', city: 'Miami', country: 'US', code: 'MIA', lat: 25.7797, lon: -80.1964, tz: 'America/New_York', major: true, keywords: 'miami brightline florida' },
  { id: 'us-orl-mco', name: 'Orlando Station (Airport)', city: 'Orlando', country: 'US', code: 'MCO', lat: 28.4294, lon: -81.3089, tz: 'America/New_York', major: true, keywords: 'orlando brightline airport mco' },
  { id: 'us-sea-kin', name: 'Seattle King Street Station', city: 'Seattle', country: 'US', code: 'SEA', lat: 47.5983, lon: -122.3297, tz: 'America/Los_Angeles', keywords: 'seattle amtrak cascades' },

  // ── Canada ──
  { id: 'ca-tor-uni', name: 'Toronto Union Station', city: 'Toronto', country: 'CA', code: 'TWO', lat: 43.6453, lon: -79.3806, tz: 'America/Toronto', major: true, keywords: 'toronto union via rail go transit' },
  { id: 'ca-mtl-cen', name: 'Montreal Central Station', city: 'Montreal', country: 'CA', code: 'YMY', lat: 45.5000, lon: -73.5667, tz: 'America/Toronto', major: true, keywords: 'montreal gare centrale via rail' },
  { id: 'ca-van-pac', name: 'Vancouver Pacific Central', city: 'Vancouver', country: 'CA', code: 'VAC', lat: 49.2736, lon: -123.0978, tz: 'America/Vancouver', major: true, keywords: 'vancouver pacific central via rail rocky mountaineer' },
  { id: 'ca-qbc-pal', name: 'Gare du Palais (Quebec)', city: 'Québec', country: 'CA', code: 'YQB', lat: 46.8178, lon: -71.2139, tz: 'America/Toronto', keywords: 'quebec gare du palais via rail' },

  // ── Australia ──
  { id: 'au-syd-cen', name: 'Sydney Central Station', city: 'Sydney', country: 'AU', code: 'SYD', lat: -33.8833, lon: 151.2064, tz: 'Australia/Sydney', major: true, keywords: 'sydney central nsw trainlink australia' },
  { id: 'au-mel-sou', name: 'Melbourne Southern Cross', city: 'Melbourne', country: 'AU', code: 'MEL', lat: -37.8186, lon: 144.9525, tz: 'Australia/Melbourne', major: true, keywords: 'melbourne southern cross vline overland' },
  { id: 'au-bne-rom', name: 'Brisbane Roma Street', city: 'Brisbane', country: 'AU', code: 'BNE', lat: -27.4656, lon: 153.0189, tz: 'Australia/Brisbane', major: true, keywords: 'brisbane roma street queensland rail' },
  { id: 'au-adl-par', name: 'Adelaide Parklands Terminal', city: 'Adelaide', country: 'AU', code: 'ADL', lat: -34.9450, lon: 138.5833, tz: 'Australia/Adelaide', major: true, keywords: 'adelaide the ghan indian pacific' },
  { id: 'au-per-eas', name: 'East Perth Terminal', city: 'Perth', country: 'AU', code: 'PER', lat: -31.9439, lon: 115.8753, tz: 'Australia/Perth', major: true, keywords: 'perth indian pacific transwa' },
  { id: 'au-asp-sta', name: 'Alice Springs Station', city: 'Alice Springs', country: 'AU', code: 'ASP', lat: -23.7011, lon: 133.8711, tz: 'Australia/Darwin', major: true, keywords: 'alice springs the ghan outback red centre' },
  { id: 'au-drw-ter', name: 'Darwin Berrimah Terminal', city: 'Darwin', country: 'AU', code: 'DRW', lat: -12.4764, lon: 130.9381, tz: 'Australia/Darwin', major: true, keywords: 'darwin the ghan northern territory' },
  { id: 'au-cns-sta', name: 'Cairns Railway Station', city: 'Cairns', country: 'AU', code: 'CNS', lat: -16.9250, lon: 145.7722, tz: 'Australia/Brisbane', keywords: 'cairns spirit of queensland kuranda' },

  // ── Corea del Sud (South Korea) ──
  { id: 'kr-sel-sta', name: 'Seoul Station', city: 'Seul', country: 'KR', code: 'SEL', lat: 37.5547, lon: 126.9708, tz: 'Asia/Seoul', major: true, keywords: 'seoul station ktx korail corea' },
  { id: 'kr-pus-sta', name: 'Busan Station', city: 'Busan', country: 'KR', code: 'PUS', lat: 35.1153, lon: 129.0422, tz: 'Asia/Seoul', major: true, keywords: 'busan station ktx korail pusan' },

  // ── Taiwan ──
  { id: 'tw-tpe-mai', name: 'Taipei Main Station', city: 'Taipei', country: 'TW', code: 'TPE', lat: 25.0478, lon: 121.5172, tz: 'Asia/Taipei', major: true, keywords: 'taipei main thsr tra taiwan' },
  { id: 'tw-kao-zuo', name: 'Kaohsiung Zuoying HSR', city: 'Kaohsiung', country: 'TW', code: 'ZUY', lat: 22.6872, lon: 120.3075, tz: 'Asia/Taipei', major: true, keywords: 'kaohsiung zuoying thsr taiwan' },

  // ── Marocco & Arabia Saudita ──
  { id: 'ma-cas-voy', name: 'Casablanca Casa-Voyageurs', city: 'Casablanca', country: 'MA', code: 'CAS', lat: 33.5894, lon: -7.5892, tz: 'Africa/Casablanca', major: true, keywords: 'casablanca casa voyageurs oncf al boraq' },
  { id: 'ma-tng-vil', name: 'Tanger-Ville', city: 'Tangeri', country: 'MA', code: 'TNG', lat: 35.7725, lon: -5.7925, tz: 'Africa/Casablanca', major: true, keywords: 'tangeri tangier al boraq oncf tgv' },
  { id: 'ma-rak-sta', name: 'Gare de Marrakech', city: 'Marrakech', country: 'MA', code: 'RAK', lat: 31.6300, lon: -8.0189, tz: 'Africa/Casablanca', major: true, keywords: 'marrakech oncf marocco' },
  { id: 'sa-mkh-hhr', name: 'Makkah HHR Station', city: 'La Mecca', country: 'SA', code: 'MKH', lat: 21.4225, lon: 39.7906, tz: 'Asia/Riyadh', major: true, keywords: 'mecca makkah haramain high speed saudi' },
  { id: 'sa-med-hhr', name: 'Madinah HHR Station', city: 'Medina', country: 'SA', code: 'MED', lat: 24.4750, lon: 39.6389, tz: 'Asia/Riyadh', major: true, keywords: 'medina madinah haramain high speed' },
  { id: 'sa-jed-hhr', name: 'Jeddah Al-Sulaymaniyah HHR', city: 'Gedda', country: 'SA', code: 'JED', lat: 21.5039, lon: 39.2278, tz: 'Asia/Riyadh', major: true, keywords: 'jeddah gedda haramain airport' },

  // ── Sudest Asiatico ──
  { id: 'th-bkk-aph', name: 'Bangkok Krung Thep Aphiwat', city: 'Bangkok', country: 'TH', code: 'BUE', lat: 13.8033, lon: 100.5408, tz: 'Asia/Bangkok', major: true, keywords: 'bangkok bang sue krung thep aphiwat srt thailand' },
  { id: 'th-cnx-sta', name: 'Chiang Mai Railway Station', city: 'Chiang Mai', country: 'TH', code: 'CNX', lat: 18.7847, lon: 99.0169, tz: 'Asia/Bangkok', keywords: 'chiang mai srt thailand' },
  { id: 'id-jkt-hlm', name: 'Jakarta Halim HSR', city: 'Giacarta', country: 'ID', code: 'HLM', lat: -6.2464, lon: 106.8858, tz: 'Asia/Jakarta', major: true, keywords: 'jakarta halim whoosh kcic indonesia' },
  { id: 'id-bdg-tgl', name: 'Bandung Tegalluar HSR', city: 'Bandung', country: 'ID', code: 'TGL', lat: -6.9744, lon: 107.7214, tz: 'Asia/Jakarta', major: true, keywords: 'bandung tegalluar whoosh indonesia' },
  { id: 'my-kul-sen', name: 'KL Sentral', city: 'Kuala Lumpur', country: 'MY', code: 'KUL', lat: 3.1342, lon: 101.6861, tz: 'Asia/Kuala_Lumpur', major: true, keywords: 'kuala lumpur kl sentral ktm ets erl' },

  // ── America Latina ──
  { id: 'pe-cuz-por', name: 'Cusco Poroy / San Pedro', city: 'Cusco', country: 'PE', code: 'CUZ', lat: -13.5186, lon: -71.9844, tz: 'America/Lima', major: true, keywords: 'cusco cuzco perurail inca rail machu picchu' },
  { id: 'pe-mch-agu', name: 'Machu Picchu (Aguas Calientes)', city: 'Machu Picchu', country: 'PE', code: 'MCH', lat: -13.1547, lon: -72.5253, tz: 'America/Lima', major: true, keywords: 'machu picchu aguas calientes pueblo perurail inca rail' },
  { id: 'mx-cun-aer', name: 'Cancún Aeropuerto Tren Maya', city: 'Cancún', country: 'MX', code: 'CUN', lat: 21.0367, lon: -86.8772, tz: 'America/Cancun', major: true, keywords: 'cancun tren maya airport yucatan' },
  { id: 'mx-mid-tey', name: 'Mérida Teya Tren Maya', city: 'Mérida', country: 'MX', code: 'MID', lat: 20.9125, lon: -89.5489, tz: 'America/Merida', keywords: 'merida tren maya yucatan' },
];

let cache: TrainStation[] | null = null;

const buildIndex = (raw: typeof RAW_STATIONS): TrainStation[] =>
  raw.map((s) => {
    const fName = foldText(s.name);
    const fCity = foldText(s.city);
    const fCode = foldText(s.code);
    const fKeywords = foldText(s.keywords ?? '');
    return {
      id: s.id,
      name: s.name,
      city: s.city,
      country: s.country,
      code: s.code,
      lat: s.lat,
      lon: s.lon,
      tz: s.tz,
      major: Boolean(s.major),
      m: {
        name: fName,
        city: fCity,
        code: fCode,
        tokens: [
          ...new Set(`${fName} ${fCity} ${fCode} ${fKeywords}`.split(/[^a-z0-9]+/).filter(Boolean)),
        ],
      },
    };
  });

export const loadTrainStations = async (): Promise<TrainStation[]> => {
  if (cache) return cache;
  cache = buildIndex(RAW_STATIONS);
  return cache;
};

export const stationByNameOrCode = (all: TrainStation[], value: string | null | undefined): TrainStation | null => {
  if (!value) return null;
  const q = foldText(value.trim());
  if (!q) return null;
  return (
    all.find((s) => {
      if (s.m.name === q || s.m.code === q) return true;
      if (s.name.toLowerCase() === value.trim().toLowerCase()) return true;
      return false;
    }) ?? null
  );
};

export const nearestStations = (
  all: TrainStation[],
  origin: Coordinates,
  limit = NEAR_STATION_LIMIT,
  radiusKm = NEAR_STATION_RADIUS_KM
): StationWithDistance[] =>
  all
    .map((station) => ({ station, km: distanceKm(origin, station) }))
    .filter((x) => x.km <= radiusKm)
    .sort((a, b) => Number(b.station.major) - Number(a.station.major) || a.km - b.km)
    .slice(0, limit);

export const recommendedStationGroups = (
  all: TrainStation[],
  context: { homeCity: { city: string; coords: Coordinates | null } | null; destinations: Destination[] }
): StationGroup[] => {
  const groups: StationGroup[] = [];
  const seenStationIds = new Set<string>();

  if (context.homeCity?.coords) {
    const nearby = nearestStations(all, context.homeCity.coords).filter(
      (item) => !seenStationIds.has(item.station.id)
    );
    if (nearby.length > 0) {
      nearby.forEach((item) => seenStationIds.add(item.station.id));
      groups.push({ label: context.homeCity.city, items: nearby });
    }
  }

  for (const dest of context.destinations) {
    if (!dest.coords) continue;
    const nearby = nearestStations(all, dest.coords).filter(
      (item) => !seenStationIds.has(item.station.id)
    );
    if (nearby.length > 0) {
      nearby.forEach((item) => seenStationIds.add(item.station.id));
      groups.push({ label: dest.city, items: nearby });
    }
  }

  return groups;
};

const startsToken = (s: TrainStation, q: string): boolean =>
  s.m.tokens.some((token) => token.startsWith(q));

const hasToken = (s: TrainStation, q: string): boolean => s.m.tokens.includes(q);

const scoreStation = (s: TrainStation, q: string): number => {
  if (s.m.code === q) return 1000;
  if (s.m.name === q) return 900;
  if (s.m.city === q) return 800;
  if (s.m.code.startsWith(q)) return 700;
  if (s.m.name.startsWith(q)) return 600;
  if (s.m.city.startsWith(q)) return 500;
  if (startsToken(s, q)) return 350;
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => hasToken(s, w))) return 250;
  return 0;
};

export const searchTrainStations = (
  all: TrainStation[],
  query: string,
  limit = SEARCH_LIMIT
): TrainStation[] => {
  const q = foldText(query.trim());
  if (!q) {
    return all.filter((s) => s.major).slice(0, limit);
  }
  return all
    .map((station) => ({ station, s: scoreStation(station, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || Number(b.station.major) - Number(a.station.major) || a.station.name.localeCompare(b.station.name))
    .slice(0, limit)
    .map((x) => x.station);
};
