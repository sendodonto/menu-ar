'use client';
import { ScanLine } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';
import { useCart } from '@/store/cart';

/** Opening of the menu: who we are, the table, and the one thing this menu does that paper can't. */
export function MenuIntro() {
  const table = useCart((s) => s.table);
  const hydrated = useHydrated();
  return (
    <section className="page-enter mx-auto max-w-3xl px-4 pb-2 pt-7 sm:px-6 sm:pt-12">
      <h1 className="font-serif text-[40px] leading-[1.02] sm:text-6xl">Cardápio</h1>
      <p className="mt-2 text-[15px] text-ink-2">
        Casa Nostra · Cozinha italiana contemporânea{hydrated && table ? ` · Mesa ${table}` : ''}
      </p>
      <p className="mt-4 flex items-center gap-2 whitespace-nowrap text-[13px] text-ink-2 min-[400px]:text-[14px]">
        <ScanLine size={16} className="shrink-0 text-ink" aria-hidden />
        <span>Pratos com <strong className="font-semibold text-ink">3D</strong> aparecem na sua mesa, pela câmera.</span>
      </p>
    </section>
  );
}
