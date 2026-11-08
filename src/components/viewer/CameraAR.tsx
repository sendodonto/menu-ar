'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Crosshair, Eye, EyeOff, Image as ImageIcon, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAssetUrl } from '@/hooks/useAssetUrl';
import { asset } from '@/lib/asset';
import { formatPrice } from '@/lib/format';
import type { Dish, DishModel } from '@/types/menu';
import { arHref } from './links';

export type CameraMode = 'cartao' | 'giroscopio';
type Session = { stop: () => void; setDishVisible: (v: boolean) => void; place?: () => boolean; setTableDrop?: (m: number) => void };
type Phase = 'intro' | 'starting' | 'running' | 'error';

const HEIGHTS = [{ m: 0.3, label: '30 cm' }, { m: 0.4, label: '40 cm' }, { m: 0.55, label: '55 cm' }];

/** Camera-based AR that needs no AR runtime: table-card tracking (6DoF) or gyroscope placement (3DoF). */
export function CameraAR({ dish, mode }: { dish: Dish & { model: DishModel }; mode: CameraMode }) {
  const router = useRouter();
  const url = useAssetUrl(dish.model.src);
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const session = useRef<Session | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>('intro');
  const [error, setError] = useState('');
  const [found, setFound] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [sensor, setSensor] = useState<boolean | null>(null);
  const [drop, setDrop] = useState(0.4);
  const [hint, setHint] = useState('');

  const stop = () => {
    session.current?.stop();
    session.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  useEffect(() => stop, []);
  useEffect(() => { stop(); setPhase('intro'); setFound(false); setPlaced(false); setHidden(false); }, [mode]);

  const start = async () => {
    if (!url || !box.current || !video.current) return;
    setPhase('starting');
    setError('');
    try {
      const { openCamera } = await import('@/lib/ar/stage');
      if (mode === 'giroscopio') await (await import('@/lib/ar/gyro')).requestMotionPermission();
      stream.current = await openCamera(video.current);
      session.current = mode === 'cartao'
        ? await (await import('@/lib/ar/marker')).startMarkerAR(box.current, video.current, url, { onStatus: (s) => setFound(s === 'found') })
        : await (await import('@/lib/ar/gyro')).startGyroAR(box.current, video.current, url, { onSensor: setSensor });
      setPhase('running');
    } catch (e) {
      stop();
      setError(e instanceof Error ? e.message : 'Não foi possível iniciar a câmera.');
      setPhase('error');
    }
  };

  const toggle = () => { session.current?.setDishVisible(hidden); setHidden(!hidden); };
  const place = () => {
    const ok = session.current?.place?.();
    setHint(ok ? '' : 'Aponte o celular para baixo, para a mesa, e toque de novo.');
    if (ok) { setPlaced(true); setHidden(false); }
  };
  const changeDrop = (m: number) => { setDrop(m); session.current?.setTableDrop?.(m); };
  const leave = () => { stop(); router.push('/'); };

  const running = phase === 'running';
  const status = mode === 'cartao'
    ? found ? (hidden ? 'Prato removido' : 'Mova-se em volta: o prato fica sobre o cartão') : 'Procurando o cartão da mesa…'
    : sensor === false ? 'Este aparelho não informou o giroscópio; o prato não vai acompanhar o movimento.' : placed ? (hidden ? 'Prato removido' : 'Gire o celular para olhar o prato. Modo aproximado.') : 'Aponte para a mesa e toque em Posicionar';
  const pill = 'pointer-events-auto press inline-flex h-12 items-center gap-2 rounded-tile px-4 text-[15px] font-medium shadow-lift';

  return (
    <div className="fixed inset-0 overflow-hidden bg-ink text-glaze">
      <div ref={box} className="absolute inset-0">
        <video ref={video} className="absolute max-w-none" muted playsInline aria-hidden />
      </div>

      <header className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-ink/70 px-3 pb-2 pt-[max(env(safe-area-inset-top),10px)]">
        <Link href={arHref(dish.id)} onClick={stop} className="press grid size-11 place-items-center rounded-tile hover:bg-white/10" aria-label="Voltar">
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="serif truncate text-[20px] leading-tight">{dish.name}</p>
          <p className="tnum text-[13px] text-glaze/80">{formatPrice(dish.price)} · {mode === 'cartao' ? 'Cartão da mesa' : 'Sem cartão (aproximado)'}</p>
        </div>
        <Link href={`/mesa/?id=${dish.id}&modo=${mode === 'cartao' ? 'giroscopio' : 'cartao'}`} className="press rounded-tile border border-white/25 px-3 py-2 text-[13px] font-medium hover:bg-white/10">
          {mode === 'cartao' ? 'Sem cartão' : 'Usar cartão'}
        </Link>
      </header>

      {running && (
        <>
          <p className="absolute inset-x-4 top-[calc(env(safe-area-inset-top)+80px)] z-10 mx-auto max-w-sm rounded-tile bg-ink/80 px-3.5 py-2 text-center text-[14px]" aria-live="polite">
            {hint || status}
          </p>
          {mode === 'giroscopio' && !placed && <Crosshair size={36} className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-glaze/90" aria-hidden />}
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 px-4 pb-[max(env(safe-area-inset-bottom),18px)]">
            {mode === 'giroscopio' && placed && (
              <div role="group" aria-label="Distância do celular até a mesa" className="flex items-center gap-1 rounded-tile bg-ink/80 p-1 text-[13px]">
                <span className="px-2 text-glaze/80">Celular a</span>
                {HEIGHTS.map((h) => (
                  <button key={h.m} type="button" onClick={() => changeDrop(h.m)} aria-pressed={drop === h.m} className={`press h-9 rounded-[2px] px-2.5 font-medium ${drop === h.m ? 'bg-clay text-glaze' : 'hover:bg-white/10'}`}>{h.label}</button>
                ))}
                <span className="px-2 text-glaze/80">da mesa</span>
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-2">
              {mode === 'giroscopio' && (
                <button type="button" onClick={place} className={`${pill} bg-clay text-glaze`}><Crosshair size={18} /> {placed ? 'Posicionar de novo' : 'Posicionar aqui'}</button>
              )}
              {(mode === 'cartao' ? found : placed) && (
                <button type="button" onClick={toggle} className={`${pill} bg-tile text-ink`}>{hidden ? <Eye size={18} /> : <EyeOff size={18} />}{hidden ? 'Recolocar prato' : 'Remover prato'}</button>
              )}
              <button type="button" onClick={leave} className={`${pill} bg-ink text-glaze ring-1 ring-white/25`}><ArrowLeft size={18} /> Voltar ao cardápio</button>
            </div>
          </div>
        </>
      )}

      {!running && (
        <div className="absolute inset-x-0 bottom-0 z-10 bg-glaze px-4 pt-5 pb-[max(env(safe-area-inset-bottom),18px)] text-ink shadow-[var(--shadow-sheet)]">
          <div className="mx-auto max-w-md">
            {phase === 'error' ? (
              <>
                <p className="flex items-center gap-2 font-medium"><TriangleAlert size={18} className="text-clay" /> Não deu para abrir a câmera</p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{error}</p>
                <Button size="lg" className="mt-4 w-full" icon={<Camera size={18} />} onClick={start}>Tentar de novo</Button>
              </>
            ) : mode === 'cartao' ? (
              <>
                <h1 className="text-[28px] leading-tight">Use o cartão da mesa</h1>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">Deixe o cartão da Casa Nostra deitado na mesa e aponte a câmera para ele. O prato aparece sobre o cartão, no tamanho real, e fica no lugar enquanto você se move. Funciona em qualquer celular, sem instalar nada.</p>
                <a href={asset('/ar/cartao-alvo.png')} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-medium text-clay-ink underline">
                  <ImageIcon size={15} /> Sem cartão impresso? Abra o cartão em outra tela
                </a>
                <p className="text-[12px] text-ink-3">Na tela, o tamanho do prato acompanha o tamanho do cartão exibido.</p>
                <Button size="lg" className="mt-4 w-full" icon={<Camera size={18} />} onClick={start} disabled={!url || phase === 'starting'}>
                  {phase === 'starting' ? 'Abrindo câmera…' : 'Abrir câmera'}
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-[28px] leading-tight">Ver sem o cartão</h1>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">Segure o celular a uns 40 cm acima da mesa, aponte para onde quer o prato e toque em “Posicionar aqui”. É um modo aproximado: o prato acompanha quando você gira o celular, mas não quando você anda em volta. Para isso, use o cartão da mesa.</p>
                <Button size="lg" className="mt-4 w-full" icon={<Camera size={18} />} onClick={start} disabled={!url || phase === 'starting'}>
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
