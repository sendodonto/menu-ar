'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check, Trash2 } from 'lucide-react';
import { DishPhoto } from '@/components/menu/DishPhoto';
import { dishHref } from '@/components/viewer/links';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field, Input } from '@/components/ui/Field';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { priceLines, totalOf } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { getRepository } from '@/services/repository';
import { useCart } from '@/store/cart';
import { toast } from '@/store/toast';
import type { Dish, OrderItem } from '@/types/menu';

const SERVICE_RATE = 0.1;

export function CartView({ dishes }: { dishes: Dish[] }) {
  const { lines, table, setQty, setNote, remove, clear, setTable } = useCart();
  const [service, setService] = useState(true);
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; items: OrderItem[]; total: number; table: string } | null>(null);

  const items = priceLines(lines, dishes);
  const subtotal = totalOf(items);
  const serviceFee = service ? Math.round(subtotal * SERVICE_RATE) : 0;
  const total = subtotal + serviceFee;
  const missing = lines.length - items.length;

  if (done) return <OrderConfirmation {...done} />;
  if (!items.length)
    return (
      <EmptyState
        title="Seu pedido está vazio"
        body={missing ? 'Os pratos que você escolheu saíram do cardápio. Escolha outros para continuar.' : 'Escolha pratos no cardápio e eles aparecem aqui.'}
        action={<ButtonLink href="/">Ver o cardápio</ButtonLink>}
      />
    );

  const send = async () => {
    if (!table.trim()) {
      setTableError('Informe o número da mesa para a equipe levar o pedido.');
      document.getElementById('mesa')?.focus();
      return;
    }
    setSending(true);
    try {
      const repo = await getRepository();
      const { code } = await repo.createOrder({ table, customerName: name, items: items.map((i) => ({ dishId: i.dishId, qty: i.qty, note: i.note })) });
      setDone({ code, items, total, table });
      clear();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Não foi possível enviar o pedido. Tente de novo.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-enter mx-auto grid max-w-6xl gap-8 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1fr_380px]">
      <section aria-labelledby="itens">
        <div className="flex items-baseline justify-between">
          <h1 id="itens" className="text-[36px] leading-none">Seu pedido</h1>
          <Link href="/" className="text-sm font-medium text-ink-2 underline">Continuar escolhendo</Link>
        </div>
        {missing > 0 && <p className="mt-3 text-sm text-danger">{missing} {missing === 1 ? 'prato saiu' : 'pratos saíram'} do cardápio e {missing === 1 ? 'foi removido' : 'foram removidos'} do total.</p>}
        <ul className="mt-5 divide-y divide-grout overflow-hidden rounded-2xl bg-tile shadow-[var(--shadow-card)]">
          {items.map((item) => {
            const dish = dishes.find((d) => d.id === item.dishId)!;
            return (
              <li key={item.dishId} className="tile-set flex gap-3 p-3 sm:gap-4 sm:p-4">
                <Link href={dishHref(dish.id)} className="shrink-0" tabIndex={-1} aria-hidden>
                  <DishPhoto src={dish.photo} alt="" className="size-20 rounded-tile sm:size-24" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={dishHref(dish.id)} className="text-[16px] font-semibold leading-snug hover:text-clay-ink">{item.name}</Link>
                    <span className="tnum shrink-0 text-[15px] font-semibold">{formatPrice(item.unitPrice * item.qty)}</span>
                  </div>
                  <p className="tnum mt-0.5 text-[13px] text-ink-3">{formatPrice(item.unitPrice)} cada</p>
                  <input
                    value={item.note ?? ''}
                    onChange={(e) => setNote(item.dishId, e.target.value)}
                    placeholder="Observação (ex.: sem cebola)"
                    aria-label={`Observação para ${item.name}`}
                    className="mt-2 h-10 w-full rounded-full bg-glaze px-4 text-[15px] placeholder:text-ink-3 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper value={item.qty} onChange={(n) => setQty(item.dishId, n)} label={item.name} />
                    <button type="button" onClick={() => remove(item.dishId)} className="press inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-[14px] text-ink-2 hover:bg-glaze">
                      <Trash2 size={16} aria-hidden /> Remover
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="resumo">
        <div className="rounded-2xl bg-tile p-4 shadow-[var(--shadow-card)] sm:p-5">
          <h2 id="resumo" className="font-sans text-[19px] font-semibold tracking-normal">Resumo</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Mesa" error={tableError}>
              <Input id="mesa" inputMode="numeric" value={table} onChange={(e) => { setTable(e.target.value); setTableError(null); }} placeholder="Número da mesa" aria-invalid={!!tableError} />
            </Field>
            <Field label="Seu nome" hint="Opcional, ajuda a equipe a entregar.">
              <Input value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} placeholder="Como podemos te chamar" autoComplete="given-name" />
            </Field>
          </div>
          <dl className="tnum mt-5 grid gap-2 border-t border-grout pt-4 text-[15px]">
            <div className="flex justify-between"><dt className="text-ink-2">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div className="flex items-center justify-between">
              <dt>
                <label className="inline-flex cursor-pointer items-center gap-2 text-ink-2">
                  <input type="checkbox" checked={service} onChange={(e) => setService(e.target.checked)} className="size-4" />
                  Serviço (10%, opcional)
                </label>
              </dt>
              <dd>{formatPrice(serviceFee)}</dd>
            </div>
            <div className="mt-1 flex justify-between border-t border-grout pt-3 text-lg font-semibold"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
          <Button size="lg" className="mt-5 w-full" onClick={send} disabled={sending} aria-busy={sending}>
            {sending ? 'Enviando…' : `Enviar pedido · ${formatPrice(total)}`}
          </Button>
          <p className="mt-3 text-center text-[12px] text-ink-3">Demonstração: o pagamento é feito no restaurante, nada é cobrado aqui.</p>
        </div>
      </aside>
    </div>
  );
}

function OrderConfirmation({ code, items, total, table }: { code: string; items: OrderItem[]; total: number; table: string }) {
  return (
    <div className="page-enter mx-auto max-w-md px-4 py-12 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-ramina text-white"><Check size={28} aria-hidden /></span>
      <h1 className="mt-5 text-[38px] leading-none">Pedido enviado</h1>
      <p className="mt-3 text-[15px] text-ink-2">A cozinha já recebeu. Ele chega à mesa {table} assim que estiver pronto.</p>
      <p className="tnum mt-6 inline-block rounded-full bg-tile px-5 py-2 text-lg font-semibold tracking-wider shadow-[var(--shadow-card)]">{code}</p>
      <ul className="mt-6 divide-y divide-grout rounded-2xl bg-tile text-left text-[15px] shadow-[var(--shadow-card)]">
        {items.map((i) => (
          <li key={i.dishId} className="tnum flex justify-between gap-3 px-4 py-2.5">
            <span>{i.qty}× {i.name}{i.note && <span className="block text-[13px] text-ink-3">{i.note}</span>}</span>
            <span>{formatPrice(i.unitPrice * i.qty)}</span>
          </li>
        ))}
        <li className="tnum flex justify-between px-4 py-2.5 font-semibold"><span>Total com serviço</span><span>{formatPrice(total)}</span></li>
      </ul>
      <ButtonLink href="/" size="lg" className="mt-8 w-full">Voltar ao cardápio</ButtonLink>
    </div>
  );
}
