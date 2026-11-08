'use client';
import { AdminHeading } from '@/components/admin/AdminShell';
import { OrdersBoard } from '@/components/admin/OrdersBoard';

export default function Page() {
  return (
    <>
      <AdminHeading title="Pedidos">
        <span className="text-sm text-ink-3">Atualiza sozinho a cada poucos segundos</span>
      </AdminHeading>
      <OrdersBoard />
    </>
  );
}
