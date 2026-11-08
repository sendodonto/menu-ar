'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DishForm } from '@/components/admin/DishForm';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMenu } from '@/hooks/useMenu';

function Editor() {
  const id = useSearchParams().get('id');
  const { dishes, categories, loading } = useMenu({ includeInactive: true });
  if (loading) return <div className="skeleton h-96 rounded-tile" aria-busy="true" aria-label="Carregando prato" />;
  const dish = id ? dishes.find((d) => d.id === id) : undefined;
  if (id && !dish) return <EmptyState title="Prato não encontrado" action={<ButtonLink href="/admin/pratos/">Voltar aos pratos</ButtonLink>} />;
  if (!categories.length) return <EmptyState title="Crie uma categoria primeiro" action={<ButtonLink href="/admin/categorias/">Categorias</ButtonLink>} />;
  return <DishForm key={id ?? 'novo'} dish={dish} categories={categories} existingIds={dishes.map((d) => d.id)} />;
}

export default function Page() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  );
}
