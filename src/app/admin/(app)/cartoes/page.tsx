'use client';
import { AdminHeading } from '@/components/admin/AdminShell';
import { TableCards } from '@/components/admin/TableCards';

export default function Page() {
  return (
    <>
      <div className="print:hidden"><AdminHeading title="QR das mesas" /></div>
      <TableCards />
    </>
  );
}
