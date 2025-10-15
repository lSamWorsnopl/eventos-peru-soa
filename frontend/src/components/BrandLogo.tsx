import { useState } from 'react';

export default function BrandLogo({ className = 'h-8 w-8' }: { className?: string }) {
  const [src, setSrc] = useState('/brand/eventos-peru-logo.png');
  if (!src) return null;
  return (
    <img
      src={src}
      onError={() => setSrc(src.endsWith('.png') ? '/brand/eventos-peru-logo.svg' : '')}
      alt="Eventos Perú"
      className={className + ' object-contain'}
    />
  );
}

