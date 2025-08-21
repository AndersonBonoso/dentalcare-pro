'use client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/80">Bem-vindo ao DentalCare Pro</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-32 w-32 bg-blue-100 rounded-lg flex items-center justify-center">
                <img 
                  src="/assets/icone-paciente-48px.png" 
                  alt="Pacientes" 
                  className="h-24 w-24"
                />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-32 w-32 bg-green-100 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-24 w-24 text-green-600">
                  <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Consultas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-32 w-32 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-24 w-24 text-yellow-600">
                  <path fill="currentColor" d="M7 15h2c0 1.08 1.37 2 3 2s3-.92 3-2c0-1.1-1.04-1.5-3.24-2.03C9.64 12.44 7 11.78 7 9c0-1.79 1.47-3.31 3.5-3.82V3h3v2.18C15.53 5.69 17 7.21 17 9h-2c0-1.08-1.37-2-3-2s-3 .92-3 2c0 1.1 1.04 1.5 3.24 2.03C14.36 11.56 17 12.22 17 15c0 1.79-1.47 3.31-3.5 3.82V21h-3v-2.18C8.47 18.31 7 16.79 7 15z"/>
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Receita Mensal</p>
                <p className="text-2xl font-bold text-gray-900">R$ 12.500</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-32 w-32 bg-purple-100 rounded-lg flex items-center justify-center">
                <img 
                  src="/assets/icone-profissionais-48.png" 
                  alt="Profissionais" 
                  className="h-24 w-24"
                />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Profissionais</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Próximas Consultas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-900 font-medium">Maria Silva</p>
                  <p className="text-gray-600 text-sm">Limpeza</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 text-sm">09:00</p>
                  <p className="text-gray-600 text-xs">Hoje</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-900 font-medium">João Santos</p>
                  <p className="text-gray-600 text-sm">Consulta</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 text-sm">10:30</p>
                  <p className="text-gray-600 text-xs">Hoje</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-900 font-medium">Ana Costa</p>
                  <p className="text-gray-600 text-sm">Tratamento</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 text-sm">14:00</p>
                  <p className="text-gray-600 text-xs">Hoje</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Atividade Recente</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900 text-sm">Consulta finalizada - Maria Silva</p>
                  <p className="text-gray-600 text-xs">2 horas atrás</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900 text-sm">Novo paciente cadastrado - Pedro Lima</p>
                  <p className="text-gray-600 text-xs">4 horas atrás</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900 text-sm">Agendamento reagendado - Ana Costa</p>
                  <p className="text-gray-600 text-xs">1 dia atrás</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

