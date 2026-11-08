'use client';
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import type { Category } from '@/types/menu';

type Props = { categories: Category[]; query: string; onQuery: (q: string) => void };

/** Sticky, translucent category tabs with scroll-spy, plus a search that expands in place. */
export function CategoryRail({ categories, query, onQuery }: Props) {
  const [active, setActive] = useState(categories[0]?.id);
  const [searching, setSearching] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id.replace('cat-', ''));
      },
      { rootMargin: '-120px 0px -60% 0px' },
    );
    categories.forEach((c) => {
      const el = document.getElementById(`cat-${c.id}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [categories, query]);

  useEffect(() => {
    const tab = rail.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (tab && rail.current) rail.current.scrollTo({ left: tab.offsetLeft - rail.current.clientWidth / 2 + tab.clientWidth / 2, behavior: 'smooth' });
  }, [active]);

  useEffect(() => {
    if (searching) input.current?.focus();
  }, [searching]);

  const closeSearch = () => {
    onQuery('');
    setSearching(false);
  };

  return (
    <nav aria-label="Categorias do cardápio" className="material sticky top-[calc(56px+env(safe-area-inset-top))] z-20 mt-6 border-b border-black/[0.06]">
      <div className="mx-auto flex h-12 max-w-3xl items-center gap-1 px-2 sm:px-4">
        {searching ? (
          <div className="flex w-full items-center gap-1 px-2">
            <label className="relative flex-1">
              <span className="sr-only">Buscar no cardápio</span>
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
              <input
                ref={input}
                type="search"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') closeSearch(); }}
                placeholder="Buscar prato ou ingrediente"
                className="h-9 w-full rounded-full bg-black/[0.05] pl-9 pr-3 text-[15px] placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-clay/30"
              />
            </label>
            <button type="button" className="press h-9 rounded-full px-3 text-[15px] font-medium text-clay-ink" onClick={closeSearch}>
              Cancelar
            </button>
          </div>
        ) : (
          <>
            <div ref={rail} className="no-scrollbar flex h-full flex-1 items-stretch overflow-x-auto [mask-image:linear-gradient(90deg,#000_calc(100%-32px),transparent)]">
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={`#cat-${c.id}`}
                  data-cat={c.id}
                  aria-current={active === c.id ? 'true' : undefined}
                  onClick={() => setActive(c.id)}
                  className={`relative flex shrink-0 items-center whitespace-nowrap px-3 text-[15px] transition-colors ${active === c.id ? 'font-semibold text-ink' : 'text-ink-2 hover:text-ink'}`}
                >
                  {c.name}
                  <span className={`absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-clay transition-opacity duration-200 ${active === c.id ? 'opacity-100' : 'opacity-0'}`} aria-hidden />
                </a>
              ))}
            </div>
            <button type="button" onClick={() => setSearching(true)} className="press grid size-10 shrink-0 place-items-center rounded-full text-ink hover:bg-black/[0.05]" aria-label="Buscar no cardápio">
              <Search size={19} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
