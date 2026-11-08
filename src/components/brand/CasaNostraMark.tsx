export function CasaNostraMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex flex-col leading-none">
      <span className={`font-serif font-semibold text-ink ${compact ? 'text-[19px]' : 'text-[21px]'}`}>Casa Nostra</span>
      {!compact && <span className="mt-1 text-[12px] text-ink-3">Cozinha italiana contemporânea</span>}
    </span>
  );
}
