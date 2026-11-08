import { Box } from 'lucide-react';

export function ThreeDBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-[3px] text-[11px] font-semibold text-ink shadow-sm ${className}`}>
      <Box size={12} className="text-clay" aria-hidden /> 3D
    </span>
  );
}
