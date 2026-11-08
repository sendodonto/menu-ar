'use client';
import Link from 'next/link';
import { useHydrated } from '@/hooks/useHydrated';
import { priceLines, totalOf } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/store/cart';
import type { Dish } from '@/types/menu';

/** Floating order button once something is in the order. */
export function CartBar({ dishes }: { dishes: Dish[] }) {
  const lines = useCart((s) => s.lines);
  const hydrated = useHydrated();
  const items = priceLines(lines, dishes);
  const count = items.reduce((n, i) => n + i.qty, 0);
  if (!hydrated || !count) return null;
  return (
    <div className="tile-set fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(env(safe-area-inset-bottom),14px)]">
      <Link href="/pedido/" className="press mx-auto flex h-14 max-w-md items-center gap-3 rounded-2xl bg-ink px-4 text-white shadow-[var(--shadow-lift)] hover:bg-black">
        <span className="tnum grid h-7 min-w-7 place-items-center rounded-full bg-white/15 px-2 text-[14px] font-semibold">{count}</span>
        <span className="flex-1 text-[16px] font-semibold">Ver pedido</span>
        <span className="tnum text-[16px] font-semibold">{formatPrice(totalOf(items))}</span>
      </Link>
    </div>
  );
}
