'use client';
import Link from 'next/link';
import { Box, Plus, ScanLine } from 'lucide-react';
import { useViewer } from '@/components/viewer/viewer-store';
import { arHref } from '@/components/viewer/links';
import { useCart } from '@/store/cart';
import { toast } from '@/store/toast';
import type { Dish } from '@/types/menu';

const icon = 'press relative z-10 grid size-11 place-items-center rounded-tile border border-grout bg-tile text-ink hover:border-grout-2 hover:bg-glaze-2';

/** Compact tile actions: 3D, on my table (only when a model exists) and quick add. */
export function DishActions({ dish }: { dish: Dish }) {
  const open = useViewer((s) => s.open);
  const add = useCart((s) => s.add);
  return (
    <div className="flex items-center gap-1.5">
      {dish.model && (
        <>
          <button type="button" className={icon} onClick={() => open(dish)} aria-label={`Ver ${dish.name} em 3D`} title="Ver em 3D">
            <Box size={18} />
          </button>
          <Link href={arHref(dish.id)} className={icon} aria-label={`Ver ${dish.name} na minha mesa`} title="Ver na minha mesa">
            <ScanLine size={18} />
          </Link>
        </>
      )}
      <button
        type="button"
        className={`${icon} ml-auto border-clay bg-clay text-glaze hover:border-clay-ink hover:bg-clay-ink`}
        onClick={() => { add(dish.id); toast(`${dish.name} adicionado ao pedido`); }}
        aria-label={`Adicionar ${dish.name} ao pedido`}
        title="Adicionar ao pedido"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
