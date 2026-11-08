import Link from 'next/link';
import { dishHref } from '@/components/viewer/links';
import { formatPrice } from '@/lib/format';
import type { Dish } from '@/types/menu';
import { DishPhoto } from './DishPhoto';
import { ThreeDBadge } from './ThreeDBadge';

/** The chef's picks: large photo cards in a horizontal, snapping row. */
export function FeaturedStrip({ dishes }: { dishes: Dish[] }) {
  if (!dishes.length) return null;
  return (
    <section aria-labelledby="destaques" className="pt-8 sm:pt-12">
      <h2 id="destaques" className="mx-auto mb-3 max-w-5xl px-4 font-serif text-[26px] leading-none sm:px-6 sm:text-3xl">Destaques do chef</h2>
      <ul className="no-scrollbar mx-auto flex max-w-5xl snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:scroll-px-6 sm:px-6">
        {dishes.map((d, i) => (
          <li key={d.id} className="tile-set w-[72%] shrink-0 snap-start sm:w-[300px]" style={{ '--i': i } as React.CSSProperties}>
            <Link href={dishHref(d.id)} className="press group block">
              <div className="relative overflow-hidden rounded-tile">
                <DishPhoto src={d.photo} alt={d.name} className="aspect-[4/5] transition-transform duration-500 group-hover:scale-[1.02]" sizes="(min-width: 640px) 300px, 72vw" priority={i < 2} />
                {d.model && <ThreeDBadge className="absolute left-2.5 top-2.5" />}
              </div>
              <p className="mt-2.5 text-[16px] font-semibold leading-snug">{d.name}</p>
              <p className="tnum text-[15px] text-ink-2">{formatPrice(d.price)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
