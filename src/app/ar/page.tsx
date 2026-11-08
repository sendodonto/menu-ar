'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CameraAR } from '@/components/viewer/CameraAR';
import { useMenu } from '@/hooks/useMenu';
import type { Dish, DishModel } from '@/types/menu';

function ArRoute() {
  const id = useSearchParams().get('id');
  const { dishes, loading } = useMenu();
  const dish = dishes.find((d) => d.id === id);
  if (loading) return <div className="fixed inset-0 bg-[#1c1a17]" aria-busy="true" aria-label="Carregando" />;
  if (!dish?.model) return <EmptyState title="Este prato ainda não tem 3D" body="Ele aparece no cardápio só com a foto." action={<ButtonLink href="/">Voltar ao cardápio</ButtonLink>} />;
  return <CameraAR dish={dish as Dish & { model: DishModel }} />;
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
