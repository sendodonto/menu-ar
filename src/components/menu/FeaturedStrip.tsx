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
      <ul className="no-scrollbar mx-auto flex max-w-6xl snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:px-6">
        {dishes.map((d, i) => (
          <li key={d.id} className="tile-set w-[68%] shrink-0 snap-start sm:w-72" style={{ '--i': i } as React.CSSProperties}>
            <Link href={dishHref(d.id)} className="press group block overflow-hidden rounded-tile border border-grout bg-tile hover:shadow-lift">
              <DishPhoto src={d.photo} alt={d.name} className="aspect-[4/3]" sizes="(min-width: 640px) 288px, 68vw" />
              <div className="flex items-baseline justify-between gap-3 p-3.5">
                <span className="serif text-[19px] leading-tight">{d.name}</span>
                <span className="tnum shrink-0 text-[15px] font-semibold text-clay-ink">{formatPrice(d.price)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
