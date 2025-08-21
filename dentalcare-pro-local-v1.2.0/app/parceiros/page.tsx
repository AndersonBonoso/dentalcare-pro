'use client';
import { ExternalHeader } from '@/components/headers/ExternalHeader';

export default function ParceirosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ExternalHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nossos Parceiros</h1>
          <p className="text-xl text-gray-600">
            Trabalhamos com as melhores empresas do setor odontológico
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((partner) => (
            <div key={partner} className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-24">
              <div className="w-full h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded flex items-center justify-center">
                <span className="text-gray-500 font-medium">Parceiro {partner}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Partnership Benefits */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Benefícios da Parceria
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Integração Rápida</h3>
              <p className="text-gray-600">
                Conecte facilmente seus sistemas existentes com nossa plataforma
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Suporte Técnico</h3>
              <p className="text-gray-600">
                Equipe especializada para auxiliar na implementação e manutenção
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rede de Contatos</h3>
              <p className="text-gray-600">
                Acesso a uma ampla rede de profissionais e empresas do setor
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Quer se tornar nosso parceiro?</h2>
          <p className="text-xl mb-6">
            Junte-se a nós e faça parte da revolução na gestão odontológica
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Entre em Contato
          </button>
        </div>
      </div>
    </div>
  );
}

