'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useProfile } from '@/lib/useProfile';
import { SearchBar } from '@/components/SearchBar';
import Image from 'next/image';

export function InternalHeader({ onMenuClick, sidebarOpen }: { 
  onMenuClick: () => void;
  sidebarOpen: boolean;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { profile, loading } = useProfile();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabaseBrowser.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 h-16">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button + Logo */}
          <div className="flex items-center">
            {/* Menu hamburger button */}
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-4"
            >
              <span className="sr-only">Abrir menu lateral</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo - Larger size (doubled) */}
            <div className="flex items-center">
              <Image
                src="/assets/logo-header.png"
                alt="DentalCare Pro"
                width={64}
                height={64}
                className="rounded-full"
              />
              <div className="ml-3">
                <h1 
                  className="text-xl font-bold"
                  style={{
                    background: 'linear-gradient(to right, #1e40af, #0f766e)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  DentalCare Pro
                </h1>
                <p className="text-sm text-gray-600">Sistema de Gestão Odontológica</p>
              </div>
            </div>
          </div>

          {/* Center - Search Bar */}
          <div className="hidden md:flex flex-1 justify-center px-6 max-w-lg">
            <SearchBar />
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center">
            {/* Mobile search button */}
            <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-2">
              <span className="sr-only">Buscar</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Abrir menu do usuário</span>
                <div className="flex items-center space-x-3">
                  {/* Desktop - Show name and role */}
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.is_master ? 'Master' : 'Usuário'}: {profile?.nome}
                    </p>
                  </div>
                  
                  {/* User avatar - Desktop: small circle, Mobile: user icon */}
                  <div className="md:hidden h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Image
                      src="/assets/user-icon.png"
                      alt="Usuário"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  </div>
                  <div className="hidden md:block h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {profile?.nome?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              </button>

              {/* Dropdown menu - Positioned correctly to the right */}
              {userMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {/* Mobile - Show user info */}
                    <div className="md:hidden px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.is_master ? 'Master' : 'Usuário'}: {profile?.nome}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        router.push('/perfil');
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Perfil
                    </button>
                    
                    {profile?.is_master && (
                      <button
                        onClick={() => {
                          router.push('/configuracoes');
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Configurações
                      </button>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

