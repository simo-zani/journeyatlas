import { flagUrl } from '@/lib/flags';

/**
 * Le PNG di restcountries sono 320x213, cioè 3:2 (1.502).
 *
 * Ogni <img> con una bandiera va reso con questo componente: i formati usati
 * in precedenza erano incoerenti (20x14, 24x24, 28x20, 40x28) e forcing di
 * `object-cover` su un'immagine 3:2 ritaglia via i bordi, che per una
 * bandiera è proprio l'informazione che serve.
 *
 * `object-contain` con dimensioni sull'elemento: mai distorto, mai ritagliato,
 * e nessun salto di layout durante il lazy load. `rounded-full` ritaglia
 * l'immagine a pillola: border-radius applica a un elemento sostituito, quindi
 * non serve un wrapper con overflow-hidden.
 */
const SIZES = {
  sm: { box: 'w-6 h-4', w: 24, h: 16 },
  md: { box: 'w-7 h-5', w: 28, h: 20 },
  lg: { box: 'w-10 h-7', w: 40, h: 28 },
} as const;

export type CountryFlagSize = keyof typeof SIZES;

interface CountryFlagProps {
  code: string;
  size?: CountryFlagSize;
  /** Etichetta accessibile: se assente l'immagine resta decorativa. */
  label?: string;
  className?: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code,
  size = 'md',
  label,
  className = '',
}) => {
  const { box, w, h } = SIZES[size];
  return (
    <img
      src={flagUrl(code)}
      alt={label ?? ''}
      aria-hidden={label ? undefined : true}
      width={w}
      height={h}
      className={`${box} rounded-full shrink-0 object-contain ${className}`}
      loading="lazy"
    />
  );
};
