import Link from 'next/link';
import { TileMotif } from '@/components/brand/TileMotif';

export function MenuFooter() {
  return (
    <footer className="mt-16 border-t border-grout bg-glaze-2 pb-32">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div className="flex items-start gap-3">
          <TileMotif className="size-10 shrink-0" />
          <div>
            <p className="serif text-xl">Casa Nostra</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-2">Restaurante fictício criado para demonstração. Fotos de pratos ilustrativas.</p>
          </div>
        </div>
        <div className="text-sm leading-relaxed text-ink-2">
          <p className="font-medium text-ink">Alergias e restrições</p>
          <p className="mt-1">Cada prato lista seus alérgenos. Em caso de dúvida, fale com a equipe antes de pedir.</p>
        </div>
        <div className="text-sm leading-relaxed text-ink-2 sm:text-right">
          <p>Cardápio em 3D e realidade aumentada por <span className="font-semibold text-ink">MENU AR</span></p>
          <Link href="/admin/" className="mt-2 inline-block font-medium text-clay-ink underline">Área do restaurante</Link>
        </div>
      </div>
    </footer>
  );
}
