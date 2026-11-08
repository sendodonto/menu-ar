'use client';
import { useEffect, useState } from 'react';

let loading: Promise<unknown> | null = null;

/** Loads the <model-viewer> custom element once, on the client only. */
export function useModelViewer() {
  const [ready, setReady] = useState(() => typeof customElements !== 'undefined' && !!customElements.get('model-viewer'));
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (ready) return;
    loading ??= import('@google/model-viewer');
    loading.then(() => setReady(true)).catch(() => setFailed(true));
  }, [ready]);
  return { ready, failed };
}
