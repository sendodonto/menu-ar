'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';
import { priceLines, totalOf } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/store/cart';
import type { Dish } from '@/types/menu';

/** Bottom bar that appears once something is in the order. */
export function CartBar({ dishes }: { dishes: Dish[] }) {
  const lines = useCart((s) => s.lines);
  const hydrated = useHydrated();
  const items = priceLines(lines, dishes);
  const count = items.reduce((n, i) => n + i.qty, 0);
  if (!hydrated || !count) return null;
  return (
    <div className="tile-set fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(env(safe-area-inset-bottom),12px)] sm:px-6">
      <Link
        href="/pedido/"
        className="press mx-auto flex h-14 max-w-xl items-center justify-between gap-3 rounded-tile bg-ink px-4 text-glaze shadow-lift hover:bg-[#3a322c]"
      >
        <span className="tnum grid size-7 place-items-center rounded-tile bg-clay text-[13px] font-semibold">{count}</span>
        <span className="flex-1 text-[15px] font-medium">Ver pedido</span>
        <span className="tnum text-[15px] font-semibold">{formatPrice(totalOf(items))}</span>
        <ArrowRight size={18} aria-hidden />
      </Link>
    </div>
  );
}
