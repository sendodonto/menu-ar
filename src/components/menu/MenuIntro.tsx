'use client';
import { ScanLine } from 'lucide-react';
import { useHydrated } from '@/hooks/useHydrated';
import { useCart } from '@/store/cart';

/** Opening of the menu: who we are, the table, and the one thing this menu does that paper can't. */
export function MenuIntro() {
  const table = useCart((s) => s.table);
  const hydrated = useHydrated();
  return (
    <section className="page-enter mx-auto max-w-5xl px-4 pb-2 pt-7 sm:px-6 sm:pt-12">
      <h1 className="font-serif text-[40px] leading-[1.02] sm:text-6xl">Cardápio</h1>
      <p className="mt-2 text-[15px] text-ink-2">
        Casa Nostra · Cozinha italiana contemporânea{hydrated && table ? ` · Mesa ${table}` : ''}
      </p>
      <p className="mt-5 flex items-center gap-3 rounded-tile bg-tile px-4 py-3 text-[14px] leading-snug text-ink-2 shadow-[var(--shadow-card)]">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-clay-soft text-clay-ink"><ScanLine size={18} aria-hidden /></span>
        <span>Pratos com <strong className="font-semibold text-ink">3D</strong> você pode ver na sua mesa, em tamanho real, pela câmera do celular.</span>
      </p>
    </section>
  );
}
