'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Box, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { DishPhoto } from '@/components/menu/DishPhoto';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMenu } from '@/hooks/useMenu';
import { formatPrice, parsePrice } from '@/lib/format';
import { getRepository } from '@/services/repository';
import { toast } from '@/store/toast';
import type { Dish } from '@/types/menu';
import { Switch } from './Switch';

export function DishTable() {
  const { dishes, categories, loading, reload } = useMenu({ includeInactive: true });
  const [cat, setCat] = useState('todas');
  const [q, setQ] = useState('');

  const save = async (d: Dish, msg: string) => {
    try {
      await (await getRepository()).saveDish(d);
      toast(msg);
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Não foi possível salvar.', 'error');
    }
  };
  const remove = async (d: Dish) => {
    if (!confirm(`Excluir “${d.name}” do cardápio? Esta ação não pode ser desfeita.`)) return;
    try {
      await (await getRepository()).deleteDish(d.id);
      toast(`${d.name} excluído`);
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Não foi possível excluir.', 'error');
    }
  };

  if (loading) return <div className="skeleton h-96 rounded-tile" aria-busy="true" aria-label="Carregando pratos" />;
  const list = dishes
    .filter((d) => (cat === 'todas' || d.categoryId === cat) && d.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (categories.findIndex((c) => c.id === a.categoryId) - categories.findIndex((c) => c.id === b.categoryId)) || a.name.localeCompare(b.name));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative min-w-52 flex-1 sm:max-w-xs">
          <span className="sr-only">Buscar prato</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar prato" className="h-10 w-full rounded-tile border border-grout bg-tile pl-9 pr-3 text-[14px] focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20" />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filtrar por categoria" className="h-10 rounded-tile border border-grout bg-tile px-3 text-[14px] focus:border-clay focus:outline-none">
          <option value="todas">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <ButtonLink href="/admin/pratos/editar/" icon={<Plus size={17} />} className="ml-auto">Novo prato</ButtonLink>
      </div>

      {!list.length ? (
        <EmptyState title="Nenhum prato encontrado" body="Ajuste a busca ou cadastre um novo prato." />
      ) : (
        <ul className="divide-y divide-grout overflow-hidden rounded-tile border border-grout bg-tile">
          {list.map((d) => (
            <li key={d.id} className={`flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:gap-4 ${d.active ? '' : 'bg-glaze-2/60'}`}>
              <DishPhoto src={d.photo} alt="" className={`size-14 shrink-0 rounded-tile ${d.active ? '' : 'opacity-50 grayscale'}`} />
              <div className="min-w-0 flex-1">
                <Link href={`/admin/pratos/editar/?id=${d.id}`} className="serif text-[18px] leading-tight hover:text-clay-ink">{d.name}</Link>
                <p className="mt-0.5 flex items-center gap-2 text-[13px] text-ink-3">
                  {categories.find((c) => c.id === d.categoryId)?.name ?? 'Sem categoria'}
                  {d.model && <span className="inline-flex items-center gap-1 text-clay-ink"><Box size={13} /> 3D</span>}
                  {d.featured && <span>· Destaque</span>}
                </p>
              </div>
              <PriceInput dish={d} onSave={(price) => save({ ...d, price }, `Preço de ${d.name} atualizado`)} />
              <Switch checked={d.active} onChange={(active) => save({ ...d, active }, active ? `${d.name} visível no cardápio` : `${d.name} oculto do cardápio`)} label={d.active ? 'Ativo' : 'Inativo'} />
              <div className="flex gap-1">
                <Link href={`/admin/pratos/editar/?id=${d.id}`} className="press grid size-10 place-items-center rounded-tile hover:bg-glaze-2" aria-label={`Editar ${d.name}`}><Pencil size={16} /></Link>
                <button type="button" onClick={() => remove(d)} className="press grid size-10 place-items-center rounded-tile text-ink-3 hover:bg-[#fbeeea] hover:text-danger" aria-label={`Excluir ${d.name}`}><Trash2 size={16} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PriceInput({ dish, onSave }: { dish: Dish; onSave: (cents: number) => void }) {
  const initial = (dish.price / 100).toFixed(2).replace('.', ',');
  const [value, setValue] = useState(initial);
  const [bad, setBad] = useState(false);
  const commit = () => {
    if (value === initial) return;
    const cents = parsePrice(value);
    if (cents === null) return setBad(true);
    setBad(false);
    onSave(cents);
  };
  return (
    <label className="relative">
      <span className="sr-only">Preço de {dish.name}</span>
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-ink-3">R$</span>
      <input
        value={value}
        inputMode="decimal"
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        aria-invalid={bad}
        title={bad ? 'Preço inválido. Use o formato 62,00' : 'Altere e pressione Enter para salvar'}
        className="tnum h-10 w-28 rounded-tile border border-grout bg-tile pl-8 pr-2 text-right text-[14px] focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20 aria-[invalid=true]:border-danger"
      />
    </label>
  );
}
