'use client';
import { useEffect, useRef } from 'react';
import { Hand, ScanLine, X } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { formatPrice } from '@/lib/format';
import { arHref } from './links';
import { ModelKind, RealSize } from './ModelBadge';
import { ModelStage } from './ModelStage';
import { useViewer } from './viewer-store';

export function Viewer3DDialog() {
  const { dish, close } = useViewer();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (dish && !d.open) d.showModal();
    if (!dish && d.open) d.close();
  }, [dish]);

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => e.target === e.currentTarget && close()}
      aria-labelledby="viewer-title"
      className="sheet m-0 mt-auto h-[100dvh] max-h-none w-full max-w-none bg-transparent p-0 backdrop:backdrop-blur-[2px] sm:m-auto sm:h-[min(860px,92dvh)] sm:w-[min(1080px,94vw)]"
    >
      {dish?.model && (
        <div className="flex h-full flex-col bg-glaze sm:rounded-tile sm:shadow-lift">
          <header className="flex items-start justify-between gap-4 border-b border-grout px-4 pb-3 pt-[max(env(safe-area-inset-top),14px)] sm:px-6">
            <div>
              <h2 id="viewer-title" className="text-[26px] leading-tight">{dish.name}</h2>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="tnum text-[15px] font-medium text-clay-ink">{formatPrice(dish.price)}</span>
                <ModelKind model={dish.model} />
              </p>
            </div>
            <button type="button" onClick={close} className="press -mr-1 grid size-11 shrink-0 place-items-center rounded-tile hover:bg-glaze-2" aria-label="Fechar visualização 3D">
              <X size={22} />
            </button>
          </header>

          <ModelStage key={dish.id} src={dish.model.src} alt={`Modelo 3D de ${dish.name}`} className="min-h-0 flex-1 bg-glaze-2" />

          <footer className="flex flex-col gap-3 border-t border-grout px-4 pt-3 pb-[max(env(safe-area-inset-bottom),14px)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <RealSize model={dish.model} />
              <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-2">
                <Hand size={14} aria-hidden /> Arraste para girar · pinça para aproximar · dois dedos para mover
              </span>
            </div>
            <ButtonLink href={arHref(dish.id)} onClick={close} size="lg" icon={<ScanLine size={18} />} className="w-full sm:w-auto">
              Ver na minha mesa
            </ButtonLink>
          </footer>
        </div>
      )}
    </dialog>
  );
}
