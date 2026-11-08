export function MenuSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando cardápio">
      <div className="mx-auto max-w-6xl sm:mt-6 sm:px-0">
        <div className="skeleton aspect-[5/4] sm:aspect-[16/7] sm:rounded-tile" />
        <div className="space-y-3 px-4 py-5">
          <div className="skeleton h-8 w-2/3 rounded-tile" />
          <div className="skeleton h-4 w-full rounded-tile" />
          <div className="skeleton h-11 w-full rounded-tile" />
        </div>
      </div>
      <div className="mx-auto mt-6 grid max-w-6xl grid-cols-2 gap-px bg-grout md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-tile">
            <div className="skeleton aspect-square" />
            <div className="space-y-2 p-3">
              <div className="skeleton h-5 w-4/5 rounded-tile" />
              <div className="skeleton h-4 w-1/2 rounded-tile" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
