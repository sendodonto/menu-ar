import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Schibsted_Grotesk } from 'next/font/google';
import { Toaster } from '@/components/ui/Toaster';
import { Viewer3DDialog } from '@/components/viewer/Viewer3DDialog';
import './globals.css';

const bodoni = Bodoni_Moda({ subsets: ['latin'], variable: '--font-bodoni', axes: ['opsz'], display: 'swap' });
const schibsted = Schibsted_Grotesk({ subsets: ['latin'], variable: '--font-schibsted', display: 'swap' });

export const metadata: Metadata = {
  title: 'Casa Nostra · Cardápio',
  description: 'Cardápio da Casa Nostra com pratos em 3D e na sua mesa, em realidade aumentada. Demonstração MENU AR.',
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/favicon.svg` },
};

export const viewport: Viewport = { themeColor: '#f8f7f4', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${bodoni.variable} ${schibsted.variable}`}>
      <body className="min-h-dvh bg-glaze text-ink">
        {children}
        <Viewer3DDialog />
        <Toaster />
      </body>
    </html>
  );
}
