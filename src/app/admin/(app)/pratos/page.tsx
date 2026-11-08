'use client';
import { AdminHeading } from '@/components/admin/AdminShell';
import { DishTable } from '@/components/admin/DishTable';

export default function Page() {
  return (
    <>
      <AdminHeading title="Pratos" />
      <DishTable />
    </>
  );
}
