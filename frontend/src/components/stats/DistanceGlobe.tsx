import React, { useMemo } from 'react';
import { geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from 'd3-geo';
import type { GeoFeature } from '@/lib/atlasGeo';
import type { Coordinates } from '@/lib/types';

const SIZE = 280;
const SPHERE = { type: 'Sphere' } as const;
const GRATICULE = geoGraticule10();

interface DistanceGlobeProps {
  features: GeoFeature[];
  from: Coordinates;
  to: Coordinates;
  /** Paesi visitati: colorati come nell'atlante. */
  visited: Set<string>;
  className?: string;
}

/**
 * Globo statico con l'arco casa → meta: centrato a metà strada, così l'arco
 * (un'ortodromia, la rotta più breve) si vede tutto anche agli antipodi.
 */
export const DistanceGlobe: React.FC<DistanceGlobeProps> = ({ features, from, to, visited, className = '' }) => {
  const { land, graticule, sphere, arc, a, b } = useMemo(() => {
    const mid = geoInterpolate([from.lon, from.lat], [to.lon, to.lat])(0.5);
    const projection = geoOrthographic()
      .scale(SIZE / 2 - 2)
      .translate([SIZE / 2, SIZE / 2])
      .rotate([-mid[0], -mid[1], 0])
      .clipAngle(90);
    const path = geoPath(projection);
    return {
      land: features.map((f, i) => ({ key: `${f.code ?? 'x'}-${i}`, d: path(f) ?? '', visited: !!f.code && visited.has(f.code) })),
      graticule: path(GRATICULE) ?? '',
      sphere: path(SPHERE) ?? '',
      arc: path({ type: 'LineString', coordinates: [[from.lon, from.lat], [to.lon, to.lat]] }) ?? '',
      a: projection([from.lon, from.lat]),
      b: projection([to.lon, to.lat]),
    };
  }, [features, from, to, visited]);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} role="img" aria-hidden="true">
      <path d={sphere} fill="var(--atlas-ocean, var(--surface-0))" stroke="var(--border-subtle)" />
      <path d={graticule} fill="none" stroke="var(--border-subtle)" strokeWidth={0.5} />
      {land.map((l) =>
        l.d ? (
          <path
            key={l.key}
            d={l.d}
            fill={l.visited ? 'var(--atlas-visited)' : 'var(--atlas-land)'}
            stroke="var(--atlas-border)"
            strokeWidth={0.4}
          />
        ) : null
      )}
      <path d={arc} fill="none" stroke="var(--surface-1)" strokeWidth={5} strokeLinecap="round" />
      <path d={arc} fill="none" stroke="var(--atlas-home)" strokeWidth={2} strokeLinecap="round" strokeDasharray="5 4" />
      {a && <circle cx={a[0]} cy={a[1]} r={5} fill="var(--atlas-home)" stroke="var(--surface-1)" strokeWidth={2} />}
      {b && <circle cx={b[0]} cy={b[1]} r={5} fill="var(--atlas-selected-stroke)" stroke="var(--surface-1)" strokeWidth={2} />}
    </svg>
  );
};
