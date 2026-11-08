'use client';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Box } from 'lucide-react';
import { CartBar } from '@/components/menu/CartBar';
import { CategoryRail } from '@/components/menu/CategoryRail';
import { FeaturedStrip } from '@/components/menu/FeaturedStrip';
import { HouseFeature } from '@/components/menu/HouseFeature';
import { MenuFooter } from '@/components/menu/MenuFooter';
import { MenuSection } from '@/components/menu/MenuSection';
import { MenuSkeleton } from '@/components/menu/MenuSkeleton';
import { SiteHeader } from '@/components/menu/SiteHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMenu } from '@/hooks/useMenu';
import { useCart } from '@/store/cart';

const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export default function MenuPage() {
  const { categories, dishes, loading, error, reload } = useMenu();
  const [query, setQuery] = useState('');
  const q = fold(useDeferredValue(query).trim());
  const setTable = useCart((s) => s.setTable);

  // Table QR codes point to /?mesa=12 so the order already knows the table.
  useEffect(() => {
    const mesa = new URLSearchParams(window.location.search).get('mesa');
    if (mesa) setTable(mesa);
  }, [setTable]);

  const house = useMemo(() => dishes.find((d) => d.featured && d.model) ?? dishes.find((d) => d.featured) ?? dishes[0], [dishes]);
  const matches = useMemo(
    () => (q ? dishes.filter((d) => fold([d.name, d.description, ...d.ingredients].join(' ')).includes(q)) : dishes),
    [dishes, q],
  );
  const sections = categories.map((c) => ({ category: c, dishes: matches.filter((d) => d.categoryId === c.id) })).filter((s) => s.dishes.length);

  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        <h1 className="sr-only">Cardápio Casa Nostra</h1>
        {loading ? (
          <MenuSkeleton />
        ) : error ? (
          <EmptyState title="O cardápio não carregou" body={error} action={<Button onClick={reload}>Tentar de novo</Button>} />
        ) : !dishes.length ? (
          <EmptyState title="Cardápio em preparação" body="O restaurante ainda não publicou pratos. Volte em instantes." />
        ) : (
          <>
            {house && <HouseFeature dish={house} />}
            <p className="mx-auto flex max-w-6xl items-start gap-2.5 px-4 pt-5 text-[14px] leading-relaxed text-ink-2 sm:px-6">
              <Box size={16} className="mt-0.5 shrink-0 text-clay" aria-hidden />
              Pratos marcados com 3D podem ser vistos de todos os ângulos e colocados na sua mesa, em tamanho real, pela câmera do celular.
            </p>
            <div className="mt-5">
              <CategoryRail categories={categories.filter((c) => sections.some((s) => s.category.id === c.id))} query={query} onQuery={setQuery} />
            </div>
            {!q && <FeaturedStrip dishes={dishes.filter((d) => d.featured)} />}
            {sections.length ? (
              sections.map((s) => <MenuSection key={s.category.id} {...s} />)
            ) : (
              <EmptyState title="Nada encontrado" body={`Nenhum prato combina com “${query.trim()}”. Tente outro nome ou ingrediente.`} action={<Button variant="secondary" onClick={() => setQuery('')}>Limpar busca</Button>} />
            )}
            <MenuFooter />
            <CartBar dishes={dishes} />
          </>
        )}
      </main>
    </>
  );
}
