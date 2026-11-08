'use client';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { dishHref } from '@/components/viewer/links';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/store/cart';
import { toast } from '@/store/toast';
import type { Dish } from '@/types/menu';
import { DishPhoto } from './DishPhoto';
import { ThreeDBadge } from './ThreeDBadge';

/** One dish in the list: text on the left, photo on the right with a single add button. The row opens the dish. */
export function DishRow({ dish }: { dish: Dish }) {
  const add = useCart((s) => s.add);
  return (
    <li className="relative">
      <Link href={dishHref(dish.id)} className="group flex gap-4 px-4 py-4 transition-colors hover:bg-black/[0.02] active:bg-black/[0.04] sm:px-5">
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-semibold leading-snug text-ink">{dish.name}</h3>
          <p className="mt-1 line-clamp-2 text-[14px] leading-snug text-ink-2">{dish.description}</p>
          <p className="mt-2 flex items-center gap-2">
            <span className="tnum text-[15px] font-medium text-ink">{formatPrice(dish.price)}</span>
            {dish.model && <ThreeDBadge className="!bg-glaze-2 !shadow-none" />}
          </p>
        </div>
        <DishPhoto src={dish.photo} alt="" className="size-[104px] shrink-0 rounded-tile" sizes="104px" />
      </Link>
      <button
        type="button"
        onClick={() => { add(dish.id); toast(`${dish.name} adicionado ao pedido`); }}
        className="press absolute bottom-2.5 right-2.5 grid size-10 place-items-center rounded-full bg-tile text-ink shadow-[var(--shadow-lift)] hover:bg-glaze sm:right-3.5"
        aria-label={`Adicionar ${dish.name} ao pedido`}
      >
        <Plus size={20} strokeWidth={2} />
      </button>
    </li>
  );
}
