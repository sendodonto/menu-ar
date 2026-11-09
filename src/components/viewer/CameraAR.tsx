'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Crosshair, Eye, EyeOff, Hand, Plus, Smartphone, TriangleAlert, X } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
import { ModelStage } from './ModelStage';
import { useAssetUrl } from '@/hooks/useAssetUrl';
import { asset } from '@/lib/asset';
import { formatDimensions, formatPrice } from '@/lib/format';
import { useCart } from '@/store/cart';
import { toast } from '@/store/toast';
import type { Dish, DishModel } from '@/types/menu';

type Session = { stop: () => void; setDishVisible: (v: boolean) => void; place: () => boolean };
type Phase = 'intro' | 'starting' | 'running' | 'error';

const glass = 'glass bg-black/45 text-white backdrop-blur-xl backdrop-saturate-150';

/**
 * "Na minha mesa" without any AR app or Google service. Primary: 8th Wall world tracking (dish stays fixed while the
 * guest walks around). Fallback when the engine can't run on the device: camera + gyroscope (rotation only).
 */
export function CameraAR({ dish }: { dish: Dish & { model: DishModel } }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const url = useAssetUrl(dish.model.src);
  const box = useRef<HTMLDivElement>(null);
  const xrCanvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'world' | 'gyro'>('world');
  const [tracking, setTracking] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const session = useRef<Session | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [sensor, setSensor] = useState<boolean | null>(null);
  const [hint, setHint] = useState('');
  const [dragged, setDragged] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [qr, setQr] = useState('');

  const stop = () => {
    session.current?.stop();
    session.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  useEffect(() => stop, []);

  useEffect(() => {
    const touch = navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);
    setDesktop(!touch);
    if (!touch) QRCode.toString(window.location.href, { type: 'svg', margin: 0, color: { dark: '#1c1a17', light: '#ffffff' } }).then(setQr).catch(() => setQr(''));
  }, []);

  const fail = (message: string) => { stop(); setError(message); setPhase('error'); };

  // Fallback view: camera + gyroscope (rotation only).
  const startGyro = async () => {
    if (!url || !box.current || !video.current) return;
    try {
      const [{ openCamera }, gyro] = await Promise.all([import('@/lib/ar/stage'), import('@/lib/ar/gyro')]);
      stream.current = await openCamera(video.current);
      session.current = await gyro.startGyroAR(box.current, video.current, url, {
        onSensor: setSensor,
        onPlaced: (ok) => { if (ok) { setPlaced(true); setHint(''); } else setHint('Aponte o celular um pouco mais para baixo, para a mesa.'); },
        onDragged: () => setDragged(true),
      });
      setPhase('running');
    } catch (e) {
      fail(e instanceof Error ? e.message : 'Não foi possível abrir a câmera.');
    }
  };
  const toGyro = () => { stop(); setMode('gyro'); setPlaced(false); startGyro(); };

  const start = async () => {
    if (!url || !box.current || !video.current || !xrCanvas.current) return;
    // iOS only grants motion sensors from inside the tap, before any await.
    const perms = [window.DeviceMotionEvent, window.DeviceOrientationEvent].map((E) => (E as unknown as { requestPermission?: () => Promise<string> })?.requestPermission?.());
    setPhase('starting');
    setError('');
    if ((await Promise.all(perms.map((p) => p?.catch(() => 'denied')))).includes('denied')) return fail('Permita o acesso ao movimento do aparelho para ver o prato na mesa.');
    if (mode === 'gyro') return startGyro();
    try {
      const world = await import('@/lib/ar/world');
      session.current = await world.startWorldAR(xrCanvas.current, url, {
        onTracking: setTracking,
        onPlaced: () => { setPlaced(true); setHint(''); },
        onDragged: () => setDragged(true),
        onError: fail,
        onUnsupported: toGyro,
      });
      setPhase('running');
    } catch {
      toGyro(); // engine missing or device not supported
    }
  };

  const close = () => { stop(); router.back(); };
  const toggle = () => { session.current?.setDishVisible(hidden); setHidden(!hidden); };
  const recenter = () => { setHidden(false); session.current?.place(); };

  const status = hint
    || (mode === 'world' && !tracking ? 'Mova o celular devagar mostrando a mesa'
      : mode === 'world' && placed && !hidden && !dragged ? 'Ande em volta: o prato fica no lugar. Arraste para mover.'
      : sensor === false ? 'Este aparelho não informou o giroscópio: o prato não vai acompanhar o movimento.'
      : !placed ? 'Aponte a câmera para a mesa'
        : hidden ? 'Prato removido'
          : dragged ? '' : 'Arraste o prato com o dedo para mudar de lugar');
  const size = dish.model.dimensions ? formatDimensions(dish.model.dimensions) : null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1c1a17]">
      <div ref={box} className="absolute inset-0">
        <video ref={video} className="absolute max-w-none" muted playsInline aria-hidden />
      </div>
      <canvas ref={xrCanvas} className={`absolute inset-0 size-full ${mode === 'world' && phase === 'running' ? '' : 'invisible'}`} aria-hidden />

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),12px)]">
        <div className={`${glass} min-w-0 rounded-2xl px-4 py-2.5 ${desktop ? 'invisible' : ''}`}>
          <p className="truncate text-[15px] font-semibold leading-tight">{dish.name}</p>
          <p className="text-[13px] text-white/75">{formatPrice(dish.price)}{size ? ` · ${size}` : ''}</p>
        </div>
        <button type="button" onClick={close} className={`${desktop ? 'bg-black/[0.06] text-ink hover:bg-black/10' : glass} press grid size-11 shrink-0 place-items-center rounded-full`} aria-label="Fechar e voltar">
          <X size={20} />
        </button>
      </div>

      {phase === 'running' && (
        <>
          {!placed && <Crosshair size={40} strokeWidth={1.5} className="pointer-events-none absolute left-1/2 top-[47.5%] z-10 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" aria-hidden />}
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-4 pb-[max(env(safe-area-inset-bottom),20px)]">
            {status && <p className={`${glass} rounded-full px-4 py-2 text-center text-[14px]`} aria-live="polite">{status}</p>}
            <div className="flex w-full max-w-sm items-center gap-2">
              <button type="button" onClick={recenter} className={`${glass} press flex h-14 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-medium`} aria-label="Trazer o prato para onde o celular aponta">
                <Crosshair size={19} /> Trazer
              </button>
              <button type="button" onClick={toggle} disabled={!placed} className={`${glass} press flex h-14 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-medium disabled:opacity-40`}>
                {hidden ? <Eye size={19} /> : <EyeOff size={19} />} {hidden ? 'Mostrar' : 'Ocultar'}
              </button>
              <button
                type="button"
                onClick={() => { add(dish.id); toast(`${dish.name} adicionado ao pedido`); }}
                className="press flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-[15px] font-semibold text-ink"
              >
                <Plus size={18} /> Adicionar · {formatPrice(dish.price)}
              </button>
            </div>
            {mode === 'world' && (
              <p className="text-center text-[10px] leading-snug text-white/70">
                AR por 8th Wall Engine, criado pela Niantic Spatial, Inc. © Niantic Spatial. Uso sob o{' '}
                <a href={asset('/xr/LICENSE.txt')} target="_blank" rel="noreferrer" className="underline">XR Engine License Agreement</a>, sem garantias.
              </p>
            )}
          </div>
        </>
      )}

      {desktop && (
        <div className="absolute inset-0 grid place-items-center bg-glaze px-6 pt-20 pb-10">
          <div className="grid w-full max-w-4xl items-center gap-8 md:grid-cols-[1.2fr_1fr]">
            <ModelStage src={dish.model.src} alt={`Modelo 3D de ${dish.name}`} className="aspect-square w-full rounded-[28px] bg-tile shadow-[var(--shadow-card)]" />
            <div>
              <p className="text-[15px] text-ink-2">{dish.name} · <span className="tnum">{formatPrice(dish.price)}</span>{size ? ` · ${size}` : ''}</p>
              <h1 className="mt-2 font-serif text-[34px] leading-tight text-ink">Veja na sua mesa pelo celular</h1>
              <p className="mt-3 text-[16px] leading-relaxed text-ink-2">A câmera do celular coloca o item sobre a sua mesa, em tamanho real. Aponte a câmera do seu celular para o código.</p>
              {qr && <div className="mt-6 size-40 rounded-2xl bg-white p-3 shadow-[var(--shadow-card)]" role="img" aria-label="QR code para abrir esta página no celular" dangerouslySetInnerHTML={{ __html: qr }} />}
              <p className="mt-4 text-[14px] text-ink-3">Aqui você pode girar e aproximar o prato em 3D.</p>
            </div>
          </div>
        </div>
      )}

      {phase !== 'running' && !desktop && (
        <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-[28px] bg-glaze px-5 pt-6 pb-[max(env(safe-area-inset-bottom),20px)] text-ink shadow-[var(--shadow-sheet)]">
          <div className="mx-auto max-w-md">
            {phase === 'error' ? (
              <>
                <p className="flex items-center gap-2 text-[17px] font-semibold"><TriangleAlert size={20} className="text-danger" /> Não deu para abrir a câmera</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{error}</p>
                <Button size="lg" className="mt-5 w-full" icon={<Camera size={18} />} onClick={start}>Tentar de novo</Button>
              </>
            ) : (
              <>
                <h1 className="font-serif text-[30px] leading-tight">Veja na sua mesa</h1>
                <ul className="mt-4 grid gap-3 text-[15px] text-ink-2">
                  <li className="flex gap-3"><Smartphone size={20} className="mt-0.5 shrink-0 text-ink-2" /> Sentado, segure o celular uns 40 cm acima da mesa e aponte para ela.</li>
                  <li className="flex gap-3"><Crosshair size={20} className="mt-0.5 shrink-0 text-ink-2" /> Mova o celular devagar até o prato aparecer, em tamanho real aproximado.</li>
                  <li className="flex gap-3"><Hand size={20} className="mt-0.5 shrink-0 text-ink-2" /> Ande em volta e chegue perto: o prato fica no lugar. Arraste para mover.</li>
                </ul>
                <Button size="lg" className="mt-6 w-full" icon={<Camera size={18} />} onClick={start} disabled={!url || phase === 'starting'}>
                  {phase === 'starting' ? 'Abrindo câmera…' : 'Abrir câmera'}
                </Button>
                <p className="mt-3 text-center text-[13px] text-ink-3">Funciona no navegador, sem instalar nada.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
