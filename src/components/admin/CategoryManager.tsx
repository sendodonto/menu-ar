'use client';
import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useMenu } from '@/hooks/useMenu';
import { getRepository } from '@/services/repository';
import { toast } from '@/store/toast';
import type { Category } from '@/types/menu';
import { Switch } from './Switch';

const slugify = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function CategoryManager() {
  const { categories, dishes, loading, reload } = useMenu({ includeInactive: true });
  const [name, setName] = useState('');

  const run = async (fn: () => Promise<void>, ok: string) => {
    try {
      await fn();
      toast(ok);
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Não foi possível salvar.', 'error');
    }
  };
  const repo = getRepository;

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    let id = slugify(n) || 'categoria';
    while (categories.some((c) => c.id === id)) id += '-2';
    run(async () => (await repo()).saveCategory({ id, name: n, position: categories.length + 1, active: true }), `Categoria ${n} criada`);
    setName('');
  };

  const swap = (i: number, j: number) => {
    const a = categories[i], b = categories[j];
    run(async () => {
      const r = await repo();
      await r.saveCategory({ ...a, position: b.position });
      await r.saveCategory({ ...b, position: a.position });
    }, 'Ordem atualizada');
  };

  if (loading) return <div className="skeleton h-80 rounded-tile" aria-busy="true" aria-label="Carregando categorias" />;
  return (
    <div className="max-w-3xl">
      <ul className="divide-y divide-grout overflow-hidden rounded-tile border border-grout bg-tile">
        {categories.map((c, i) => (
          <CategoryRow
            key={c.id}
            category={c}
            count={dishes.filter((d) => d.categoryId === c.id).length}
            first={i === 0}
            last={i === categories.length - 1}
            onUp={() => swap(i, i - 1)}
            onDown={() => swap(i, i + 1)}
            onSave={(next, msg) => run(async () => (await repo()).saveCategory(next), msg)}
            onDelete={() => confirm(`Excluir a categoria ${c.name}?`) && run(async () => (await repo()).deleteCategory(c.id), `Categoria ${c.name} excluída`)}
          />
        ))}
      </ul>
      <form onSubmit={add} className="mt-4 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nova categoria, ex.: Vinhos" aria-label="Nome da nova categoria" />
        <Button type="submit" icon={<Plus size={17} />} disabled={!name.trim()}>Adicionar</Button>
      </form>
    </div>
  );
}

function CategoryRow({ category: c, count, first, last, onUp, onDown, onSave, onDelete }: {
  category: Category; count: number; first: boolean; last: boolean;
  onUp: () => void; onDown: () => void; onSave: (c: Category, msg: string) => void; onDelete: () => void;
}) {
  const [name, setName] = useState(c.name);
  const icon = 'press grid size-9 place-items-center rounded-tile text-ink-2 hover:bg-glaze-2 disabled:opacity-30';
  return (
    <li className="flex flex-wrap items-center gap-2 p-3 sm:flex-nowrap">
      <div className="flex">
        <button type="button" className={icon} onClick={onUp} disabled={first} aria-label={`Subir ${c.name}`}><ArrowUp size={16} /></button>
        <button type="button" className={icon} onClick={onDown} disabled={last} aria-label={`Descer ${c.name}`}><ArrowDown size={16} /></button>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => name.trim() && name.trim() !== c.name && onSave({ ...c, name: name.trim() }, 'Nome atualizado')}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        aria-label={`Nome da categoria ${c.name}`}
        className="serif h-10 min-w-0 flex-1 rounded-tile border border-transparent bg-transparent px-2 text-[19px] hover:border-grout focus:border-clay focus:bg-tile focus:outline-none"
      />
      <span className="tnum w-20 text-[13px] text-ink-3">{count} {count === 1 ? 'prato' : 'pratos'}</span>
      <Switch checked={c.active} onChange={(active) => onSave({ ...c, active }, active ? `${c.name} visível` : `${c.name} oculta`)} label={c.active ? 'Ativa' : 'Oculta'} />
      <button type="button" className={`${icon} hover:text-danger`} onClick={onDelete} aria-label={`Excluir ${c.name}`}><Trash2 size={16} /></button>
    </li>
  );
}
