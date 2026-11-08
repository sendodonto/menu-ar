'use client';
import { CartView } from '@/components/cart/CartView';
import { SiteHeader } from '@/components/menu/SiteHeader';
import { useHydrated } from '@/hooks/useHydrated';
import { useMenu } from '@/hooks/useMenu';

export default function OrderPage() {
  const { dishes, loading } = useMenu();
  const hydrated = useHydrated();
  return (
    <>
      <SiteHeader />
      <main>
        {loading || !hydrated ? <div className="skeleton mx-auto mt-6 h-64 max-w-6xl rounded-tile" aria-busy="true" aria-label="Carregando pedido" /> : <CartView dishes={dishes} />}
      </main>
    </>
  );
}
