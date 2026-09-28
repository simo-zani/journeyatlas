import { foldText } from '@/lib/countries';
import { distanceKm } from '@/lib/airports';
import type { Coordinates, Destination } from '@/lib/types';

export interface FerryPort {
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

export interface PortWithDistance {
  port: FerryPort;
  km: number;
}

export interface PortGroup {
  label: string;
  items: PortWithDistance[];
}

export const NEAR_PORT_RADIUS_KM = 120;
export const NEAR_PORT_LIMIT = 4;
const SEARCH_LIMIT = 8;

const RAW_PORTS: Array<{
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
  // ── Italia: Hub Principali Traghetti e Crociere ──
  { id: 'it-goa-por', name: 'Genova Porto (Stazione Marittima)', city: 'Genova', country: 'IT', code: 'GOA', lat: 44.4147, lon: 8.9167, tz: 'Europe/Rome', major: true, keywords: 'genova moby gnv tirrenia traghetti sardegna sicilia' },
  { id: 'it-civ-por', name: 'Civitavecchia Porto', city: 'Civitavecchia', country: 'IT', code: 'CVV', lat: 42.0942, lon: 11.7878, tz: 'Europe/Rome', major: true, keywords: 'civitavecchia roma sardegna olbia crociere msc grimaldi' },
  { id: 'it-nap-por', name: 'Napoli Porto (Molo Beverello / Massa)', city: 'Napoli', country: 'IT', code: 'NAP', lat: 40.8386, lon: 14.2567, tz: 'Europe/Rome', major: true, keywords: 'napoli beverello capri ischia palermo gnv medmar caremar' },
  { id: 'it-liv-por', name: 'Livorno Porto', city: 'Livorno', country: 'IT', code: 'LIV', lat: 43.5558, lon: 10.3017, tz: 'Europe/Rome', major: true, keywords: 'livorno toscana olbia bastia moby corsica ferries' },
  { id: 'it-anc-por', name: 'Ancona Porto', city: 'Ancona', country: 'IT', code: 'AOI', lat: 43.6189, lon: 13.5042, tz: 'Europe/Rome', major: true, keywords: 'ancona adriatico grecia croazia igoumenitsa spalato snav' },
  { id: 'it-vce-por', name: 'Venezia Porto (Tronchetto / Marittima)', city: 'Venezia', country: 'IT', code: 'VCE', lat: 45.4389, lon: 12.3083, tz: 'Europe/Rome', major: true, keywords: 'venezia tronchetto grecia crociere' },
  { id: 'it-bri-por', name: 'Bari Porto', city: 'Bari', country: 'IT', code: 'BRI', lat: 41.1350, lon: 16.8667, tz: 'Europe/Rome', major: true, keywords: 'bari puglia albania durazzo grecia montenegro' },
  { id: 'it-bds-por', name: 'Brindisi Porto', city: 'Brindisi', country: 'IT', code: 'BDS', lat: 40.6483, lon: 17.9622, tz: 'Europe/Rome', major: true, keywords: 'brindisi grimaldi grecia albania corfu' },
  { id: 'it-sal-por', name: 'Salerno Porto (Molo Manfredi)', city: 'Salerno', country: 'IT', code: 'SAL', lat: 40.6739, lon: 14.7508, tz: 'Europe/Rome', major: true, keywords: 'salerno grimaldi tunisi catania costiera amalfitana' },
  { id: 'it-svo-por', name: 'Savona Porto (Palacrociere)', city: 'Savona', country: 'IT', code: 'SVN', lat: 44.3117, lon: 8.4908, tz: 'Europe/Rome', major: true, keywords: 'savona vado ligure corsica ferries costa crociere' },

  // ── Sardegna ──
  { id: 'it-olb-por', name: 'Olbia Porto (Isola Bianca)', city: 'Olbia', country: 'IT', code: 'OLB', lat: 40.9239, lon: 9.5192, tz: 'Europe/Rome', major: true, keywords: 'olbia sardegna isola bianca moby tirrenia gnv grimaldi' },
  { id: 'it-gar-por', name: 'Golfo Aranci Porto', city: 'Golfo Aranci', country: 'IT', code: 'GAR', lat: 40.9972, lon: 9.6192, tz: 'Europe/Rome', major: true, keywords: 'golfo aranci sardegna corsica ferries livorno' },
  { id: 'it-pto-por', name: 'Porto Torres', city: 'Porto Torres', country: 'IT', code: 'PTO', lat: 40.8394, lon: 8.4003, tz: 'Europe/Rome', major: true, keywords: 'porto torres sardegna genova barcellona grimaldi' },
  { id: 'it-cag-por', name: 'Cagliari Porto', city: 'Cagliari', country: 'IT', code: 'CAG', lat: 39.2133, lon: 9.1103, tz: 'Europe/Rome', major: true, keywords: 'cagliari sardegna civitavecchia napoli palermo' },
  { id: 'it-stg-por', name: 'Santa Teresa Gallura', city: 'Santa Teresa Gallura', country: 'IT', code: 'STG', lat: 41.2417, lon: 9.1869, tz: 'Europe/Rome', major: true, keywords: 'santa teresa bonifacio corsica moby' },
  { id: 'it-pal-por', name: 'Palau Porto', city: 'Palau', country: 'IT', code: 'PLU', lat: 41.1814, lon: 9.3853, tz: 'Europe/Rome', keywords: 'palau la maddalena sardegna traghetto' },
  { id: 'it-mad-por', name: 'La Maddalena (Cala Gavetta)', city: 'La Maddalena', country: 'IT', code: 'MAD', lat: 41.2139, lon: 9.4056, tz: 'Europe/Rome', keywords: 'la maddalena cala gavetta delcomar enas' },
  { id: 'it-car-por', name: 'Carloforte (Isola di San Pietro)', city: 'Carloforte', country: 'IT', code: 'CRF', lat: 39.1436, lon: 8.3097, tz: 'Europe/Rome', keywords: 'carloforte san pietro delcomar portovesme calasetta' },
  { id: 'it-pvs-por', name: 'Portovesme', city: 'Portovesme', country: 'IT', code: 'PVS', lat: 39.2017, lon: 8.3986, tz: 'Europe/Rome', keywords: 'portovesme sulcis carloforte' },

  // ── Sicilia & Isole Minori ──
  { id: 'it-pmo-por', name: 'Palermo Porto', city: 'Palermo', country: 'IT', code: 'PMO', lat: 38.1281, lon: 13.3644, tz: 'Europe/Rome', major: true, keywords: 'palermo sicilia gnv tirrenia grimaldi genova napoli' },
  { id: 'it-cta-por', name: 'Catania Porto', city: 'Catania', country: 'IT', code: 'CTA', lat: 37.4981, lon: 15.0931, tz: 'Europe/Rome', major: true, keywords: 'catania sicilia salerno grimaldi malta tttlines' },
  { id: 'it-msn-por', name: 'Messina Porto (Rada San Francesco / Bluvia)', city: 'Messina', country: 'IT', code: 'MSN', lat: 38.1964, lon: 15.5636, tz: 'Europe/Rome', major: true, keywords: 'messina stretto caronte tourist bluvia fs' },
  { id: 'it-vsg-por', name: 'Villa San Giovanni Porto', city: 'Villa San Giovanni', country: 'IT', code: 'VSG', lat: 38.2197, lon: 15.6308, tz: 'Europe/Rome', major: true, keywords: 'villa san giovanni calabria caronte tourist stretto' },
  { id: 'it-tps-por', name: 'Trapani Porto', city: 'Trapani', country: 'IT', code: 'TPS', lat: 38.0133, lon: 12.5056, tz: 'Europe/Rome', major: true, keywords: 'trapani egadi favignana levanzo marettimo pantelleria siremar liberty lines' },
  { id: 'it-mlz-por', name: 'Milazzo Porto', city: 'Milazzo', country: 'IT', code: 'MLZ', lat: 38.2194, lon: 15.2436, tz: 'Europe/Rome', major: true, keywords: 'milazzo eolie aliscafi lipari vulcano stromboli' },
  { id: 'it-lip-por', name: 'Lipari Porto (Sottomonastero)', city: 'Lipari', country: 'IT', code: 'LIP', lat: 38.4686, lon: 14.9572, tz: 'Europe/Rome', keywords: 'lipari eolie sottomonastero siremar' },
  { id: 'it-pzl-por', name: 'Pozzallo Porto', city: 'Pozzallo', country: 'IT', code: 'PZL', lat: 36.7194, lon: 14.8389, tz: 'Europe/Rome', major: true, keywords: 'pozzallo malta virtu ferries catamarano' },
  { id: 'it-lpm-por', name: 'Lampedusa Porto', city: 'Lampedusa', country: 'IT', code: 'LMP', lat: 35.5008, lon: 12.6075, tz: 'Europe/Rome', keywords: 'lampedusa pelagie traghetto siremar' },
  { id: 'it-pnl-por', name: 'Pantelleria Porto', city: 'Pantelleria', country: 'IT', code: 'PNL', lat: 36.8317, lon: 11.9422, tz: 'Europe/Rome', keywords: 'pantelleria traghetto trapani siremar' },

  // ── Golfo di Napoli & Tirreno ──
  { id: 'it-sor-por', name: 'Sorrento (Marina Piccola)', city: 'Sorrento', country: 'IT', code: 'RRO', lat: 40.6300, lon: 14.3761, tz: 'Europe/Rome', keywords: 'sorrento marina piccola aliscafi capri napoli' },
  { id: 'it-cap-por', name: 'Capri (Marina Grande)', city: 'Capri', country: 'IT', code: 'CPR', lat: 40.5567, lon: 14.2408, tz: 'Europe/Rome', major: true, keywords: 'capri marina grande caremar snav aliscafi' },
  { id: 'it-isc-por', name: 'Ischia Porto', city: 'Ischia', country: 'IT', code: 'ISC', lat: 40.7444, lon: 13.9431, tz: 'Europe/Rome', major: true, keywords: 'ischia porto medmar caremar aliscafi casamicciola' },
  { id: 'it-pro-por', name: 'Procida (Marina Grande)', city: 'Procida', country: 'IT', code: 'PRC', lat: 40.7656, lon: 14.0278, tz: 'Europe/Rome', keywords: 'procida marina grande caremar' },
  { id: 'it-bio-por', name: 'Piombino Porto', city: 'Piombino', country: 'IT', code: 'PIO', lat: 42.9286, lon: 10.5486, tz: 'Europe/Rome', major: true, keywords: 'piombino elba toremar moby corsica ferries blu navy' },
  { id: 'it-pfe-por', name: 'Portoferraio (Isola d\'Elba)', city: 'Portoferraio', country: 'IT', code: 'PFE', lat: 42.8131, lon: 10.3275, tz: 'Europe/Rome', major: true, keywords: 'portoferraio elba toremar moby traghetto' },
  { id: 'it-for-por', name: 'Formia Porto', city: 'Formia', country: 'IT', code: 'FRM', lat: 41.2547, lon: 13.6103, tz: 'Europe/Rome', keywords: 'formia ponza ventotene lazio mare' },
  { id: 'it-pnz-por', name: 'Ponza Porto', city: 'Ponza', country: 'IT', code: 'PNZ', lat: 40.8986, lon: 12.9644, tz: 'Europe/Rome', keywords: 'ponza litorale lazio traghetto' },
  { id: 'it-ter-por', name: 'Termoli Porto', city: 'Termoli', country: 'IT', code: 'TML', lat: 42.0039, lon: 14.9989, tz: 'Europe/Rome', keywords: 'termoli tremiti molise traghetto' },
  { id: 'it-trm-por', name: 'Isole Tremiti (San Domino)', city: 'Isole Tremiti', country: 'IT', code: 'TRM', lat: 42.1150, lon: 15.4889, tz: 'Europe/Rome', keywords: 'tremiti san domino traghetto' },

  // ── Europa: Francia & Corsica ──
  { id: 'fr-mrs-por', name: 'Marseille Port (Grand Port)', city: 'Marsiglia', country: 'FR', code: 'MRS', lat: 43.3167, lon: 5.3500, tz: 'Europe/Paris', major: true, keywords: 'marseille corsica linea corsica ferries algeria tunisia' },
  { id: 'fr-nce-por', name: 'Nice Port Lympia', city: 'Nizza', country: 'FR', code: 'NCE', lat: 43.6953, lon: 7.2847, tz: 'Europe/Paris', major: true, keywords: 'nice nizza corsica ferries costa azzurra' },
  { id: 'fr-tln-por', name: 'Toulon Port', city: 'Tolone', country: 'FR', code: 'TLN', lat: 43.1189, lon: 5.9317, tz: 'Europe/Paris', major: true, keywords: 'toulon tolone corsica ferries maiorca' },
  { id: 'fr-bia-por', name: 'Bastia Port', city: 'Bastia', country: 'FR', code: 'BIA', lat: 42.7039, lon: 9.4539, tz: 'Europe/Paris', major: true, keywords: 'bastia corsica livorno genova moby corsica ferries' },
  { id: 'fr-aja-por', name: 'Ajaccio Port', city: 'Ajaccio', country: 'FR', code: 'AJA', lat: 41.9214, lon: 8.7422, tz: 'Europe/Paris', major: true, keywords: 'ajaccio corsica tolone marsiglia' },
  { id: 'fr-bnf-por', name: 'Bonifacio Port', city: 'Bonifacio', country: 'FR', code: 'BON', lat: 41.3886, lon: 9.1558, tz: 'Europe/Paris', major: true, keywords: 'bonifacio bocche corsica santa teresa moby' },
  { id: 'fr-cal-por', name: 'Calais Port', city: 'Calais', country: 'FR', code: 'CQF', lat: 50.9667, lon: 1.8667, tz: 'Europe/Paris', major: true, keywords: 'calais dover po ferries dfds manica ferry' },
  { id: 'fr-dkk-por', name: 'Dunkerque Port', city: 'Dunkerque', country: 'FR', code: 'DKK', lat: 51.0500, lon: 2.3667, tz: 'Europe/Paris', keywords: 'dunkerque dover dfds' },

  // ── Spagna & Baleari & Canarie ──
  { id: 'es-bcn-por', name: 'Barcelona Port (Moll Adossat)', city: 'Barcellona', country: 'ES', code: 'BCN', lat: 41.3650, lon: 2.1750, tz: 'Europe/Madrid', major: true, keywords: 'barcelona balearia trasmed grimaldi maiorca ibiza roma' },
  { id: 'es-vlc-por', name: 'Valencia Port', city: 'Valencia', country: 'ES', code: 'VLC', lat: 39.4539, lon: -0.3236, tz: 'Europe/Madrid', major: true, keywords: 'valencia balearia trasmed ibiza palma' },
  { id: 'es-pmi-por', name: 'Palma de Mallorca Port', city: 'Palma di Maiorca', country: 'ES', code: 'PMI', lat: 39.5583, lon: 2.6319, tz: 'Europe/Madrid', major: true, keywords: 'palma maiorca baleari balearia trasmed' },
  { id: 'es-ibz-por', name: 'Ibiza Port (Marina Botafoch)', city: 'Ibiza', country: 'ES', code: 'IBZ', lat: 38.9139, lon: 1.4428, tz: 'Europe/Madrid', major: true, keywords: 'ibiza formentera balearia trasmed' },
  { id: 'es-fmt-por', name: 'Formentera (La Savina)', city: 'Formentera', country: 'ES', code: 'FMT', lat: 38.7333, lon: 1.4181, tz: 'Europe/Madrid', major: true, keywords: 'formentera la savina balearia trasmapi' },
  { id: 'es-alg-por', name: 'Algeciras Port', city: 'Algeciras', country: 'ES', code: 'ALG', lat: 36.1333, lon: -5.4333, tz: 'Europe/Madrid', major: true, keywords: 'algeciras stretto gibilterra ceuta tangeri med' },
  { id: 'es-trf-por', name: 'Tarifa Port', city: 'Tarifa', country: 'ES', code: 'TRF', lat: 36.0083, lon: -5.6033, tz: 'Europe/Madrid', major: true, keywords: 'tarifa tangeri aliscafi marocco fhrs' },
  { id: 'es-tci-por', name: 'Santa Cruz de Tenerife Port', city: 'Santa Cruz de Tenerife', country: 'ES', code: 'TCI', lat: 28.4736, lon: -16.2417, tz: 'Atlantic/Canary', major: true, keywords: 'tenerife fred olsen naviera armas canarie' },
  { id: 'es-lpa-por', name: 'Las Palmas (Puerto de la Luz)', city: 'Las Palmas de Gran Canaria', country: 'ES', code: 'LPA', lat: 28.1408, lon: -15.4217, tz: 'Atlantic/Canary', major: true, keywords: 'las palmas gran canaria fred olsen armas' },

  // ── Grecia & Isole Greche ──
  { id: 'gr-pir-por', name: 'Pireo (Atene / Piraeus)', city: 'Atene', country: 'GR', code: 'PIR', lat: 37.9431, lon: 23.6372, tz: 'Europe/Athens', major: true, keywords: 'pireo piraeus atene cyclades blue star hellenic seaways' },
  { id: 'gr-raf-por', name: 'Rafina Port', city: 'Rafina', country: 'GR', code: 'RAF', lat: 38.0217, lon: 24.0089, tz: 'Europe/Athens', keywords: 'rafina atene andros tinos mykonos seajets' },
  { id: 'gr-pat-por', name: 'Patrasso Porto', city: 'Patrasso', country: 'GR', code: 'GPA', lat: 38.2433, lon: 21.7289, tz: 'Europe/Athens', major: true, keywords: 'patrasso patras ancona bari grimaldi anek minoan' },
  { id: 'gr-igo-por', name: 'Igoumenitsa Porto', city: 'Igoumenitsa', country: 'GR', code: 'IGO', lat: 39.4939, lon: 20.2589, tz: 'Europe/Athens', major: true, keywords: 'igoumenitsa ancona bari brindisi corfu' },
  { id: 'gr-her-por', name: 'Heraklion Port (Creta)', city: 'Candia', country: 'GR', code: 'HER', lat: 35.3439, lon: 25.1489, tz: 'Europe/Athens', major: true, keywords: 'heraklion creta minoan blue star pireo santorini' },
  { id: 'gr-cfu-por', name: 'Corfù Porto (Kérkyra)', city: 'Corfù', country: 'GR', code: 'CFU', lat: 39.6278, lon: 19.9056, tz: 'Europe/Athens', major: true, keywords: 'corfu kerkyra igoumenitsa bari brindisi' },
  { id: 'gr-jmk-por', name: 'Mykonos Port (Tourlos)', city: 'Mykonos', country: 'GR', code: 'JMK', lat: 37.4636, lon: 25.3250, tz: 'Europe/Athens', major: true, keywords: 'mykonos tourlos cicladi blue star seajets' },
  { id: 'gr-jtr-por', name: 'Santorini Port (Athinios)', city: 'Santorini', country: 'GR', code: 'JTR', lat: 36.3861, lon: 25.4308, tz: 'Europe/Athens', major: true, keywords: 'santorini athinios thira cicladi blue star' },
  { id: 'gr-rho-por', name: 'Rodi Porto (Mandraki / Commercial)', city: 'Rodi', country: 'GR', code: 'RHO', lat: 36.4447, lon: 28.2306, tz: 'Europe/Athens', major: true, keywords: 'rodi dodecaneso blue star marmaris turchia' },

  // ── Croazia ──
  { id: 'hr-spu-por', name: 'Spalato Porto (Split)', city: 'Spalato', country: 'HR', code: 'SPU', lat: 43.5042, lon: 16.4417, tz: 'Europe/Zagreb', major: true, keywords: 'split spalato jadrolinija ancona hvar brac korcula' },
  { id: 'hr-dbv-por', name: 'Dubrovnik Port (Gruž)', city: 'Ragusa', country: 'HR', code: 'DBV', lat: 42.6606, lon: 18.0864, tz: 'Europe/Zagreb', major: true, keywords: 'dubrovnik gruz jadrolinija bari traghetto' },
  { id: 'hr-hvr-por', name: 'Hvar Port', city: 'Lesina', country: 'HR', code: 'HVR', lat: 43.1722, lon: 16.4419, tz: 'Europe/Zagreb', keywords: 'hvar lesina catamarano krilo jadrolinija' },
  { id: 'hr-zad-por', name: 'Zara Porto (Zadar Gaženica)', city: 'Zara', country: 'HR', code: 'ZAD', lat: 44.0917, lon: 15.2639, tz: 'Europe/Zagreb', keywords: 'zadar gazenica ancona jadrolinija' },

  // ── UK & Irlanda ──
  { id: 'gb-dov-por', name: 'Dover Port', city: 'Dover', country: 'GB', code: 'DOV', lat: 51.1278, lon: 1.3289, tz: 'Europe/London', major: true, keywords: 'dover calais po ferries dfds manica' },
  { id: 'gb-pme-por', name: 'Portsmouth International Port', city: 'Portsmouth', country: 'GB', code: 'PME', lat: 50.8117, lon: -1.0917, tz: 'Europe/London', major: true, keywords: 'portsmouth brittany ferries isola di wight normandia spagna' },
  { id: 'gb-sou-por', name: 'Southampton Cruise Port', city: 'Southampton', country: 'GB', code: 'SOU', lat: 50.8986, lon: -1.4039, tz: 'Europe/London', major: true, keywords: 'southampton crociere cunard transatlantico' },
  { id: 'gb-hhd-por', name: 'Holyhead Port', city: 'Holyhead', country: 'GB', code: 'HHD', lat: 53.3083, lon: -4.6292, tz: 'Europe/London', major: true, keywords: 'holyhead galles dublino stena line irish ferries' },
  { id: 'ie-dub-por', name: 'Dublin Port', city: 'Dublino', country: 'IE', code: 'DUB', lat: 53.3486, lon: -6.2081, tz: 'Europe/Dublin', major: true, keywords: 'dublin dublino holyhead liverpool irish ferries stena' },
  { id: 'gb-bfs-por', name: 'Belfast Port', city: 'Belfast', country: 'GB', code: 'BFS', lat: 54.6139, lon: -5.9083, tz: 'Europe/London', major: true, keywords: 'belfast scozia cairnryan stena line' },

  // ── Scandinavia & Baltico ──
  { id: 'se-sto-por', name: 'Stockholm Port (Värtahamnen / Stadsgården)', city: 'Stoccolma', country: 'SE', code: 'STO', lat: 59.3517, lon: 18.1139, tz: 'Europe/Stockholm', major: true, keywords: 'stockholm stoccolma tallink silja viking line helsinki tallinn' },
  { id: 'fi-hel-por', name: 'Helsinki Port (South Harbour / West Terminal)', city: 'Helsinki', country: 'FI', code: 'HEL', lat: 60.1583, lon: 24.9567, tz: 'Europe/Helsinki', major: true, keywords: 'helsinki tallink silja viking line tallinn stoccolma' },
  { id: 'ee-tll-por', name: 'Tallinn Port (Old City Harbour)', city: 'Tallinn', country: 'EE', code: 'TLL', lat: 59.4444, lon: 24.7667, tz: 'Europe/Tallinn', major: true, keywords: 'tallinn vanasadam helsinki tallink eckeroline' },
  { id: 'no-osl-por', name: 'Oslo Port (Vippetangen / Hjortnes)', city: 'Oslo', country: 'NO', code: 'OSL', lat: 59.9056, lon: 10.7417, tz: 'Europe/Oslo', major: true, keywords: 'oslo color line dfds copenaghen kiel' },
  { id: 'no-bgo-por', name: 'Bergen Port (Hurtigruten Terminal)', city: 'Bergen', country: 'NO', code: 'BGO', lat: 60.3900, lon: 5.3167, tz: 'Europe/Oslo', major: true, keywords: 'bergen hurtigruten fiordi fjord line danimarca' },
  { id: 'dk-cph-por', name: 'Copenhagen Port (DFDS Terminal)', city: 'Copenaghen', country: 'DK', code: 'CPH', lat: 55.7056, lon: 12.6000, tz: 'Europe/Copenhagen', major: true, keywords: 'copenhagen copenaghen oslo dfds' },

  // ── Nord Africa & Medio Oriente ──
  { id: 'ma-tme-por', name: 'Tanger Med Port', city: 'Tangeri', country: 'MA', code: 'TME', lat: 35.8889, lon: -5.5000, tz: 'Africa/Casablanca', major: true, keywords: 'tanger med marocco algeciras balearia gnv genova barcellona' },
  { id: 'ma-tng-por', name: 'Tanger-Ville Port', city: 'Tangeri', country: 'MA', code: 'TNG', lat: 35.7889, lon: -5.8083, tz: 'Africa/Casablanca', major: true, keywords: 'tangeri tarifa frs aliscafi' },
  { id: 'tn-tun-por', name: 'Tunisi (La Goulette)', city: 'Tunisi', country: 'TN', code: 'TUN', lat: 36.8167, lon: 10.3000, tz: 'Africa/Tunis', major: true, keywords: 'tunisi la goulette gnv grimaldi palermo civitavecchia genova' },

  // ── Americhe (USA, Canada, America Latina) ──
  { id: 'us-nyc-bat', name: 'New York (Battery Maritime / Pier 11)', city: 'New York', country: 'US', code: 'NYC', lat: 40.7011, lon: -74.0125, tz: 'America/New_York', major: true, keywords: 'new york nyc ferry staten island statua liberta manhattan' },
  { id: 'us-sea-col', name: 'Seattle (Colman Dock / Pier 52)', city: 'Seattle', country: 'US', code: 'SEA', lat: 47.6025, lon: -122.3389, tz: 'America/Los_Angeles', major: true, keywords: 'seattle washington state ferries bainbridge island' },
  { id: 'us-sfo-frb', name: 'San Francisco Ferry Building', city: 'San Francisco', country: 'US', code: 'SFO', lat: 37.7956, lon: -122.3936, tz: 'America/Los_Angeles', major: true, keywords: 'san francisco ferry building golden gate sausalito oakland' },
  { id: 'ca-van-tsa', name: 'Vancouver (Tsawwassen Ferry Terminal)', city: 'Vancouver', country: 'CA', code: 'YVR', lat: 49.0069, lon: -123.1294, tz: 'America/Vancouver', major: true, keywords: 'vancouver tsawwassen bc ferries victoria swartz bay' },
  { id: 'ca-vic-swz', name: 'Victoria (Swartz Bay Terminal)', city: 'Victoria', country: 'CA', code: 'YYJ', lat: 48.6886, lon: -123.4111, tz: 'America/Vancouver', major: true, keywords: 'victoria vancouver island bc ferries' },
  { id: 'ar-bue-bue', name: 'Buenos Aires (Puerto Madero - Buquebus)', city: 'Buenos Aires', country: 'AR', code: 'BUE', lat: -34.5975, lon: -58.3667, tz: 'America/Argentina/Buenos_Aires', major: true, keywords: 'buenos aires buquebus colonia del sacramento montevideo uruguay' },
  { id: 'uy-col-por', name: 'Colonia del Sacramento Port', city: 'Colonia del Sacramento', country: 'UY', code: 'COL', lat: -34.4739, lon: -57.8508, tz: 'America/Montevideo', major: true, keywords: 'colonia del sacramento buquebus colonia express buenos aires' },

  // ── Asia & Oceania ──
  { id: 'hk-hkg-mft', name: 'Hong Kong (Macau Ferry Terminal / Central)', city: 'Hong Kong', country: 'HK', code: 'HKG', lat: 22.2883, lon: 114.1522, tz: 'Asia/Hong_Kong', major: true, keywords: 'hong kong macau ferry turbojet star ferry tsim sha tsui' },
  { id: 'mo-mac-tpa', name: 'Macao (Taipa Ferry Terminal)', city: 'Macao', country: 'MO', code: 'MFM', lat: 22.1611, lon: 113.5778, tz: 'Asia/Macau', major: true, keywords: 'macao taipa cotai water jet turbojet hong kong' },
  { id: 'sg-sin-hbf', name: 'Singapore (HarbourFront / Tanah Merah)', city: 'Singapore', country: 'SG', code: 'SIN', lat: 1.2642, lon: 103.8206, tz: 'Asia/Singapore', major: true, keywords: 'singapore harbourfront batam bintan indonesia ferry' },
  { id: 'th-sam-nat', name: 'Koh Samui (Nathon Pier)', city: 'Koh Samui', country: 'TH', code: 'USM', lat: 9.5350, lon: 99.9333, tz: 'Asia/Bangkok', major: true, keywords: 'koh samui nathon lomprayah seatran donsak koh phangan' },
  { id: 'id-bal-pad', name: 'Bali (Padang Bai / Sanur)', city: 'Bali', country: 'ID', code: 'DPS', lat: -8.5333, lon: 115.5089, tz: 'Asia/Makassar', major: true, keywords: 'bali padang bai sanur gili islands lombok fast boat' },
  { id: 'au-syd-crq', name: 'Sydney (Circular Quay / Manly Wharf)', city: 'Sydney', country: 'AU', code: 'SYD', lat: -33.8614, lon: 151.2108, tz: 'Australia/Sydney', major: true, keywords: 'sydney circular quay manly ferry taronga australia' },
  { id: 'nz-wlg-por', name: 'Wellington Ferry Terminal', city: 'Wellington', country: 'NZ', code: 'WLG', lat: -41.2639, lon: 174.7869, tz: 'Pacific/Auckland', major: true, keywords: 'wellington interislander bluebridge cook strait picton' },
  { id: 'nz-pic-por', name: 'Picton Ferry Terminal', city: 'Picton', country: 'NZ', code: 'PCN', lat: -41.2889, lon: 174.0042, tz: 'Pacific/Auckland', major: true, keywords: 'picton interislander south island cook strait' },
];

let cache: FerryPort[] | null = null;

const buildIndex = (raw: typeof RAW_PORTS): FerryPort[] =>
  raw.map((p) => {
    const fName = foldText(p.name);
    const fCity = foldText(p.city);
    const fCode = foldText(p.code);
    const fKeywords = foldText(p.keywords ?? '');
    return {
      id: p.id,
      name: p.name,
      city: p.city,
      country: p.country,
      code: p.code,
      lat: p.lat,
      lon: p.lon,
      tz: p.tz,
      major: Boolean(p.major),
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

export const loadFerryPorts = async (): Promise<FerryPort[]> => {
  if (cache) return cache;
  cache = buildIndex(RAW_PORTS);
  return cache;
};

export const portByNameOrCode = (all: FerryPort[], value: string | null | undefined): FerryPort | null => {
  if (!value) return null;
  const q = foldText(value.trim());
  if (!q) return null;
  return (
    all.find((p) => {
      if (p.m.name === q || p.m.code === q) return true;
      if (p.name.toLowerCase() === value.trim().toLowerCase()) return true;
      return false;
    }) ?? null
  );
};

export const nearestPorts = (
  all: FerryPort[],
  origin: Coordinates,
  limit = NEAR_PORT_LIMIT,
  radiusKm = NEAR_PORT_RADIUS_KM
): PortWithDistance[] =>
  all
    .map((port) => ({ port, km: distanceKm(origin, port) }))
    .filter((x) => x.km <= radiusKm)
    .sort((a, b) => Number(b.port.major) - Number(a.port.major) || a.km - b.km)
    .slice(0, limit);

export const recommendedPortGroups = (
  all: FerryPort[],
  context: { homeCity: { city: string; coords: Coordinates | null } | null; destinations: Destination[] }
): PortGroup[] => {
  const groups: PortGroup[] = [];
  const seenPortIds = new Set<string>();

  if (context.homeCity?.coords) {
    const nearby = nearestPorts(all, context.homeCity.coords).filter(
      (item) => !seenPortIds.has(item.port.id)
    );
    if (nearby.length > 0) {
      nearby.forEach((item) => seenPortIds.add(item.port.id));
      groups.push({ label: context.homeCity.city, items: nearby });
    }
  }

  for (const dest of context.destinations) {
    if (!dest.coords) continue;
    const nearby = nearestPorts(all, dest.coords).filter(
      (item) => !seenPortIds.has(item.port.id)
    );
    if (nearby.length > 0) {
      nearby.forEach((item) => seenPortIds.add(item.port.id));
      groups.push({ label: dest.city, items: nearby });
    }
  }

  return groups;
};

const startsToken = (p: FerryPort, q: string): boolean =>
  p.m.tokens.some((token) => token.startsWith(q));

const hasToken = (p: FerryPort, q: string): boolean => p.m.tokens.includes(q);

const scorePort = (p: FerryPort, q: string): number => {
  if (p.m.code === q) return 1000;
  if (p.m.name === q) return 900;
  if (p.m.city === q) return 800;
  if (p.m.code.startsWith(q)) return 700;
  if (p.m.name.startsWith(q)) return 600;
  if (p.m.city.startsWith(q)) return 500;
  if (startsToken(p, q)) return 350;
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.every((w) => hasToken(p, w))) return 250;
  return 0;
};

export const searchFerryPorts = (
  all: FerryPort[],
  query: string,
  limit = SEARCH_LIMIT
): FerryPort[] => {
  const q = foldText(query.trim());
  if (!q) {
    return all.filter((p) => p.major).slice(0, limit);
  }
  return all
    .map((port) => ({ port, s: scorePort(port, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || Number(b.port.major) - Number(a.port.major) || a.port.name.localeCompare(b.port.name))
    .slice(0, limit)
    .map((x) => x.port);
};
