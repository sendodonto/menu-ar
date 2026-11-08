'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Crosshair, Eye, EyeOff, Hand, Plus, Smartphone, TriangleAlert, X } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
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
          : 'Arraste o prato com o dedo para mudar de lugar');
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
          {!placed && <Crosshair size={40} strokeWidth={1.5} className="pointer-events-none absolute left-1/2 top-[57%] z-10 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" aria-hidden />}
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-4 pb-[max(env(safe-area-inset-bottom),20px)]">
            <p className={`${glass} rounded-full px-4 py-2 text-center text-[14px]`} aria-live="polite">{status}</p>
            <div className="flex w-full max-w-sm gap-2">
              <button type="button" onClick={recenter} className={`${glass} press flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-[15px] font-medium`}>
                <Crosshair size={18} /> Trazer para cá
              </button>
              {placed && (
                <button type="button" onClick={toggle} className={`${glass} press flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-[15px] font-medium`}>
                  {hidden ? <Eye size={18} /> : <EyeOff size={18} />} {hidden ? 'Mostrar' : 'Remover'}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => { add(dish.id); toast(`${dish.name} adicionado ao pedido`); }}
              className="press flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-white text-[15px] font-semibold text-ink"
            >
              <Plus size={18} /> Adicionar ao pedido · {formatPrice(dish.price)}
            </button>
          </div>
        </>
      )}

      {phase !== 'running' && (
        <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-[28px] bg-glaze px-5 pt-6 pb-[max(env(safe-area-inset-bottom),20px)] text-ink shadow-[var(--shadow-sheet)]">
          <div className="mx-auto max-w-md">
            {desktop ? (
              <>
                <h1 className="font-serif text-[28px] leading-tight">Abra no celular</h1>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">Ver o prato na mesa usa a câmera do celular. Aponte a câmera do seu celular para o código.</p>
                {qr && <div className="mt-4 size-36 rounded-2xl bg-white p-3" role="img" aria-label="QR code para abrir esta página no celular" dangerouslySetInnerHTML={{ __html: qr }} />}
              </>
            ) : phase === 'error' ? (
              <>
                <p className="flex items-center gap-2 text-[17px] font-semibold"><TriangleAlert size={20} className="text-clay" /> Não deu para abrir a câmera</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{error}</p>
                <Button size="lg" className="mt-5 w-full" icon={<Camera size={18} />} onClick={start}>Tentar de novo</Button>
              </>
            ) : (
              <>
                <h1 className="font-serif text-[30px] leading-tight">Veja na sua mesa</h1>
                <ul className="mt-4 grid gap-3 text-[15px] text-ink-2">
                  <li className="flex gap-3"><Smartphone size={20} className="mt-0.5 shrink-0 text-clay" /> Segure o celular sentado à mesa, uns 40 cm acima dela.</li>
                  <li className="flex gap-3"><Crosshair size={20} className="mt-0.5 shrink-0 text-clay" /> Aponte para a mesa: o prato aparece ali, em tamanho real aproximado.</li>
                  <li className="flex gap-3"><Hand size={20} className="mt-0.5 shrink-0 text-clay" /> Gire o celular para olhar e arraste o prato com o dedo.</li>
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
