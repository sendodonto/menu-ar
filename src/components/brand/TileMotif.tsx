/** The one hand-painted majolica tile: four ramina leaves and a terracotta flower inside a clay border. */
export function TileMotif({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="1" y="1" width="46" height="46" rx="3" fill="#FDFCFA" stroke="#B4532F" strokeWidth="2" />
      <rect x="5" y="5" width="38" height="38" rx="1.5" fill="none" stroke="#B4532F" strokeWidth="0.75" />
      <g fill="#5E6B2E">
        <path d="M24 8c3.5 4 3.5 8.5 0 12-3.5-3.5-3.5-8 0-12Z" />
        <path d="M24 40c3.5-4 3.5-8.5 0-12-3.5 3.5-3.5 8 0 12Z" />
        <path d="M8 24c4-3.5 8.5-3.5 12 0-3.5 3.5-8 3.5-12 0Z" />
        <path d="M40 24c-4-3.5-8.5-3.5-12 0 3.5 3.5 8 3.5 12 0Z" />
      </g>
      <g fill="#B4532F">
        <circle cx="24" cy="24" r="4.2" />
        <circle cx="11" cy="11" r="1.6" /><circle cx="37" cy="11" r="1.6" /><circle cx="11" cy="37" r="1.6" /><circle cx="37" cy="37" r="1.6" />
      </g>
      <circle cx="24" cy="24" r="1.6" fill="#F3E3DA" />
    </svg>
  );
}
