'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useMenu } from '@/hooks/useMenu';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/format';

const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export function StatsOverview() {
  const { orders } = useOrders(8000);
  const { dishes, loading } = useMenu({ includeInactive: true });
  if (!orders || loading) return <div className="skeleton h-72 rounded-tile" aria-busy="true" aria-label="Carregando números" />;

  const today = orders.filter((o) => isToday(o.createdAt) && o.status !== 'cancelado');
  const revenue = today.reduce((s, o) => s + o.total, 0);
  const open = orders.filter((o) => ['novo', 'preparo', 'pronto'].includes(o.status)).length;
  const qty = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders.filter((o) => o.status !== 'cancelado'))
    for (const i of o.items) {
      const cur = qty.get(i.dishId) ?? { name: i.name, qty: 0, revenue: 0 };
      qty.set(i.dishId, { name: i.name, qty: cur.qty + i.qty, revenue: cur.revenue + i.qty * i.unitPrice });
    }
  const top = [...qty.values()].sort((a, b) => b.qty - a.qty).slice(0, 6);
  const active = dishes.filter((d) => d.active);

  const cells = [
    { label: 'Em andamento agora', value: String(open), href: '/admin/pedidos/' },
    { label: 'Pedidos hoje', value: String(today.length) },
    { label: 'Faturamento hoje', value: formatPrice(revenue), note: 'sem taxa de serviço' },
    { label: 'Ticket médio', value: today.length ? formatPrice(Math.round(revenue / today.length)) : '—' },
    { label: 'Pratos ativos', value: `${active.length} de ${dishes.length}`, href: '/admin/pratos/' },
    { label: 'Com modelo 3D', value: `${active.filter((d) => d.model).length}`, note: 'aparecem com botão 3D e AR' },
  ];

  return (
    <div className="grid gap-10">
      <section aria-labelledby="hoje">
      <h2 id="hoje" className="text-2xl">Hoje, {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
      <dl className="mt-3 divide-y divide-grout overflow-hidden rounded-tile border border-grout bg-tile">
        {cells.map((c) => (
          <div key={c.label} className="flex flex-wrap items-baseline gap-x-3 px-4 py-3">
            <dt className="w-40 text-[14px] text-ink-2">{c.label}</dt>
            <dd className="tnum text-[17px] font-semibold">{c.value}</dd>
            {c.note && <dd className="text-[13px] text-ink-3">{c.note}</dd>}
            {c.href && <dd className="ml-auto"><Link href={c.href} className="inline-flex items-center gap-1 text-[13px] font-medium text-clay-ink hover:underline">Abrir <ArrowRight size={13} /></Link></dd>}
          </div>
        ))}
      </dl>
      </section>

      <section aria-labelledby="mais-pedidos">
        <h2 id="mais-pedidos" className="text-2xl">Mais pedidos</h2>
        {top.length ? (
          <table className="tnum mt-3 w-full overflow-hidden rounded-tile border border-grout bg-tile text-left text-[14px]">
            <thead className="bg-glaze-2 text-[13px] text-ink-2">
              <tr><th className="px-4 py-2.5 font-medium">Prato</th><th className="px-4 py-2.5 text-right font-medium">Unidades</th><th className="px-4 py-2.5 text-right font-medium">Receita</th></tr>
            </thead>
            <tbody className="divide-y divide-grout">
              {top.map((t) => (
                <tr key={t.name}><td className="px-4 py-2.5">{t.name}</td><td className="px-4 py-2.5 text-right">{t.qty}</td><td className="px-4 py-2.5 text-right">{formatPrice(t.revenue)}</td></tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-3 text-sm text-ink-3">Os pratos mais pedidos aparecem aqui depois dos primeiros pedidos.</p>
        )}
      </section>
    </div>
  );
}
