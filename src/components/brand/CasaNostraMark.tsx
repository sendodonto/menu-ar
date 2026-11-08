import { TileMotif } from './TileMotif';

export function CasaNostraMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <TileMotif className={compact ? 'size-8' : 'size-9'} />
      <span className="flex flex-col leading-none">
        <span className="serif text-[19px] font-semibold tracking-[0.02em] text-ink">Casa Nostra</span>
        {!compact && <span className="mt-1 text-[12px] text-ink-3">Cucina italiana contemporanea</span>}
      </span>
    </span>
  );
}
