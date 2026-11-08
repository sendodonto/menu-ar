import type { Category, Dish } from '@/types/menu';
import { DishRow } from './DishRow';

export function MenuSection({ category, dishes }: { category: Category; dishes: Dish[] }) {
  return (
    <section id={`cat-${category.id}`} aria-labelledby={`h-${category.id}`} className="mx-auto max-w-5xl px-4 pt-9 sm:px-6 sm:pt-12">
      <h2 id={`h-${category.id}`} className="mb-3 font-serif text-[26px] leading-none sm:text-3xl">{category.name}</h2>
      <ul className="grid divide-y divide-grout overflow-hidden rounded-tile bg-tile shadow-[var(--shadow-card)] md:grid-cols-2 md:divide-y-0 md:[&>li]:border-b md:[&>li]:border-grout md:[&>li:nth-child(odd)]:border-r">
        {dishes.map((d) => <DishRow key={d.id} dish={d} />)}
      </ul>
    </section>
  );
}
