export function MenuSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando cardápio" className="mx-auto max-w-3xl px-4 pt-7 sm:px-6">
      <div className="skeleton h-10 w-48 rounded-lg" />
      <div className="skeleton mt-3 h-4 w-64 rounded" />
      <div className="mt-8 flex gap-3 overflow-hidden">
        {[0, 1].map((i) => <div key={i} className="skeleton aspect-[4/5] w-[72%] shrink-0 rounded-tile sm:w-[300px]" />)}
      </div>
      <div className="mt-8 divide-y divide-grout rounded-tile bg-tile">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-4 p-4">
            <div className="flex-1 space-y-2"><div className="skeleton h-4 w-2/3 rounded" /><div className="skeleton h-3 w-full rounded" /><div className="skeleton h-4 w-16 rounded" /></div>
            <div className="skeleton size-[104px] rounded-tile" />
          </div>
        ))}
      </div>
    </div>
  );
}
