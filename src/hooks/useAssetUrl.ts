'use client';
import { useEffect, useState } from 'react';
import { asset } from '@/lib/asset';
import { BLOB_PREFIX, resolveBlobUrl } from '@/services/blob-store';

/** Turns stored references (site paths, https URLs or demo-mode idb: files) into a loadable URL. */
export function useAssetUrl(src: string | undefined | null) {
  const [url, setUrl] = useState<string | null>(() => (src && !src.startsWith(BLOB_PREFIX) ? asset(src) : null));
  useEffect(() => {
    if (!src) return setUrl(null);
    if (!src.startsWith(BLOB_PREFIX)) return setUrl(asset(src));
    let alive = true;
    resolveBlobUrl(src).then((u) => alive && setUrl(u)).catch(() => alive && setUrl(null));
    return () => { alive = false; };
  }, [src]);
  return url;
}
