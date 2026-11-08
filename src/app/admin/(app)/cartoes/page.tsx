'use client';
import { AdminHeading } from '@/components/admin/AdminShell';
import { TableCards } from '@/components/admin/TableCards';

export default function Page() {
  return (
    <>
      <div className="print:hidden"><AdminHeading title="Cartões das mesas" /></div>
      <TableCards />
    </>
  );
}
