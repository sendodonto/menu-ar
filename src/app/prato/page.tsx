'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DishDetail } from '@/components/dish/DishDetail';
import { SiteHeader } from '@/components/menu/SiteHeader';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMenu } from '@/hooks/useMenu';

function DishRoute() {
  const id = useSearchParams().get('id');
  const { dishes, categories, loading } = useMenu();
  const dish = dishes.find((d) => d.id === id);
  if (loading) return <div className="skeleton mx-auto aspect-[4/3] max-w-6xl sm:mt-6" aria-busy="true" aria-label="Carregando prato" />;
  if (!dish) return <EmptyState title="Prato não encontrado" body="Ele pode ter saído do cardápio de hoje." action={<ButtonLink href="/">Voltar ao cardápio</ButtonLink>} />;
  return <DishDetail key={dish.id} dish={dish} category={categories.find((c) => c.id === dish.categoryId)} />;
}

export default function DishPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Suspense>
          <DishRoute />
        </Suspense>
      </main>
    </>
  );
}
