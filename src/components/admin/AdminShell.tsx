'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ExternalLink, LayoutGrid, LogOut, ReceiptText, Tags, UtensilsCrossed } from 'lucide-react';
import { CasaNostraMark } from '@/components/brand/CasaNostraMark';
import { useSession } from '@/hooks/useSession';
import { getRepository, isSupabaseConfigured } from '@/services/repository';

const NAV = [
  { href: '/admin/painel/', label: 'Visão geral', icon: LayoutGrid },
  { href: '/admin/pedidos/', label: 'Pedidos', icon: ReceiptText },
  { href: '/admin/pratos/', label: 'Pratos', icon: UtensilsCrossed },
  { href: '/admin/categorias/', label: 'Categorias', icon: Tags },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (session === null) router.replace('/admin/');
  }, [session, router]);

  if (!session) return <div className="skeleton min-h-dvh" aria-busy="true" aria-label="Verificando acesso" />;

  const signOut = async () => {
    await (await getRepository()).signOut();
    router.replace('/admin/');
  };
  const active = (href: string) => path.startsWith(href.replace(/\/$/, ''));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 z-20 border-b border-grout bg-glaze lg:h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-3 lg:block lg:px-5 lg:py-6">
          <Link href="/admin/painel/" aria-label="Painel Casa Nostra"><CasaNostraMark compact /></Link>
          <button type="button" onClick={signOut} className="press inline-flex h-10 items-center gap-1.5 rounded-tile px-3 text-sm text-ink-2 hover:bg-glaze-2 lg:hidden">
            <LogOut size={16} /> Sair
          </button>
        </div>
        <nav aria-label="Seções do painel" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2 lg:flex-col lg:px-3 lg:pb-0">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? 'page' : undefined}
              className={`press inline-flex h-10 shrink-0 items-center gap-2.5 rounded-tile px-3 text-[14px] font-medium ${active(href) ? 'bg-clay-soft text-clay-ink' : 'text-ink-2 hover:bg-glaze-2 hover:text-ink'}`}
            >
              <Icon size={17} aria-hidden /> {label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-5 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block lg:pb-6">
          <div className="border-t border-grout pt-4 text-[13px] text-ink-3">
            <p className="truncate">{session.email}</p>
            <p className="mt-0.5">{isSupabaseConfigured ? 'Conectado ao Supabase' : 'Modo demonstração · dados neste navegador'}</p>
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <Link href="/" className="press inline-flex h-9 items-center gap-2 rounded-tile px-2 text-[14px] text-ink-2 hover:bg-glaze-2"><ExternalLink size={15} /> Ver cardápio</Link>
            <button type="button" onClick={signOut} className="press inline-flex h-9 items-center gap-2 rounded-tile px-2 text-[14px] text-ink-2 hover:bg-glaze-2"><LogOut size={15} /> Sair</button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-4 pb-16 pt-6 sm:px-8 lg:pt-10">{children}</main>
    </div>
  );
}

export function AdminHeading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <h1 className="text-[34px] leading-none sm:text-[40px]">{title}</h1>
      {children}
    </div>
  );
}
