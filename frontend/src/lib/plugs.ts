export interface PlugInfo {
  types: string[];
  voltage: number;
  frequency: number;
}

const p = (types: string, voltage: number, frequency: number): PlugInfo => ({
  types: types.split(''),
  voltage,
  frequency,
});

/** Dati indicativi per paese (ISO alpha-2): tipo di presa, tensione e frequenza. */
export const PLUGS: Record<string, PlugInfo> = {
  IT: p('FL', 230, 50), FR: p('CE', 230, 50), DE: p('CF', 230, 50), ES: p('CF', 230, 50), PT: p('CF', 230, 50),
  GR: p('CF', 230, 50), AT: p('CF', 230, 50), NL: p('CF', 230, 50), BE: p('CE', 230, 50), CH: p('CJ', 230, 50),
  GB: p('G', 230, 50), IE: p('G', 230, 50), DK: p('CEFK', 230, 50), SE: p('CF', 230, 50), NO: p('CF', 230, 50),
  FI: p('CF', 230, 50), IS: p('CF', 230, 50), PL: p('CE', 230, 50), CZ: p('CE', 230, 50), HU: p('CF', 230, 50),
  HR: p('CF', 230, 50), RO: p('CF', 230, 50), BG: p('CF', 230, 50), TR: p('CF', 230, 50), MT: p('G', 230, 50),
  CY: p('G', 230, 50), RU: p('CF', 230, 50), UA: p('CF', 230, 50),
  US: p('AB', 120, 60), CA: p('AB', 120, 60), MX: p('AB', 127, 60), BR: p('CN', 220, 60), AR: p('CI', 220, 50),
  CL: p('CL', 220, 50), PE: p('ABC', 220, 60), CO: p('AB', 110, 60), CU: p('ABCL', 110, 60), DO: p('AB', 120, 60),
  JP: p('AB', 100, 50), CN: p('ACI', 220, 50), KR: p('CF', 220, 60), TH: p('ABCO', 220, 50), VN: p('ACD', 220, 50),
  ID: p('CF', 230, 50), MY: p('G', 240, 50), SG: p('G', 230, 50), PH: p('ABC', 220, 60), IN: p('CDM', 230, 50),
  LK: p('DGM', 230, 50), NP: p('CDM', 230, 50), AE: p('G', 230, 50), QA: p('G', 240, 50), IL: p('CH', 230, 50),
  JO: p('BCDFGJ', 230, 50), SA: p('G', 230, 60), KH: p('ACG', 230, 50), LA: p('ABCEF', 230, 50), MV: p('DGJKL', 230, 50),
  TW: p('AB', 110, 60), HK: p('G', 220, 50), UZ: p('CI', 220, 50),
  EG: p('C', 220, 50), MA: p('CE', 220, 50), TN: p('CE', 230, 50), ZA: p('CMN', 230, 50), KE: p('G', 240, 50),
  TZ: p('DG', 230, 50), SN: p('CDEK', 230, 50), AU: p('I', 230, 50), NZ: p('I', 230, 50),
};

export const PLUG_DESCRIPTIONS: Record<string, { it: string; en: string }> = {
  A: { it: 'Due spinotti piatti paralleli', en: 'Two flat parallel pins' },
  B: { it: 'Due spinotti piatti + terra tonda', en: 'Two flat pins + round earth pin' },
  C: { it: 'Due spinotti tondi (Europlug)', en: 'Two round pins (Europlug)' },
  D: { it: 'Tre spinotti tondi a triangolo', en: 'Three round pins in a triangle' },
  E: { it: 'Due spinotti tondi + foro per la terra', en: 'Two round pins + earth hole' },
  F: { it: 'Due spinotti tondi + clip di terra (Schuko)', en: 'Two round pins + earth clips (Schuko)' },
  G: { it: 'Tre spinotti rettangolari (UK)', en: 'Three rectangular pins (UK)' },
  H: { it: 'Tre spinotti (Israele)', en: 'Three pins (Israel)' },
  I: { it: 'Spinotti piatti a V + terra', en: 'Angled flat pins + earth' },
  J: { it: 'Tre spinotti tondi (Svizzera)', en: 'Three round pins (Switzerland)' },
  K: { it: 'Due spinotti tondi + terra (Danimarca)', en: 'Two round pins + earth (Denmark)' },
  L: { it: 'Tre spinotti tondi in linea (Italia)', en: 'Three round pins in line (Italy)' },
  M: { it: 'Tre spinotti tondi grandi', en: 'Three large round pins' },
  N: { it: 'Tre spinotti tondi (Brasile)', en: 'Three round pins (Brazil)' },
  O: { it: 'Tre spinotti (Thailandia)', en: 'Three pins (Thailand)' },
};
