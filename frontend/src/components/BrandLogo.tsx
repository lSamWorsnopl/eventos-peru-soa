import { useState } from 'react';

type Props = {
  className?: string;
  src?: string;
  alt?: string;
  fallbackSvg?: string;
};

export default function BrandLogo({ className = 'h-8 w-8', src: initialSrc, alt = 'Eventos Peru', fallbackSvg }: Props) {
  const defaultPng = '/brand/eventos-peru-logo.png';
  const defaultSvg = fallbackSvg || '/brand/eventos-peru-logo.svg';
  const [src, setSrc] = useState(initialSrc || defaultPng);
  if (!src) return null;
  return (
    <img
      src={src}
      onError={() => setSrc(src.endsWith('.png') ? defaultSvg : '')}
      alt={alt}
      className={className + ' object-contain'}
    />
  );
}

