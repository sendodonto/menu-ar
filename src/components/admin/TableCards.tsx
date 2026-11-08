'use client';
import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { asset } from '@/lib/asset';

/** Printable table cards: a QR that opens the menu already set to that table. */
export function TableCards() {
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(4);
  const [qrs, setQrs] = useState<Record<number, string>>({});
  const tables = Array.from({ length: Math.max(0, Math.min(40, to - from + 1)) }, (_, i) => from + i);

  useEffect(() => {
    const base = `${window.location.origin}${asset('/')}`;
    Promise.all(tables.map(async (n) => [n, await QRCode.toString(`${base}?mesa=${n}`, { type: 'svg', margin: 0, color: { dark: '#2A2420', light: '#FFFFFF' } })] as const))
      .then((list) => setQrs(Object.fromEntries(list)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-3 print:hidden">
        <div className="w-28"><Field label="Da mesa"><Input type="number" min={1} value={from} onChange={(e) => setFrom(Math.max(1, Number(e.target.value)))} /></Field></div>
        <div className="w-28"><Field label="Até a mesa"><Input type="number" min={from} value={to} onChange={(e) => setTo(Math.max(from, Number(e.target.value)))} /></Field></div>
        <Button size="lg" icon={<Printer size={18} />} onClick={() => window.print()}>Imprimir cartões</Button>
        <p className="w-full text-[14px] leading-relaxed text-ink-2">
          Cada cartão tem o QR code da mesa: o cliente abre o cardápio no celular e o pedido já chega com o número da mesa.
        </p>
      </div>

      <div className="grid gap-6 print:block">
        {tables.map((n) => (
          <section key={n} className="flex w-[105mm] break-inside-avoid flex-col gap-[5mm] rounded-tile border border-grout bg-white p-[8mm] text-ink print:mb-[6mm] print:rounded-none">
            <div className="flex w-full items-center justify-between gap-[5mm]">
              <div>
                <p className="serif text-[22px] leading-none">Mesa {n}</p>
                <p className="mt-[2mm] text-[11px] leading-snug text-ink-2">Aponte a câmera do celular para o código e veja o cardápio. Pratos com 3D aparecem na sua mesa.</p>
              </div>
              <div className="size-[26mm] shrink-0" role="img" aria-label={`QR code do cardápio da mesa ${n}`} dangerouslySetInnerHTML={{ __html: qrs[n] ?? '' }} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
