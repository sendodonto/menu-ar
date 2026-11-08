import Link from 'next/link';

export function MenuFooter() {
  return (
    <footer className="mx-auto mt-14 max-w-5xl px-4 pb-32 text-[13px] leading-relaxed text-ink-3 sm:px-6">
      <div className="border-t border-grout pt-6">
        <p>Casa Nostra é um restaurante fictício de demonstração. Fotos ilustrativas.</p>
        <p className="mt-1">Alergias ou restrições? Cada prato lista seus alérgenos; fale com a equipe antes de pedir.</p>
        <p className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <span>Cardápio 3D por <span className="font-semibold text-ink-2">MENU AR</span></span>
          <Link href="/admin/" className="font-medium text-ink-2 underline">Área do restaurante</Link>
        </p>
      </div>
    </footer>
  );
}
