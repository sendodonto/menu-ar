'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Hand, Plus, ScanLine, Smartphone, TriangleAlert, X } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
import { hasNativeAR, openCamera } from '@/lib/ar/camera';
import { formatDimensions, formatPrice } from '@/lib/format';
import { useCart } from '@/store/cart';
import { toast } from '@/store/toast';
import type { Dish, DishModel } from '@/types/menu';
import type { ModelViewerElement } from '@/types/model-viewer';
import { ModelStage } from './ModelStage';

type Device = 'checking' | 'native' | 'preview' | 'desktop';
type Phase = 'intro' | 'starting' | 'running' | 'error';

const glass = 'glass bg-black/45 text-white backdrop-blur-xl backdrop-saturate-150';

/**
 * "Na minha mesa", the way commercial AR menus do it: phones with system AR (ARCore / iOS Quick Look) place the dish
 * on the table at real size; phones without it get the 3D dish over the live camera, turned by touch, with no sensors.
 */
export function CameraAR({ dish }: { dish: Dish & { model: DishModel } }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const mv = useRef<ModelViewerElement | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [device, setDevice] = useState<Device>('checking');
  const [phase, setPhase] = useState<Phase>('intro');
  const [error, setError] = useState('');
  const [qr, setQr] = useState('');

  useEffect(() => {
    const touch = navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);
    if (!touch) {
      setDevice('desktop');
      QRCode.toString(window.location.href, { type: 'svg', margin: 0, color: { dark: '#1c1a17', light: '#ffffff' } }).then(setQr).catch(() => setQr(''));
      return;
    }
    hasNativeAR().then((ok) => setDevice(ok ? 'native' : 'preview'));
  }, []);

  const stopCamera = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  useEffect(() => stopCamera, []);

  const start = async () => {
    setError('');
    if (device === 'native') {
      try {
        await mv.current?.activateAR();
      } catch {
        setError('Não foi possível abrir o AR deste aparelho. Tente de novo.');
        setPhase('error');
      }
      return;
    }
    if (!video.current) return;
    setPhase('starting');
    try {
      stream.current = await openCamera(video.current);
      setPhase('running');
    } catch (e) {
      stopCamera();
      setError(e instanceof Error ? e.message : 'Não foi possível abrir a câmera.');
      setPhase('error');
    }
  };

  const close = () => { stopCamera(); router.back(); };
  const size = dish.model.dimensions ? formatDimensions(dish.model.dimensions) : null;
  const preview = device === 'preview' && phase === 'running';

  if (device === 'desktop')
    return (
      <div className="fixed inset-0 grid place-items-center overflow-auto bg-glaze px-6 py-16">
        <button type="button" onClick={close} className="press absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-black/[0.06] text-ink hover:bg-black/10" aria-label="Fechar e voltar">
          <X size={20} />
        </button>
        <div className="grid w-full max-w-4xl items-center gap-8 md:grid-cols-[1.2fr_1fr]">
          <ModelStage src={dish.model.src} alt={`Modelo 3D de ${dish.name}`} className="aspect-square w-full rounded-[28px] bg-tile shadow-[var(--shadow-card)]" />
          <div>
            <p className="text-[15px] text-ink-2">{dish.name} · <span className="tnum">{formatPrice(dish.price)}</span>{size ? ` · ${size}` : ''}</p>
            <h1 className="mt-2 font-serif text-[34px] leading-tight text-ink">Veja na sua mesa pelo celular</h1>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-2">Aponte a câmera do seu celular para o código e toque em “Ver na minha mesa”.</p>
            {qr && <div className="mt-6 size-40 rounded-2xl bg-white p-3 shadow-[var(--shadow-card)]" role="img" aria-label="QR code para abrir esta página no celular" dangerouslySetInnerHTML={{ __html: qr }} />}
            <p className="mt-4 text-[14px] text-ink-3">Aqui você pode girar e aproximar o item em 3D.</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#1c1a17]">
      <video ref={video} className={`absolute inset-0 size-full max-w-none object-cover ${preview ? '' : 'invisible'}`} muted playsInline aria-hidden />

      {/* The same model-viewer serves both paths: system AR launches from it; the preview shows it over the camera. */}
      <ModelStage
        ref={mv}
        src={dish.model.src}
        alt={`Modelo 3D de ${dish.name}`}
        ar={device === 'native'}
        autoRotate={false}
        className={`absolute inset-x-0 top-[12%] h-[62%] ${preview ? '' : 'invisible'}`}
      >
        <span slot="ar-button" hidden />
      </ModelStage>

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 px-4 pt-[max(env(safe-area-inset-top),12px)]">
        <div className={`${glass} min-w-0 rounded-2xl px-4 py-2.5`}>
          <p className="truncate text-[15px] font-semibold leading-tight">{dish.name}</p>
          <p className="text-[13px] text-white/75">{formatPrice(dish.price)}{size ? ` · ${size}` : ''}</p>
        </div>
        <button type="button" onClick={close} className={`${glass} press grid size-11 shrink-0 place-items-center rounded-full`} aria-label="Fechar e voltar">
          <X size={20} />
        </button>
      </div>

      {preview && (
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-4 pb-[max(env(safe-area-inset-bottom),20px)]">
          <p className={`${glass} rounded-full px-4 py-2 text-center text-[14px]`}>Arraste para girar · pinça para aproximar</p>
          <button
            type="button"
            onClick={() => { add(dish.id); toast(`${dish.name} adicionado ao pedido`); }}
            className="press flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-white px-4 text-[16px] font-semibold text-ink"
          >
            <Plus size={18} /> Adicionar ao pedido · {formatPrice(dish.price)}
          </button>
          <p className="text-center text-[11px] text-white/70">Prévia na câmera: este celular não tem AR, então o prato acompanha a tela.</p>
        </div>
      )}

      {!preview && (
        <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-[28px] bg-glaze px-5 pt-6 pb-[max(env(safe-area-inset-bottom),20px)] text-ink shadow-[var(--shadow-sheet)]">
          <div className="mx-auto max-w-md">
            {phase === 'error' ? (
              <>
                <p className="flex items-center gap-2 text-[17px] font-semibold"><TriangleAlert size={20} className="text-danger" /> Não deu para abrir a câmera</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{error}</p>
                <Button size="lg" className="mt-5 w-full" icon={<Camera size={18} />} onClick={start}>Tentar de novo</Button>
              </>
            ) : device === 'native' ? (
              <>
                <h1 className="font-serif text-[30px] leading-tight">Veja na sua mesa</h1>
                <ul className="mt-4 grid gap-3 text-[15px] text-ink-2">
                  <li className="flex gap-3"><Smartphone size={20} className="mt-0.5 shrink-0 text-ink-2" /> Aponte a câmera para a mesa e mova o celular devagar.</li>
                  <li className="flex gap-3"><ScanLine size={20} className="mt-0.5 shrink-0 text-ink-2" /> O prato aparece sobre a mesa, em tamanho real.</li>
                  <li className="flex gap-3"><Hand size={20} className="mt-0.5 shrink-0 text-ink-2" /> Ande em volta e chegue perto: ele fica no lugar.</li>
                </ul>
                <Button size="lg" className="mt-6 w-full" icon={<ScanLine size={18} />} onClick={start}>Ver na minha mesa</Button>
              </>
            ) : (
              <>
                <h1 className="font-serif text-[30px] leading-tight">Veja pela câmera</h1>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
                  Este celular não tem o recurso de AR do sistema, que prende o prato na mesa. Mostramos o prato em 3D por cima da câmera: gire com o dedo para ver de todos os lados e aproxime com dois dedos.
                </p>
                <Button size="lg" className="mt-6 w-full" icon={<Camera size={18} />} onClick={start} disabled={device === 'checking' || phase === 'starting'}>
                  {phase === 'starting' ? 'Abrindo câmera…' : 'Abrir câmera'}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
