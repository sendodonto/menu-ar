export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="press inline-flex h-10 items-center gap-2 rounded-tile px-2 text-[13px] text-ink-2 hover:bg-glaze-2"
    >
      <span className={`relative block h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-ramina' : 'bg-grout-2'}`}>
        <span className={`absolute left-0 top-0.5 size-4 rounded-full bg-tile shadow transition-transform duration-300 ease-[var(--ease-settle)] ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="w-12 text-left">{label}</span>
    </button>
  );
}
