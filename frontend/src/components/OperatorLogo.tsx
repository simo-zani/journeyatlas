import React, { useEffect, useState } from 'react';
import { operatorDomain } from '@/lib/bookingOperators';

/** Logo di un operatore: quello caricato a mano, altrimenti il favicon se è tra i noti. Niente se non c'è. */
export const OperatorLogo: React.FC<{
  name: string | null | undefined;
  logo?: string | null;
  className?: string;
}> = ({ name, logo, className = 'w-5 h-5' }) => {
  const domain = operatorDomain(name);
  const src = logo || (domain ? `https://www.google.com/s2/favicons?sz=64&domain=${domain}` : null);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt={name ?? ''}
      title={name ?? undefined}
      loading="lazy"
      className={`${className} shrink-0 object-contain rounded-sm`}
      onError={() => setFailed(true)}
    />
  );
};
