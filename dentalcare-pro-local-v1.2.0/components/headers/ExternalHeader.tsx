'use client';
import Link from 'next/link';
import Image from 'next/image';

export function ExternalHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src="/assets/logo-header.png"
                alt="DentalCare Pro"
                width={64}
                height={64}
                className="rounded-full"
              />
              <div>
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
                <p className="text-xs text-gray-600">Sistema de Gestão Odontológica</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/blog" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Blog
            </Link>
            <Link 
              href="/contato" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Contato
            </Link>
            <Link 
              href="/parceiros" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Parceiros
            </Link>
            
            {/* Auth Links */}
            <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-gray-200">
              <Link 
                href="/login" 
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link 
                href="/cadastro" 
                className="bg-gradient-to-r from-blue-600 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-teal-600 transition-all shadow-sm"
              >
                Criar Conta
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Abrir menu principal</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Hidden by default */}
      <div className="md:hidden hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
          <Link href="/blog" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
            Blog
          </Link>
          <Link href="/contato" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
            Contato
          </Link>
          <Link href="/parceiros" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
            Parceiros
          </Link>
          <div className="border-t border-gray-200 pt-4 pb-3">
            <Link href="/login" className="text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
              Entrar
            </Link>
            <Link href="/cadastro" className="bg-gradient-to-r from-blue-600 to-teal-500 text-white block px-3 py-2 rounded-md text-base font-medium mx-3 mt-2 text-center">
              Criar Conta
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

