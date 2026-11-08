'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Crosshair, Eye, EyeOff, Hand, Plus, Smartphone, TriangleAlert, X } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
import { ModelStage } from './ModelStage';
import { useAssetUrl } from '@/hooks/useAssetUrl';
import { formatDimensions, formatPrice } from '@/lib/format';
import { useCart } from '@/store/cart';
import { toast } from '@/store/toast';
import type { Dish, DishModel } from '@/types/menu';

type Session = { stop: () => void; setDishVisible: (v: boolean) => void; place: () => boolean };
type Phase = 'intro' | 'starting' | 'running' | 'error';

const glass = 'glass bg-black/45 text-white backdrop-blur-xl backdrop-saturate-150';

/** "Na minha mesa": camera + gyroscope, no AR app or Google service needed. */
export function CameraAR({ dish }: { dish: Dish & { model: DishModel } }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const url = useAssetUrl(dish.model.src);
  const box = useRef<HTMLDivElement>(null);
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

  const start = async () => {
    if (!url || !box.current || !video.current) return;
    setPhase('starting');
    setError('');
    try {
      const [{ openCamera }, gyro] = await Promise.all([import('@/lib/ar/stage'), import('@/lib/ar/gyro')]);
      await gyro.requestMotionPermission();
      stream.current = await openCamera(video.current);
      session.current = await gyro.startGyroAR(box.current, video.current, url, {
        onSensor: setSensor,
        onPlaced: (ok) => { if (ok) { setPlaced(true); setHint(''); } else setHint('Aponte o celular um pouco mais para baixo, para a mesa.'); },
        onDragged: () => setDragged(true),
      });
      setPhase('running');
    } catch (e) {
      stop();
      setError(e instanceof Error ? e.message : 'Não foi possível abrir a câmera.');
      setPhase('error');
    }
  };

  const close = () => { stop(); router.back(); };
  const toggle = () => { session.current?.setDishVisible(hidden); setHidden(!hidden); };
  const recenter = () => { setHidden(false); session.current?.place(); };

  const status = hint
    || (sensor === false ? 'Este aparelho não informou o giroscópio: o prato não vai acompanhar o movimento.'
      : !placed ? 'Aponte a câmera para a mesa'
        : hidden ? 'Prato removido'
          : dragged ? '' : 'Arraste o prato com o dedo para mudar de lugar');
  const size = dish.model.dimensions ? formatDimensions(dish.model.dimensions) : null;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1c1a17]">
      <div ref={box} className="absolute inset-0">
        <video ref={video} className="absolute max-w-none" muted playsInline aria-hidden />
      </div>

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),12px)]">
        <div className={`${glass} min-w-0 rounded-2xl px-4 py-2.5`}>
          <p className="truncate text-[15px] font-semibold leading-tight">{dish.name}</p>
          <p className="text-[13px] text-white/75">{formatPrice(dish.price)}{size ? ` · ${size}` : ''}</p>
        </div>
        <button type="button" onClick={close} className={`${glass} press grid size-11 shrink-0 place-items-center rounded-full`} aria-label="Fechar e voltar">
          <X size={20} />
        </button>
      </div>

      {phase === 'running' && (
        <>
          {!placed && <Crosshair size={40} strokeWidth={1.5} className="pointer-events-none absolute left-1/2 top-[47.5%] z-10 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" aria-hidden />}
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-4 pb-[max(env(safe-area-inset-bottom),20px)]">
            {status && <p className={`${glass} rounded-full px-4 py-2 text-center text-[14px]`} aria-live="polite">{status}</p>}
            <div className="flex w-full max-w-sm items-center gap-2">
              <button type="button" onClick={recenter} className={`${glass} press grid size-12 shrink-0 place-items-center rounded-full`} aria-label="Trazer o prato para onde o celular aponta" title="Trazer para cá">
                <Crosshair size={20} />
              </button>
              <button type="button" onClick={toggle} disabled={!placed} className={`${glass} press grid size-12 shrink-0 place-items-center rounded-full disabled:opacity-40`} aria-label={hidden ? 'Mostrar o prato' : 'Ocultar o prato'} title={hidden ? 'Mostrar' : 'Ocultar'}>
                {hidden ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              <button
                type="button"
                onClick={() => { add(dish.id); toast(`${dish.name} adicionado ao pedido`); }}
                className="press flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 text-[15px] font-semibold text-ink"
              >
                <Plus size={18} /> Adicionar · {formatPrice(dish.price)}
              </button>
            </div>
          </div>
        </>
      )}

      {desktop && (
        <div className="absolute inset-0 grid place-items-center bg-glaze px-6 pt-20 pb-10">
          <div className="grid w-full max-w-4xl items-center gap-8 md:grid-cols-[1.2fr_1fr]">
            <ModelStage src={dish.model.src} alt={`Modelo 3D de ${dish.name}`} className="aspect-square w-full rounded-[28px] bg-tile shadow-[var(--shadow-card)]" />
            <div>
              <h1 className="font-serif text-[34px] leading-tight text-ink">Veja na sua mesa pelo celular</h1>
              <p className="mt-3 text-[16px] leading-relaxed text-ink-2">A câmera do celular coloca o prato sobre a sua mesa, em tamanho real. Aponte a câmera do seu celular para o código.</p>
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
                <p className="flex items-center gap-2 text-[17px] font-semibold"><TriangleAlert size={20} className="text-clay" /> Não deu para abrir a câmera</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{error}</p>
                <Button size="lg" className="mt-5 w-full" icon={<Camera size={18} />} onClick={start}>Tentar de novo</Button>
              </>
            ) : (
              <>
                <h1 className="font-serif text-[30px] leading-tight">Veja na sua mesa</h1>
                <ul className="mt-4 grid gap-3 text-[15px] text-ink-2">
                  <li className="flex gap-3"><Smartphone size={20} className="mt-0.5 shrink-0 text-ink-2" /> Segure o celular sentado à mesa, uns 40 cm acima dela.</li>
                  <li className="flex gap-3"><Crosshair size={20} className="mt-0.5 shrink-0 text-ink-2" /> Aponte para a mesa: o prato aparece ali, em tamanho real aproximado.</li>
                  <li className="flex gap-3"><Hand size={20} className="mt-0.5 shrink-0 text-ink-2" /> Gire o celular para olhar e arraste o prato com o dedo.</li>
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
