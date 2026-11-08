'use client';
import { AdminHeading } from '@/components/admin/AdminShell';
import { StatsOverview } from '@/components/admin/StatsOverview';

export default function Page() {
  return (
    <>
      <AdminHeading title="Visão geral" />
      <StatsOverview />
    </>
  );
}
