import React from 'react';

/**
 * Disegno semplificato della presa (vista frontale) per ogni tipo, dalla A alla O:
 * forma e disposizione dei fori/spinotti. Sono schematici, pensati per riconoscere a colpo
 * d'occhio la presa, non per essere un riferimento tecnico.
 */
const PIN = 'var(--plug-pin, #E8CC6D)';

const round = (cx: number, cy: number, r = 3.4, key?: string) => <circle key={key ?? `${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={PIN} />;
const blade = (x: number, y: number, w: number, h: number, rotate?: number, key?: string) => (
  <rect
    key={key ?? `${x}-${y}`}
    x={x}
    y={y}
    width={w}
    height={h}
    rx={1}
    fill={PIN}
    transform={rotate ? `rotate(${rotate} ${x + w / 2} ${y + h / 2})` : undefined}
  />
);

const SHAPES: Record<string, React.ReactNode> = {
  // due lamelle piatte parallele
  A: [blade(21, 20, 5, 20, 0, 'a1'), blade(38, 20, 5, 20, 0, 'a2')],
  // A + terra tonda
  B: [blade(21, 16, 5, 18, 0, 'b1'), blade(38, 16, 5, 18, 0, 'b2'), round(32, 45, 3.6, 'b3')],
  // due spinotti tondi (Europlug)
  C: [round(23, 32, 3.4, 'c1'), round(41, 32, 3.4, 'c2')],
  // tre spinotti tondi a triangolo
  D: [round(32, 18, 4.2, 'd1'), round(20, 42, 4.2, 'd2'), round(44, 42, 4.2, 'd3')],
  // due spinotti tondi + terra (spinotto della presa in alto)
  E: [round(23, 36, 3.4, 'e1'), round(41, 36, 3.4, 'e2'), round(32, 16, 2.8, 'e3')],
  // due spinotti tondi + clip di terra sui lati (Schuko)
  F: [round(23, 32, 3.4, 'f1'), round(41, 32, 3.4, 'f2'), blade(28, 13, 8, 3, 0, 'f3'), blade(28, 48, 8, 3, 0, 'f4')],
  // tre lamelle rettangolari (UK)
  G: [blade(29, 14, 6, 14, 0, 'g1'), blade(15, 38, 14, 6, 0, 'g2'), blade(35, 38, 14, 6, 0, 'g3')],
  // tre lamelle a Y (Israele)
  H: [blade(30, 12, 4, 16, 0, 'h1'), blade(18, 34, 4, 16, 30, 'h2'), blade(42, 34, 4, 16, -30, 'h3')],
  // lamelle piatte a V + terra
  I: [blade(18, 18, 4, 15, -28, 'i1'), blade(42, 18, 4, 15, 28, 'i2'), blade(30, 36, 4, 14, 0, 'i3')],
  // tre spinotti tondi (Svizzera)
  J: [round(22, 24, 3, 'j1'), round(42, 24, 3, 'j2'), round(32, 42, 3, 'j3')],
  // due spinotti tondi + terra (Danimarca)
  K: [round(22, 38, 3.2, 'k1'), round(42, 38, 3.2, 'k2'), round(32, 17, 3.2, 'k3')],
  // tre spinotti tondi in linea (Italia)
  L: [round(17, 32, 3.2, 'l1'), round(32, 32, 3.2, 'l2'), round(47, 32, 3.2, 'l3')],
  // tre spinotti tondi grandi
  M: [round(32, 17, 5, 'm1'), round(19, 43, 5, 'm2'), round(45, 43, 5, 'm3')],
  // tre spinotti tondi (Brasile)
  N: [round(22, 25, 3.4, 'n1'), round(42, 25, 3.4, 'n2'), round(32, 43, 3.4, 'n3')],
  // tre spinotti (Thailandia): due lamelle + terra tonda
  O: [blade(20, 18, 4, 16, 0, 'o1'), blade(40, 18, 4, 16, 0, 'o2'), round(32, 44, 3.2, 'o3')],
};

export const PlugTypeIcon: React.FC<{ type: string; className?: string }> = ({ type, className }) => (
  <svg viewBox="0 0 64 64" className={className} role="img" aria-label={`Type ${type}`}>
    <circle cx="32" cy="32" r="30" fill="#003366" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
    <circle cx="32" cy="32" r="25" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    {SHAPES[type] ?? <text x="32" y="40" textAnchor="middle" fontSize="24" fontWeight="700" fill={PIN}>{type}</text>}
  </svg>
);
