'use client';
import { AdminHeading } from '@/components/admin/AdminShell';
import { CategoryManager } from '@/components/admin/CategoryManager';

export default function Page() {
  return (
    <>
      <AdminHeading title="Categorias" />
      <CategoryManager />
    </>
  );
}
