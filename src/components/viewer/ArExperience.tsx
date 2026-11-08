'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, CameraOff, Eye, EyeOff, Hand, Plus, ScanLine, Smartphone, TriangleAlert } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/store/cart';
import { toast } from '@/store/toast';
import type { Dish } from '@/types/menu';
import type { ModelViewerElement } from '@/types/model-viewer';
import { ModelKind, RealSize } from './ModelBadge';
import { ModelStage } from './ModelStage';

type Phase = 'loading' | 'ready' | 'unsupported' | 'denied' | 'session' | 'failed';

/** Real AR through model-viewer: WebXR on Android Chrome, Scene Viewer as Android fallback, Quick Look on iOS. */
export function ArExperience({ dish }: { dish: Dish & { model: NonNullable<Dish['model']> } }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const mv = useRef<ModelViewerElement | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [placed, setPlaced] = useState(false);
  const [tracking, setTracking] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [qr, setQr] = useState('');
  const leaving = useRef(false);

  const onLoad = useCallback((el: ModelViewerElement) => {
    setPhase((p) => (p === 'loading' ? (el.canActivateAR ? 'ready' : 'unsupported') : p));
  }, []);

  useEffect(() => {
    const el = mv.current;
    if (!el) return;
    const onStatus = (e: Event) => {
      const status = (e as CustomEvent<{ status: string }>).detail.status;
      if (status === 'session-started') { setPhase('session'); setPlaced(false); }
      if (status === 'object-placed') setPlaced(true);
      if (status === 'failed') setPhase('failed');
      if (status === 'not-presenting') {
        setPhase((p) => (p === 'session' ? 'ready' : p));
        setHidden(false);
        if (leaving.current) router.push('/');
      }
    };
    const onTracking = (e: Event) => setTracking((e as CustomEvent<{ status: string }>).detail.status === 'tracking');
    el.addEventListener('ar-status', onStatus);
    el.addEventListener('ar-tracking', onTracking);
    return () => {
      el.removeEventListener('ar-status', onStatus);
      el.removeEventListener('ar-tracking', onTracking);
    };
  });

  useEffect(() => {
    if (phase !== 'unsupported' || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;
    QRCode.toString(window.location.href, { type: 'svg', margin: 0, color: { dark: '#2A2420', light: '#FDFCFA' } }).then(setQr).catch(() => setQr(''));
  }, [phase]);

  const launch = async () => {
    try {
      const perm = await navigator.permissions?.query({ name: 'camera' as PermissionName });
      if (perm?.state === 'denied') return setPhase('denied');
    } catch {
      // Permissions API not available for camera (older Safari): the AR viewer will ask on its own.
    }
    try {
      await mv.current?.activateAR();
    } catch {
      setPhase('failed');
    }
  };

  const toggleHidden = () => setHidden((h) => !h);
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const overlayBtn = 'press pointer-events-auto inline-flex h-12 items-center gap-2 rounded-tile px-4 text-[15px] font-medium shadow-lift';

  return (
    <div className="fixed inset-0 flex flex-col bg-glaze">
      <header className="z-10 flex items-center gap-3 border-b border-grout bg-glaze px-3 pb-2 pt-[max(env(safe-area-inset-top),10px)]">
        <Link href="/" className="press grid size-11 place-items-center rounded-tile hover:bg-glaze-2" aria-label="Voltar ao cardápio">
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[22px] leading-tight">{dish.name}</h1>
          <p className="flex items-center gap-2 text-[13px]">
            <span className="tnum font-medium text-clay-ink">{formatPrice(dish.price)}</span>
            <ModelKind model={dish.model} />
          </p>
        </div>
      </header>

      <ModelStage
        ref={mv}
        src={dish.model.src}
        alt={`Modelo 3D de ${dish.name} em tamanho real`}
        ar
        autoRotate={phase !== 'session'}
        onLoad={onLoad}
        className="min-h-0 flex-1 bg-glaze-2"
      >
        <span slot="ar-button" hidden />
        <div slot="ar-prompt" className="pointer-events-none rounded-tile bg-ink/85 px-4 py-3 text-center text-[15px] text-glaze">
          Mova o celular devagar sobre a mesa até o prato aparecer
        </div>
        {phase === 'session' && (
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-4 pt-[max(env(safe-area-inset-top),16px)]">
            <p className="rounded-tile bg-ink/85 px-3.5 py-2 text-[14px] text-glaze" aria-live="polite">
              {!tracking ? 'Procurando a superfície… aponte para a mesa com boa luz' : hidden ? 'Prato removido. Toque em “Recolocar” para vê-lo de novo.' : placed ? 'Toque na mesa para mudar o prato de lugar. Aproxime-se para ver os detalhes.' : 'Toque na mesa para posicionar o prato'}
            </p>
          </div>
        )}
        {phase === 'session' && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-2 p-4 pb-[max(env(safe-area-inset-bottom),20px)]">
            <button type="button" onClick={toggleHidden} className={`${overlayBtn} bg-tile text-ink`}>
              {hidden ? <Eye size={18} /> : <EyeOff size={18} />}
              {hidden ? 'Recolocar prato' : 'Remover prato'}
            </button>
          </div>
        )}
        <button
          slot="exit-webxr-ar-button"
          type="button"
          onClick={() => { leaving.current = true; }}
          className={`${overlayBtn} absolute left-4 top-[max(env(safe-area-inset-top),16px)] mt-12 bg-ink text-glaze`}
        >
          <ArrowLeft size={18} /> Voltar ao cardápio
        </button>
      </ModelStage>

      {/* The scale attribute hides the dish in AR without unloading it (removal stays reversible). */}
      <ScaleSync el={mv} hidden={hidden} />

      <section className="z-10 border-t border-grout bg-glaze px-4 pt-4 pb-[max(env(safe-area-inset-bottom),16px)] shadow-[var(--shadow-sheet)]" aria-live="polite">
        <div className="mx-auto max-w-xl">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <RealSize model={dish.model} />
            <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-2"><Hand size={14} aria-hidden /> Gire e aproxime com os dedos</span>
          </div>

          {phase === 'loading' && <p className="py-2 text-[15px] text-ink-2">Preparando o modelo em tamanho real…</p>}

          {(phase === 'ready' || phase === 'session') && (
            <>
              <ol className="mb-4 grid gap-1.5 text-[14px] text-ink-2">
                <li className="flex gap-2"><span className="tnum font-semibold text-clay-ink">1</span> Permita o acesso à câmera quando o navegador pedir.</li>
                <li className="flex gap-2"><span className="tnum font-semibold text-clay-ink">2</span> Aponte para a mesa e mova o celular devagar.</li>
                <li className="flex gap-2"><span className="tnum font-semibold text-clay-ink">3</span> Toque na superfície para colocar o prato no tamanho real.</li>
              </ol>
              <Button size="lg" className="w-full" icon={<ScanLine size={18} />} onClick={launch}>Abrir câmera e posicionar</Button>
            </>
          )}

          {phase === 'denied' && (
            <Notice icon={<CameraOff size={18} />} title="A câmera está bloqueada para este site">
              Libere a câmera nas configurações do navegador (ícone de cadeado ao lado do endereço) e toque em “Tentar de novo”.
              <Button size="md" className="mt-3 w-full" icon={<Camera size={18} />} onClick={() => { setPhase('ready'); launch(); }}>Tentar de novo</Button>
            </Notice>
          )}

          {phase === 'failed' && (
            <Notice icon={<TriangleAlert size={18} />} title="Não foi possível abrir a realidade aumentada">
              Verifique se a câmera foi permitida e se o aparelho tem o Google Play Services para RA (Android) ou o iOS 12 ou mais recente. O modelo 3D continua disponível acima.
              <Button size="md" variant="secondary" className="mt-3 w-full" onClick={() => setPhase('ready')}>Tentar de novo</Button>
            </Notice>
          )}

          {phase === 'unsupported' && (
            <Notice icon={<Smartphone size={18} />} title={isMobile ? 'Este aparelho não abre realidade aumentada pelo navegador' : 'Abra no celular para ver na sua mesa'}>
              {isMobile
                ? 'A realidade aumentada precisa de Android com ARCore (Chrome) ou iPhone/iPad com Safari. Você ainda pode girar e aproximar o prato em 3D aqui.'
                : 'A realidade aumentada usa a câmera do celular. Aponte a câmera do seu celular para o código abaixo. Aqui você pode ver o prato em 3D.'}
              {qr && (
                <div className="mt-3 flex items-center gap-4">
                  <div className="size-28 shrink-0 rounded-tile border border-grout bg-tile p-2" aria-label="QR code para abrir esta página no celular" role="img" dangerouslySetInnerHTML={{ __html: qr }} />
                  <span className="text-[13px] text-ink-3">O código abre esta mesma página no celular.</span>
                </div>
              )}
            </Notice>
          )}

          <Button variant="secondary" size="md" className="mt-3 w-full" icon={<Plus size={18} />} onClick={() => { add(dish.id); toast(`${dish.name} adicionado ao pedido`); }}>
            Adicionar ao pedido · {formatPrice(dish.price)}
          </Button>
        </div>
      </section>
    </div>
  );
}

function ScaleSync({ el, hidden }: { el: React.RefObject<ModelViewerElement | null>; hidden: boolean }) {
  useEffect(() => {
    el.current?.setAttribute('scale', hidden ? '0.0001 0.0001 0.0001' : '1 1 1');
  }, [el, hidden]);
  return null;
}

function Notice({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-tile border border-grout bg-tile p-4">
      <p className="flex items-center gap-2 font-medium text-ink"><span className="text-clay">{icon}</span>{title}</p>
      <div className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}
