'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CameraAR } from '@/components/viewer/CameraAR';
import { useMenu } from '@/hooks/useMenu';
import type { Dish, DishModel } from '@/types/menu';

function MesaRoute() {
  const params = useSearchParams();
  const id = params.get('id');
  const mode = params.get('modo') === 'giroscopio' ? 'giroscopio' : 'cartao';
  const { dishes, loading } = useMenu();
  const dish = dishes.find((d) => d.id === id);
  if (loading) return <div className="fixed inset-0 bg-ink" aria-busy="true" aria-label="Carregando" />;
  if (!dish?.model) return <EmptyState title="Este prato não tem modelo 3D" action={<ButtonLink href="/">Voltar ao cardápio</ButtonLink>} />;
  return <CameraAR dish={dish as Dish & { model: DishModel }} mode={mode} />;
}

export default function MesaPage() {
  return (
    <main>
      <Suspense>
        <MesaRoute />
      </Suspense>
    </main>
  );
}
