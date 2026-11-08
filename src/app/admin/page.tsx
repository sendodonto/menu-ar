'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LogIn } from 'lucide-react';
import { CasaNostraMark } from '@/components/brand/CasaNostraMark';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { useSession } from '@/hooks/useSession';
import { DEMO_LOGIN } from '@/services/demo-repository';
import { getRepository, isSupabaseConfigured } from '@/services/repository';

export default function AdminLogin() {
  const router = useRouter();
  const session = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) router.replace('/admin/painel/');
  }, [session, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await (await getRepository()).signIn(email, password);
      router.replace('/admin/painel/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="page-enter w-full max-w-sm">
        <Link href="/" className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink"><ArrowLeft size={16} /> Voltar ao cardápio</Link>
        <CasaNostraMark />
        <h1 className="mt-6 text-[34px] leading-none">Área do restaurante</h1>
        <p className="mt-2 text-[15px] text-ink-2">Pedidos, pratos, preços e modelos 3D.</p>

        <form onSubmit={submit} className="mt-6 grid gap-4 rounded-tile border border-grout bg-tile p-5" noValidate>
          <Field label="E-mail">
            <Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
          </Field>
          <Field label="Senha" error={error}>
            <Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!error} />
          </Field>
          <Button type="submit" size="lg" disabled={busy || !email || !password} icon={<LogIn size={18} />}>{busy ? 'Entrando…' : 'Entrar'}</Button>
        </form>

        {!isSupabaseConfigured && (
          <div className="mt-4 rounded-tile border border-dashed border-grout-2 p-4 text-[14px] text-ink-2">
            <p className="font-medium text-ink">Modo demonstração</p>
            <p className="mt-1">Os dados ficam neste navegador. Use <span className="tnum font-medium text-ink">{DEMO_LOGIN.email}</span> e a senha <span className="tnum font-medium text-ink">{DEMO_LOGIN.password}</span>.</p>
            <button type="button" className="mt-2 font-medium text-clay-ink underline" onClick={() => { setEmail(DEMO_LOGIN.email); setPassword(DEMO_LOGIN.password); }}>
              Preencher acesso de demonstração
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
