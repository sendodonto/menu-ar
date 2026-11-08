'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Box, ScanLine, TriangleAlert } from 'lucide-react';
import { DishPhoto } from '@/components/menu/DishPhoto';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, Textarea } from '@/components/ui/Field';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ModelKind, RealSize } from '@/components/viewer/ModelBadge';
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
    { label: 'Tamanho', value: dish.model?.dimensions ? formatDimensions(dish.model.dimensions) : 'Sem modelo 3D' },
  ];

  return (
    <article className="page-enter mx-auto max-w-6xl pb-36 sm:px-6 sm:pt-6">
      <div className="grid sm:grid-cols-[1.1fr_1fr] sm:gap-10">
        <div className="relative sm:sticky sm:top-24 sm:self-start">
          <DishPhoto src={dish.photo} alt={dish.name} priority className="aspect-[4/3] sm:rounded-tile" />
          <button type="button" onClick={back} className="press absolute left-3 top-3 grid size-11 place-items-center rounded-tile bg-tile/95 shadow-lift hover:bg-tile" aria-label="Voltar ao cardápio">
            <ArrowLeft size={20} />
          </button>
          {dish.photoCredit && <p className="px-4 pt-2 text-[12px] text-ink-3 sm:px-0">{dish.photoCredit}</p>}
        </div>

        <div className="px-4 pt-4 sm:px-0 sm:pt-0">
          <h1 className="text-[38px] leading-[1.02] sm:text-5xl">{dish.name}</h1>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
            <span className="tnum text-2xl font-semibold text-clay-ink">{formatPrice(dish.price)}</span>
            {category && <Link href={`/#cat-${category.id}`} className="text-sm text-ink-2 underline hover:text-ink">{category.name}</Link>}
          </p>
          <p className="mt-4 max-w-[60ch] text-[16px] leading-relaxed text-ink-2">{dish.description}</p>

          {dish.model && (
            <div className="mt-6 rounded-tile border border-grout bg-tile p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <RealSize model={dish.model} />
                <ModelKind model={dish.model} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="secondary" size="lg" icon={<Box size={18} />} onClick={() => open(dish)} className="whitespace-nowrap px-3">Ver em 3D</Button>
                <ButtonLink href={arHref(dish.id)} size="lg" icon={<ScanLine size={18} />} className="whitespace-nowrap px-3">Na minha mesa</ButtonLink>
              </div>
            </div>
          )}

          <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-tile border border-grout bg-grout">
            {facts.map((f) => (
              <div key={f.label} className="bg-tile px-3 py-3">
                <dt className="text-[12px] text-ink-3">{f.label}</dt>
                <dd className="tnum mt-0.5 text-[15px] font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-8" aria-labelledby="ingredientes">
            <h2 id="ingredientes" className="text-2xl">Ingredientes</h2>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {dish.ingredients.map((i) => (
                <li key={i} className="rounded-tile border border-grout bg-tile px-2.5 py-1 text-[14px]">{i}</li>
              ))}
            </ul>
          </section>

          <section className="mt-8" aria-labelledby="alergenos">
            <h2 id="alergenos" className="text-2xl">Alérgenos</h2>
            {dish.allergens.length ? (
              <p className="mt-3 flex items-start gap-2 text-[15px] leading-relaxed">
                <TriangleAlert size={18} className="mt-0.5 shrink-0 text-clay" aria-hidden />
                <span>Contém {dish.allergens.join(', ').toLowerCase()}.</span>
              </p>
            ) : (
              <p className="mt-3 text-[15px] text-ink-2">Nenhum alérgeno principal declarado pelo restaurante.</p>
            )}
          </section>

          <div className="mt-8">
            <Field label="Observações para a cozinha" hint="Opcional. Ex.: sem cebola, ponto da carne.">
              <Textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 200))} placeholder="Escreva aqui" rows={2} />
            </Field>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-grout bg-glaze px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)] shadow-[var(--shadow-sheet)]">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <QuantityStepper value={qty} onChange={(n) => setQty(clampQty(n))} label={dish.name} />
          <Button size="lg" className="flex-1" onClick={submit}>
            Adicionar <span className="tnum font-semibold">· {formatPrice(dish.price * qty)}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
