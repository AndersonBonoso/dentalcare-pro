'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface SidebarPreviewProps {
  onClose: () => void;
}

export function SidebarPreview({ onClose }: SidebarPreviewProps) {
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
      name: 'LuzIA',
      href: '/luzia',
      icon: '/icons/luzia_head_transparente.png'
    }
  ];

  return (
    <div className="w-64 h-screen flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-teal-500">
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
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center px-3 py-2 rounded-lg text-base font-medium transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-500/50 border-r-4 border-white transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <div className={`mr-3 w-6 h-6 flex-shrink-0 ${isActive ? 'brightness-0 invert' : ''}`}>
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Version */}
        <div className="px-6 py-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">v1.2.0</p>
        </div>
      </div>
    </div>
  );
}

