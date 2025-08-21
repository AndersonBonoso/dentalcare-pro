'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface SidebarCompleteProps {
  onClose: () => void;
}

export function SidebarComplete({ onClose }: SidebarCompleteProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: '/icons/dashboard_transparente.png'
    },
    {
      name: 'Pacientes',
      href: '/pacientes',
      icon: '/icons/pacientes_transparente.png'
    },
    {
      name: 'Profissionais',
      href: '/profissionais',
      icon: '/icons/profissionais_transparente.png'
    },
    {
      name: 'Agenda',
      href: '/agenda',
      icon: '/icons/calendario_transparente.png'
    },
    {
      name: 'Financeiro',
      href: '/financeiro',
      icon: '/icons/financeiro_transparente.png'
    },
    {
      name: 'Estoque',
      href: '/estoque',
      icon: '/icons/estoque_transparente.png'
    },
    {
      name: 'Catálogo de Serviços',
      href: '/catalogo-servicos',
      icon: '/icons/catalogo_servicos_transparente.png'
    },
    {
      name: 'Configurações',
      href: '/configuracoes',
      icon: '/icons/configuracoes_transparente.png'
    },
    {
      name: 'Luz-IA',
      href: '/luzia',
      icon: '/icons/luzia_new.png',
      isSpecial: true
    }
  ];

  return (
    <div className="w-72 h-screen flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-teal-500">
      {/* Close button */}
      <div className="flex justify-end p-2">
        <button
          onClick={onClose}
          className="p-1 rounded-md text-white hover:text-gray-200 hover:bg-white/10"
        >
          <span className="sr-only">Fechar menu</span>
          ✕
        </button>
      </div>

      {/* White container for navigation */}
      <div className="flex-1 mx-3 mb-3 bg-white rounded-lg shadow-lg flex flex-col">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isSpecial = item.isSpecial;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center px-3 py-1.5 rounded-lg text-base transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-500/50 border-r-4 border-white transform scale-105' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-teal-500 hover:text-white hover:shadow-lg hover:shadow-blue-500/50 hover:border-r-4 hover:border-white hover:transform hover:scale-105 hover:bg-gray-50'
                  }
                  ${isSpecial ? 'font-bold' : 'font-medium'}
                `}
              >
                <div className={`mr-3 flex-shrink-0 ${isActive ? 'brightness-0 invert' : ''} hover:brightness-0 hover:invert ${isSpecial ? 'w-12 h-12' : 'w-10 h-10'}`}>
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={isSpecial ? 48 : 40}
                    height={isSpecial ? 48 : 40}
                    className="w-full h-full object-contain"
                  />
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Version */}
        <div className="px-4 py-2 border-t border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-500">v1.2.0</p>
        </div>
      </div>
    </div>
  );
}

