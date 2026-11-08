'use client';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { CasaNostraMark } from '@/components/brand/CasaNostraMark';
import { useCartCount } from '@/store/cart';
import { useHydrated } from '@/hooks/useHydrated';

export function SiteHeader() {
  const count = useCartCount();
  const hydrated = useHydrated();
  const n = hydrated ? count : 0;
  return (
    <header className="sticky top-0 z-30 border-b border-grout bg-glaze pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Casa Nostra, início do cardápio" className="press -ml-1 rounded-tile p-1">
          <CasaNostraMark />
        </Link>
        <Link
          href="/pedido/"
          className="press relative grid size-11 place-items-center rounded-tile border border-grout bg-tile hover:border-grout-2"
          aria-label={n ? `Seu pedido, ${n} ${n === 1 ? 'item' : 'itens'}` : 'Seu pedido, vazio'}
        >
          <ShoppingBag size={20} />
          {n > 0 && (
            <span key={n} className="bump tnum absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-clay px-1 text-[11px] font-semibold text-glaze">
              {n}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
