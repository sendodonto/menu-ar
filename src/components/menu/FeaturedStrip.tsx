import Link from 'next/link';
import { dishHref } from '@/components/viewer/links';
import { formatPrice } from '@/lib/format';
import type { Dish } from '@/types/menu';
import { DishPhoto } from './DishPhoto';

/** The restaurant's own picks, shown as a horizontal run of tiles. */
export function FeaturedStrip({ dishes }: { dishes: Dish[] }) {
  if (!dishes.length) return null;
  return (
    <section aria-labelledby="destaques" className="pt-10 sm:pt-14">
      <div className="mx-auto mb-4 flex max-w-6xl items-baseline justify-between gap-4 px-4 sm:px-6">
        <h2 id="destaques" className="text-[30px] leading-none sm:text-4xl">Destaques da casa</h2>
        <span className="hidden text-sm text-ink-3 sm:inline">Escolhas do chef</span>
      </div>
      <ul className="no-scrollbar mx-auto flex max-w-6xl snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:grid sm:grid-cols-3 sm:gap-px sm:overflow-visible sm:px-6 sm:pb-0">
        {dishes.map((d, i) => (
          <li key={d.id} className="tile-set w-[68%] shrink-0 snap-start sm:w-auto" style={{ '--i': i } as React.CSSProperties}>
            <Link href={dishHref(d.id)} className="press group block h-full overflow-hidden rounded-tile border border-grout bg-tile hover:shadow-lift sm:rounded-none sm:border-0 sm:shadow-[0_0_0_1px_var(--color-grout)]">
              <DishPhoto src={d.photo} alt={d.name} className="aspect-[4/3]" sizes="(min-width: 640px) 33vw, 68vw" />
              <div className="flex items-baseline justify-between gap-3 p-3.5">
                <span className="serif text-[19px] leading-tight">{d.name}</span>
                <span className="tnum shrink-0 rounded-[2px] bg-clay-soft px-1.5 py-0.5 text-[14px] font-semibold text-clay-ink">{formatPrice(d.price)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
