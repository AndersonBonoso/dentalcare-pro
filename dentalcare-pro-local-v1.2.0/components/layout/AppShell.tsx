'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useProfile } from '@/lib/useProfile';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Package, 
  Calculator, 
  Settings,
  Home,
  UserPlus,
  CreditCard
} from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { profile, loading } = useProfile();
  const pathname = usePathname();

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, []);

  async function signOut() {
    await supabaseBrowser.auth.signOut();
    setMenuOpen(false);
    location.href = '/login';
  }

  // Se não está logado, redirecionar para login (exceto se já estiver em páginas de auth)
  useEffect(() => {
    if (!loading && !profile && !pathname.startsWith('/login') && !pathname.startsWith('/cadastro')) {
      window.location.href = '/login';
    }
  }, [profile, loading, pathname]);

  // Se não está logado, mostrar apenas o conteúdo (para páginas de login/cadastro)
  if (!profile && (pathname.startsWith('/login') || pathname.startsWith('/cadastro'))) {
    return (
      <div className="min-h-screen bg-dc-gradient">
        {children}
      </div>
    );
  }

  // Se ainda está carregando
  if (loading) {
    return (
      <div className="min-h-screen bg-dc-gradient flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  // Se não tem perfil, não renderizar nada (vai redirecionar)
  if (!profile) {
    return null;
  }

  const display = profile.is_master ? `Master: ${profile.nome ?? 'Usuário'}` : `Usuário: ${profile.nome ?? 'Usuário'}`;

  // Verificar se usuário tem permissão para acessar uma rota
  const hasPermission = (permission: 'agendamento' | 'checkout' | 'pacientes' | 'profissionais') => {
    if (profile.is_master) return true;
    return profile.permissoes?.[permission] ?? false;
  };

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home, show: true },
    { href: '/agenda', label: 'Agenda', icon: Calendar, show: hasPermission('agendamento') },
    { href: '/pacientes', label: 'Pacientes', icon: Users, show: hasPermission('pacientes') },
    { href: '/profissionais', label: 'Profissionais', icon: UserPlus, show: hasPermission('profissionais') },
    { href: '/catalogo-servicos', label: 'Serviços', icon: Package, show: profile.is_master },
    { href: '/financeiro', label: 'Financeiro', icon: DollarSign, show: hasPermission('checkout') },
    { href: '/precificacao', label: 'Precificação', icon: Calculator, show: profile.is_master },
    { href: '/configuracoes', label: 'Configurações', icon: Settings, show: profile.is_master },
  ];

  return (
    <div className="min-h-screen">
      <header className="w-full bg-white/95 backdrop-blur border-b fixed top-0 inset-x-0 z-40">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(o=>!o)} aria-label="Abrir menu" className="p-2 rounded-lg hover:bg-slate-100">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-dc-ink"><path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2Z"/></svg>
            </button>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'linear-gradient(135deg,#2563eb 0%,#00BFA6 100%)' }}>
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-white"><path fill="currentColor" d="M12 2c2.9 0 5.5 1.9 6.2 4.8c.4 1.6.1 3.5-.8 5c-.7 1.3-1.6 2.1-2.5 2.3c-.6.1-1.1-.1-1.5-.5c-.4-.5-.9-1.3-1.4-2.6c-.1-.3-.3-.5-.5-.5s-.4.2-.5.5c-.5 1.3-1 2.1-1.4 2.6c-.4.4-.9.6-1.5.5c-.9-.2-1.8-1-2.5-2.3c-.9-1.5-1.2-3.4-.8-5C6.5 3.9 9.1 2 12 2z"/></svg>
              </span>
              <div className="leading-tight">
                <div className="text-lg font-semibold text-dc-ink">DentalCare Pro</div>
                <div className="text-xs text-dc-fg/70 -mt-0.5">Sistema de Gestão Odontológica</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-dc-fg/80 relative" ref={dropdownRef}>
            <button onClick={()=>setMenuOpen(o=>!o)} className="inline-flex items-center gap-2 hover:underline px-3 py-2 rounded-lg hover:bg-slate-100">
              <span>{display}</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg py-2 z-50">
                <Link href="/perfil" className="block px-4 py-2 hover:bg-slate-50 text-sm">Meu Perfil</Link>
                <button onClick={signOut} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm">Sair</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className={`sidebar z-30 ${open ? 'open' : ''}`}>
        <nav className="p-4 text-sm space-y-2">
          {menuItems.map((item) => {
            if (!item.show) return null;
            
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-dc-primary text-white' 
                    : 'hover:bg-slate-100 text-dc-fg'
                }`} 
                href={item.href}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4 text-center text-xs text-gray-400 border-t">
          V - 1.1.0
        </div>
      </aside>

      <div className={`backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      <main className={`transition-all duration-300 pt-16 ${open ? 'md:ml-80' : 'md:ml-0'}`}>
        <div className="bg-dc-gradient min-h-[calc(100vh-64px)]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
