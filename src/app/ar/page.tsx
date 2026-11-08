'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArExperience } from '@/components/viewer/ArExperience';
import { useMenu } from '@/hooks/useMenu';
import type { Dish, DishModel } from '@/types/menu';

function ArRoute() {
  const id = useSearchParams().get('id');
  const { dishes, loading } = useMenu();
  const dish = dishes.find((d) => d.id === id);
  if (loading) return <div className="skeleton fixed inset-0" aria-busy="true" aria-label="Carregando" />;
  if (!dish) return <EmptyState title="Prato não encontrado" action={<ButtonLink href="/">Voltar ao cardápio</ButtonLink>} />;
  if (!dish.model) return <EmptyState title="Este prato ainda não tem modelo 3D" body="Ele pode ser visto pela foto no cardápio." action={<ButtonLink href={`/prato/?id=${dish.id}`}>Ver prato</ButtonLink>} />;
  return <ArExperience dish={dish as Dish & { model: DishModel }} />;
}

export default function ArPage() {
  return (
    <main>
      <Suspense>
        <ArRoute />
      </Suspense>
    </main>
  );
}
