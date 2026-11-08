import Link from 'next/link';
import { Box } from 'lucide-react';
import { dishHref } from '@/components/viewer/links';
import { formatPrice } from '@/lib/format';
import type { Dish } from '@/types/menu';
import { DishActions } from './DishActions';
import { DishPhoto } from './DishPhoto';

export function DishTile({ dish, index = 0 }: { dish: Dish; index?: number }) {
  return (
    <article className="tile-set group relative flex flex-col bg-tile shadow-[0_0_0_1px_var(--color-grout),inset_0_-2px_0_var(--color-clay)]" style={{ '--i': Math.min(index, 8) } as React.CSSProperties}>
      <div className="relative">
        <DishPhoto src={dish.photo} alt={dish.name} className="aspect-square transition-transform" sizes="(min-width: 1024px) 25vw, 50vw" />
        {dish.model && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-tile bg-tile/95 px-1.5 py-1 text-[11px] font-semibold text-ink shadow-sm">
            <Box size={12} className="text-clay" aria-hidden /> 3D
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="flex-1">
          <h3 className="text-[18px] leading-[1.15]">
            <Link href={dishHref(dish.id)} className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-clay">
              {dish.name}
            </Link>
          </h3>
          <p className="tnum mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[13px] text-ink-3">
            <span className="rounded-[2px] bg-clay-soft px-1.5 py-0.5 text-[14px] font-semibold text-clay-ink">{formatPrice(dish.price)}</span>
            <span>{dish.prepMinutes} min</span>
          </p>
        </div>
        <DishActions dish={dish} />
      </div>
    </article>
  );
}
