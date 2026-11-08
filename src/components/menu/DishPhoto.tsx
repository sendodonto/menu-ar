'use client';
import { useState } from 'react';
import { useAssetUrl } from '@/hooks/useAssetUrl';

export function DishPhoto({ src, alt, className = '', priority = false, sizes }: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string }) {
  const url = useAssetUrl(src);
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-glaze-2 ${loaded ? '' : 'skeleton'} ${className}`}>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          ref={(img) => { if (img?.complete && img.naturalWidth) setLoaded(true); }}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
