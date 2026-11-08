'use client';
import Link from 'next/link';
import { Box, ScanLine } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { RealSize } from '@/components/viewer/ModelBadge';
import { arHref, dishHref } from '@/components/viewer/links';
import { useViewer } from '@/components/viewer/viewer-store';
import { formatPrice } from '@/lib/format';
import type { Dish } from '@/types/menu';
import { DishPhoto } from './DishPhoto';

/** First viewport: the house dish as one large tile, with the 3D and on-my-table actions. */
export function HouseFeature({ dish }: { dish: Dish }) {
  const open = useViewer((s) => s.open);
  return (
    <section aria-labelledby="house-dish" className="page-enter mx-auto max-w-6xl sm:mt-6 sm:px-6">
      <div className="grid border-b border-grout bg-tile sm:grid-cols-[1.15fr_1fr] sm:overflow-hidden sm:rounded-tile sm:border">
      <Link href={dishHref(dish.id)} className="block" tabIndex={-1} aria-hidden>
        <DishPhoto src={dish.photo} alt="" priority className="aspect-[16/11] sm:aspect-auto sm:h-full sm:min-h-[420px]" />
      </Link>
      <div className="flex flex-col justify-center gap-3.5 px-4 pb-5 pt-4 sm:gap-4 sm:p-10">
        <div>
          <h2 id="house-dish" className="text-[34px] leading-[1.02] sm:text-5xl">
            <Link href={dishHref(dish.id)} className="hover:text-clay-ink">{dish.name}</Link>
          </h2>
          <p className="mt-2.5 line-clamp-2 max-w-[48ch] text-[15px] leading-relaxed text-ink-2 sm:line-clamp-none">{dish.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="tnum text-xl font-semibold text-clay-ink">{formatPrice(dish.price)}</span>
          {dish.model && <RealSize model={dish.model} />}
        </div>
        {dish.model ? (
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button variant="secondary" size="lg" icon={<Box size={18} />} onClick={() => open(dish)} className="whitespace-nowrap px-3">Ver em 3D</Button>
            <ButtonLink href={arHref(dish.id)} size="lg" icon={<ScanLine size={18} />} className="whitespace-nowrap px-3">Na minha mesa</ButtonLink>
          </div>
        ) : (
          <ButtonLink href={dishHref(dish.id)} size="lg" className="sm:self-start">Ver prato</ButtonLink>
        )}
        {dish.model && <p className="text-[13px] leading-snug text-ink-3">Com 3D, o prato aparece na sua mesa em tamanho real, pela câmera do celular.</p>}
      </div>
      </div>
    </section>
  );
}
