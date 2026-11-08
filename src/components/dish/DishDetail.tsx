'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Rotate3d, ScanLine, TriangleAlert } from 'lucide-react';
import { DishPhoto } from '@/components/menu/DishPhoto';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Field';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { arHref } from '@/components/viewer/links';
import { useViewer } from '@/components/viewer/viewer-store';
import { clampQty } from '@/lib/cart';
import { formatDimensions, formatPrice } from '@/lib/format';
import { useCart } from '@/store/cart';
import { toast } from '@/store/toast';
import type { Category, Dish } from '@/types/menu';

export function DishDetail({ dish, category }: { dish: Dish; category?: Category }) {
  const router = useRouter();
  const open = useViewer((s) => s.open);
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');

  const back = () => (window.history.length > 1 ? router.back() : router.push('/'));
  const submit = () => {
    add(dish.id, qty, note.trim());
    toast(`${qty}× ${dish.name} no seu pedido`);
    setQty(1);
    setNote('');
  };

  const facts = [
    { label: 'Preparo', value: `${dish.prepMinutes} min` },
    { label: 'Serve', value: `${dish.serves} ${dish.serves === 1 ? 'pessoa' : 'pessoas'}` },
    ...(dish.model?.dimensions ? [{ label: 'Tamanho', value: formatDimensions(dish.model.dimensions) }] : []),
  ];

  return (
    <article className="page-enter mx-auto max-w-5xl pb-36 sm:px-6 sm:pt-8">
      <div className="grid sm:grid-cols-2 sm:gap-10">
        <div className="relative sm:sticky sm:top-20 sm:self-start">
          <DishPhoto src={dish.photo} alt={dish.name} priority className="aspect-square sm:rounded-2xl" sizes="(min-width: 640px) 50vw, 100vw" />
          <button type="button" onClick={back} className="material press absolute left-3 top-3 grid size-10 place-items-center rounded-full shadow-sm" aria-label="Voltar ao cardápio">
            <ChevronLeft size={22} />
          </button>
          {dish.photoCredit && <p className="px-4 pt-2 text-[12px] text-ink-3 sm:px-0">{dish.photoCredit}</p>}
        </div>

        <div className="px-4 pt-5 sm:px-0 sm:pt-2">
          {category && <Link href={`/#cat-${category.id}`} className="text-[14px] text-ink-3 hover:text-ink">{category.name}</Link>}
          <h1 className="mt-1 font-serif text-[36px] leading-[1.05] sm:text-5xl">{dish.name}</h1>
          <p className="tnum mt-3 text-[22px] font-medium">{formatPrice(dish.price)}</p>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-ink-2">{dish.description}</p>

          {dish.model && (
            <div className="mt-6 overflow-hidden rounded-2xl bg-tile shadow-[var(--shadow-card)]">
              <Link href={arHref(dish.id)} className="group flex items-center gap-4 p-4 transition-colors hover:bg-black/[0.02]">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-clay text-white"><ScanLine size={22} /></span>
                <span className="flex-1">
                  <span className="block text-[16px] font-semibold">Ver na minha mesa</span>
                  <span className="block text-[14px] text-ink-2">Pela câmera do celular, em tamanho real</span>
                </span>
                <ChevronRight size={20} className="text-ink-3 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button type="button" onClick={() => open(dish)} className="flex w-full items-center gap-4 border-t border-grout p-4 text-left transition-colors hover:bg-black/[0.02]">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-glaze-2 text-ink"><Rotate3d size={22} /></span>
                <span className="flex-1">
                  <span className="block text-[16px] font-semibold">Girar em 3D</span>
                  <span className="block text-[14px] text-ink-2">{dish.model.kind === 'scan' ? 'Escaneamento 3D real' : 'Modelo 3D demonstrativo'}</span>
                </span>
                <ChevronRight size={20} className="text-ink-3" />
              </button>
            </div>
          )}

          <dl className="mt-6 flex divide-x divide-grout rounded-2xl bg-tile py-3 shadow-[var(--shadow-card)]">
            {facts.map((f) => (
              <div key={f.label} className="flex-1 px-4 text-center">
                <dt className="text-[12px] text-ink-3">{f.label}</dt>
                <dd className="tnum mt-0.5 text-[15px] font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-8" aria-labelledby="ingredientes">
            <h2 id="ingredientes" className="font-sans text-[17px] font-semibold tracking-normal">Ingredientes</h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{dish.ingredients.join(', ')}.</p>
          </section>

          <section className="mt-6" aria-labelledby="alergenos">
            <h2 id="alergenos" className="font-sans text-[17px] font-semibold tracking-normal">Alérgenos</h2>
            {dish.allergens.length ? (
              <p className="mt-1.5 flex items-start gap-2 text-[15px] leading-relaxed text-ink-2">
                <TriangleAlert size={17} className="mt-[3px] shrink-0 text-clay" aria-hidden />
                Contém {dish.allergens.join(', ').toLowerCase()}.
              </p>
            ) : (
              <p className="mt-1.5 text-[15px] text-ink-2">Nenhum alérgeno principal declarado.</p>
            )}
          </section>

          <label className="mt-8 block">
            <span className="font-sans text-[17px] font-semibold tracking-normal">Observação</span>
            <Textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 200))} placeholder="Ex.: sem cebola, ponto da carne" rows={2} className="mt-2" />
          </label>
        </div>
      </div>

      <div className="material fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <QuantityStepper value={qty} onChange={(n) => setQty(clampQty(n))} label={dish.name} />
          <Button size="lg" className="flex-1" onClick={submit}>
            Adicionar · <span className="tnum">{formatPrice(dish.price * qty)}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
