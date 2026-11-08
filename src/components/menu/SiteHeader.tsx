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
    <header className="material sticky top-0 z-30 border-b border-black/[0.06] pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Casa Nostra, início do cardápio" className="press rounded-lg py-1">
          <CasaNostraMark compact />
        </Link>
        <Link
          href="/pedido/"
          className="press relative grid size-11 place-items-center rounded-full text-ink hover:bg-black/[0.05]"
          aria-label={n ? `Seu pedido, ${n} ${n === 1 ? 'item' : 'itens'}` : 'Seu pedido, vazio'}
        >
          <ShoppingBag size={22} strokeWidth={1.75} />
          {n > 0 && (
            <span key={n} className="bump tnum absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-clay px-1 text-[11px] font-semibold text-white">
              {n}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
