'use client';
import { ExternalHeader } from '@/components/headers/ExternalHeader';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ExternalHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog DentalCare Pro</h1>
          <p className="text-xl text-gray-600">Artigos e dicas sobre gestão odontológica</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Article 1 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-blue-500 to-teal-500"></div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Como otimizar o agendamento de consultas
              </h2>
              <p className="text-gray-600 mb-4">
                Descubra as melhores práticas para gerenciar a agenda da sua clínica odontológica...
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>15 de Agosto, 2025</span>
                <span className="mx-2">•</span>
                <span>5 min de leitura</span>
              </div>
            </div>
          </article>

          {/* Article 2 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Gestão financeira para clínicas odontológicas
              </h2>
              <p className="text-gray-600 mb-4">
                Aprenda a controlar as finanças da sua clínica e aumentar a rentabilidade...
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>12 de Agosto, 2025</span>
                <span className="mx-2">•</span>
                <span>8 min de leitura</span>
              </div>
            </div>
          </article>

          {/* Article 3 */}
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-green-500 to-blue-500"></div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Tecnologia na odontologia moderna
              </h2>
              <p className="text-gray-600 mb-4">
                Como a tecnologia está transformando o atendimento odontológico...
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <span>10 de Agosto, 2025</span>
                <span className="mx-2">•</span>
                <span>6 min de leitura</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

