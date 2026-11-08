'use client';
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Category } from '@/types/menu';

type Props = { categories: Category[]; query: string; onQuery: (q: string) => void };

/** Sticky rail: category chips that scroll to their section (with scroll-spy) and an expanding search. */
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
      { rootMargin: '-140px 0px -55% 0px' },
    );
    categories.forEach((c) => {
      const el = document.getElementById(`cat-${c.id}`);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [categories, query]);

  useEffect(() => {
    const chip = rail.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (chip && rail.current) rail.current.scrollTo({ left: chip.offsetLeft - rail.current.clientWidth / 2 + chip.clientWidth / 2, behavior: 'smooth' });
  }, [active]);

  useEffect(() => {
    if (searching) input.current?.focus();
  }, [searching]);

  const closeSearch = () => {
    onQuery('');
    setSearching(false);
  };

  const chip = 'press shrink-0 h-10 rounded-tile border px-3.5 text-[14px] font-medium whitespace-nowrap';
  return (
    <nav aria-label="Categorias do cardápio" className="sticky top-[calc(64px+env(safe-area-inset-top))] z-20 border-b border-grout bg-glaze">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6">
        {searching ? (
          <div className="flex w-full items-center gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Buscar no cardápio</span>
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
              <input
                ref={input}
                type="search"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') closeSearch(); }}
                placeholder="Prato, ingrediente…"
                className="h-10 w-full rounded-tile border border-grout bg-tile pl-10 pr-3 text-[15px] placeholder:text-ink-3 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
              />
            </label>
            <button type="button" className="press grid size-10 place-items-center rounded-tile hover:bg-glaze-2" onClick={closeSearch} aria-label="Fechar busca">
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <button type="button" onClick={() => setSearching(true)} className={`${chip} grid w-10 place-items-center border-grout bg-tile px-0 hover:border-grout-2`} aria-label="Buscar no cardápio">
              <Search size={18} />
            </button>
            <div ref={rail} className="no-scrollbar -mr-4 flex gap-1.5 overflow-x-auto pr-4 sm:mr-0 sm:pr-0">
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={`#cat-${c.id}`}
                  data-cat={c.id}
                  aria-current={active === c.id ? 'true' : undefined}
                  onClick={() => setActive(c.id)}
                  className={`${chip} inline-flex items-center ${active === c.id ? 'border-clay bg-clay-soft text-clay-ink' : 'border-grout bg-tile text-ink hover:border-grout-2'}`}
                >
                  {c.name}
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
