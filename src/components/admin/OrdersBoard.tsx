'use client';
import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { Ban, ChefHat, CircleCheck, HandPlatter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice, formatTime } from '@/lib/format';
import { toast } from '@/store/toast';
import type { Order, OrderStatus } from '@/types/menu';

const LANES: { status: OrderStatus; title: string }[] = [
  { status: 'novo', title: 'Novos' },
  { status: 'preparo', title: 'Em preparo' },
  { status: 'pronto', title: 'Prontos para servir' },
];
const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string; icon: React.ReactNode }>> = {
  novo: { to: 'preparo', label: 'Iniciar preparo', icon: <ChefHat size={16} /> },
  preparo: { to: 'pronto', label: 'Marcar pronto', icon: <CircleCheck size={16} /> },
  pronto: { to: 'entregue', label: 'Entregue', icon: <HandPlatter size={16} /> },
};

const minutesAgo = (iso: string) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

/** Kitchen board: orders move between lanes in place (view transitions) and new ones stay lit until seen. */
export function OrdersBoard() {
  const { orders, error, setStatus } = useOrders();
  const [seen, setSeen] = useState<Set<string> | null>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    if (orders && !seen) setSeen(new Set(orders.map((o) => o.id)));
  }, [orders, seen]);
  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const unseen = useMemo(() => (orders && seen ? orders.filter((o) => !seen.has(o.id)).length : 0), [orders, seen]);
  useEffect(() => {
    document.title = unseen ? `(${unseen}) Pedidos · Casa Nostra` : 'Pedidos · Casa Nostra';
  }, [unseen]);

  if (error) return <EmptyState title="Não foi possível carregar os pedidos" body={error} />;
  if (!orders || !seen) return <div className="skeleton h-80 rounded-tile" aria-busy="true" aria-label="Carregando pedidos" />;

  const markSeen = (id: string) => setSeen((s) => new Set(s).add(id));
  const move = (o: Order, to: OrderStatus) => {
    markSeen(o.id);
    const apply = () => flushSync(() => { setStatus(o.id, to).catch(() => toast('Não foi possível atualizar o pedido.', 'error')); });
    if ('startViewTransition' in document && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(apply);
    else apply();
  };

  const done = orders.filter((o) => o.status === 'entregue' || o.status === 'cancelado').slice(0, 12);
  return (
    <div>
      <div className="grid gap-px overflow-hidden rounded-tile border border-grout bg-grout lg:grid-cols-3">
        {LANES.map((lane) => {
          const list = orders.filter((o) => o.status === lane.status).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          return (
            <section key={lane.status} aria-labelledby={`lane-${lane.status}`} className="min-h-40 bg-glaze p-3">
              <h2 id={`lane-${lane.status}`} className="mb-3 flex items-baseline justify-between px-1 text-xl">
                {lane.title}
                <span className="tnum font-sans text-sm text-ink-3">{list.length}</span>
              </h2>
              <ul className="grid gap-2">
                {list.map((o) => (
                  <OrderCard key={o.id} order={o} fresh={!seen.has(o.id)} onSeen={() => markSeen(o.id)} onMove={(to) => move(o, to)} />
                ))}
                {!list.length && <li className="rounded-tile border border-dashed border-grout-2 px-3 py-6 text-center text-sm text-ink-3">Nenhum pedido aqui</li>}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="mt-10" aria-labelledby="encerrados">
        <h2 id="encerrados" className="text-2xl">Encerrados recentemente</h2>
        {done.length ? (
          <ul className="mt-3 divide-y divide-grout rounded-tile border border-grout bg-tile">
            {done.map((o) => (
              <li key={o.id} className="tnum flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[14px]">
                <span className="font-semibold">{o.code}</span>
                <span className="text-ink-2">Mesa {o.table}</span>
                <span className="text-ink-2">{o.items.reduce((n, i) => n + i.qty, 0)} itens</span>
                <span>{formatPrice(o.total)}</span>
                <span className={o.status === 'cancelado' ? 'text-danger' : 'text-ramina'}>{o.status === 'cancelado' ? 'Cancelado' : 'Entregue'} · {formatTime(o.updatedAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-3">Pedidos entregues ou cancelados aparecem aqui.</p>
        )}
      </section>
    </div>
  );
}

function OrderCard({ order, fresh, onSeen, onMove }: { order: Order; fresh: boolean; onSeen: () => void; onMove: (to: OrderStatus) => void }) {
  const next = NEXT[order.status];
  const age = minutesAgo(order.createdAt);
  return (
    <li
      style={{ viewTransitionName: `order-${order.id.replace(/[^a-zA-Z0-9-]/g, '')}` }}
      onPointerEnter={fresh ? onSeen : undefined}
      onFocus={fresh ? onSeen : undefined}
      className={`rounded-tile border bg-tile p-3 shadow-[0_1px_2px_rgb(42_36_32/0.05)] transition-colors ${fresh ? 'border-clay ring-2 ring-clay/25' : 'border-grout'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="tnum text-[15px] font-semibold">{order.code} <span className="font-normal text-ink-2">· Mesa {order.table}</span></p>
          <p className="tnum text-[13px] text-ink-3">{formatTime(order.createdAt)} · há {age} min{order.customerName ? ` · ${order.customerName}` : ''}</p>
        </div>
        {fresh && <span className="rounded-tile bg-clay px-2 py-0.5 text-[12px] font-semibold text-white">Novo</span>}
        {!fresh && order.status !== 'pronto' && age >= 25 && <span className="rounded-tile bg-clay-soft px-2 py-0.5 text-[12px] font-semibold text-clay-ink">Atrasado</span>}
      </div>
      <ul className="tnum mt-2.5 grid gap-1 border-t border-grout pt-2.5 text-[14px]">
        {order.items.map((i) => (
          <li key={i.dishId}>
            <span className="font-medium">{i.qty}×</span> {i.name}
            {i.note && <span className="block pl-5 text-[13px] text-clay-ink">“{i.note}”</span>}
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="tnum text-[14px] font-semibold">{formatPrice(order.total)}</span>
        <div className="flex gap-1.5">
          {order.status !== 'pronto' && (
            <button type="button" onClick={() => onMove('cancelado')} className="press grid size-9 place-items-center rounded-tile text-ink-3 hover:bg-[#fbeeea] hover:text-danger" aria-label={`Cancelar pedido ${order.code}`} title="Cancelar">
              <Ban size={16} />
            </button>
          )}
          {next && <Button size="sm" icon={next.icon} onClick={() => onMove(next.to)}>{next.label}</Button>}
        </div>
      </div>
    </li>
  );
}
