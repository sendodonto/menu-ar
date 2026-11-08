'use client';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { useAssetUrl } from '@/hooks/useAssetUrl';
import { useModelViewer } from '@/hooks/useModelViewer';
import type { ModelViewerElement } from '@/types/model-viewer';

type Props = {
  src: string;
  alt: string;
  ar?: boolean;
  autoRotate?: boolean;
  className?: string;
  children?: ReactNode;
  onLoad?: (el: ModelViewerElement) => void;
};

/** <model-viewer> with a real progress readout and an error state. Children are passed as model-viewer slots. */
export const ModelStage = forwardRef<ModelViewerElement | null, Props>(function ModelStage(
  { src, alt, ar = false, autoRotate = true, className = '', children, onLoad },
  ref,
) {
  const url = useAssetUrl(src);
  const { ready, failed } = useModelViewer();
  const el = useRef<ModelViewerElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading');
  useImperativeHandle(ref, () => el.current as ModelViewerElement, [ready, url]);

  useEffect(() => {
    const mv = el.current;
    if (!mv) return;
    setState('loading');
    setProgress(0);
    const onProgress = (e: Event) => setProgress((e as CustomEvent<{ totalProgress: number }>).detail.totalProgress);
    const onLoaded = () => { setState('loaded'); onLoad?.(mv); };
    const onError = () => setState('error');
    mv.addEventListener('progress', onProgress);
    mv.addEventListener('load', onLoaded);
    mv.addEventListener('error', onError);
    return () => {
      mv.removeEventListener('progress', onProgress);
      mv.removeEventListener('load', onLoaded);
      mv.removeEventListener('error', onError);
    };
  }, [ready, url, onLoad]);

  const pct = Math.round(progress * 100);
  return (
    <div className={`relative ${className}`}>
      {ready && url && (
        <model-viewer
          ref={el as never}
          src={url}
          alt={alt}
          ar={ar || undefined}
          ar-modes="webxr quick-look"
          ar-scale="fixed"
          ar-placement="floor"
          camera-controls
          touch-action="pan-y"
          auto-rotate={autoRotate || undefined}
          auto-rotate-delay="2500"
          rotation-per-second="18deg"
          interaction-prompt="none"
          shadow-intensity="1"
          shadow-softness="0.9"
          environment-image="neutral"
          exposure="1.05"
          tone-mapping="aces"
          camera-orbit="0deg 62deg auto"
          min-camera-orbit="auto 10deg auto"
          max-camera-orbit="auto 88deg auto"
          className="block size-full"
        >
          {children}
        </model-viewer>
      )}

      {state !== 'loaded' && !(failed || state === 'error') && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Carregando modelo 3D">
          <div className="flex w-44 flex-col items-center gap-3">
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-grout">
              <div className="h-full bg-clay transition-[width] duration-200 ease-out" style={{ width: `${Math.max(4, pct)}%` }} />
            </div>
            <span className="tnum text-sm text-ink-2">Carregando modelo 3D · {pct}%</span>
          </div>
        </div>
      )}

      {(failed || state === 'error') && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div className="flex max-w-xs flex-col items-center gap-2">
            <CircleAlert className="text-danger" size={22} aria-hidden />
            <p className="font-medium">Não foi possível carregar o modelo 3D.</p>
            <p className="text-sm text-ink-2">Verifique a conexão e tente de novo. Se o problema continuar, o arquivo GLB pode estar corrompido.</p>
          </div>
        </div>
      )}
    </div>
  );
});
