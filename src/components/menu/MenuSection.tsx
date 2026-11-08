import type { Category, Dish } from '@/types/menu';
import { DishTile } from './DishTile';

export function MenuSection({ category, dishes }: { category: Category; dishes: Dish[] }) {
  return (
    <section id={`cat-${category.id}`} aria-labelledby={`h-${category.id}`} className="pt-10 sm:pt-14">
      <div className="mx-auto mb-4 flex max-w-6xl items-baseline justify-between px-4 sm:px-6">
        <h2 id={`h-${category.id}`} className="text-[30px] leading-none sm:text-4xl">{category.name}</h2>
        <span className="tnum text-sm text-ink-3">{dishes.length} {dishes.length === 1 ? 'prato' : 'pratos'}</span>
      </div>
      <div className="mx-auto max-w-6xl sm:px-6">
        <div className="grid grid-cols-2 gap-px sm:overflow-hidden sm:rounded-tile sm:p-px md:grid-cols-3 lg:grid-cols-4">
          {dishes.map((d, i) => <DishTile key={d.id} dish={d} index={i} />)}
        </div>
      </div>
    </section>
  );
}
