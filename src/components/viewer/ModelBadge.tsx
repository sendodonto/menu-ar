import { Ruler } from 'lucide-react';
import { formatDimensions } from '@/lib/format';
import type { DishModel } from '@/types/menu';

const KIND_LABEL: Record<DishModel['kind'], string> = {
  scan: 'Escaneamento 3D real',
  demo: 'Modelo 3D demonstrativo',
  upload: 'Modelo 3D do restaurante',
};

export function ModelKind({ model }: { model: DishModel }) {
  return <span className="text-[13px] text-ink-2">{KIND_LABEL[model.kind]}</span>;
}

export function RealSize({ model, className = '' }: { model: DishModel; className?: string }) {
  if (!model.dimensions) return null;
  return (
    <span className={`tnum inline-flex items-center gap-1.5 rounded-full bg-glaze-2 px-3 py-1 text-[13px] font-medium text-ink ${className}`}>
      <Ruler size={14} className="text-clay" aria-hidden />
      Tamanho real · {formatDimensions(model.dimensions)}
    </span>
  );
}
