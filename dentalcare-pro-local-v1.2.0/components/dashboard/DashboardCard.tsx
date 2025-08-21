'use client'

import { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  value: string | number | ReactNode
  icon: ReactNode
  color: string
  onClick?: () => void
  loading?: boolean
}

export default function DashboardCard({ title, value, icon, color, onClick, loading = false }: DashboardCardProps) {
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <div className="text-2xl font-bold text-gray-900">{value}</div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

// Cards específicos
export function PacientesCard({ count, loading }: { count: number, loading?: boolean }) {
  return (
    <DashboardCard
      title="Pacientes"
      value={count}
      icon={<img src="/icons/icone_paciente.png" alt="Pacientes" className="w-8 h-8" />}
      color="bg-blue-50"
      loading={loading}
    />
  )
}

export function ConsultasHojeCard({ count, loading }: { count: number, loading?: boolean }) {
  return (
    <DashboardCard
      title="Consultas Hoje"
      value={count}
      icon={<img src="/icons/icone_calendario.png" alt="Agenda" className="w-8 h-8" />}
      color="bg-green-50"
      loading={loading}
    />
  )
}

export function ReceitaMensalCard({ value, loading }: { value: string, loading?: boolean }) {
  return (
    <DashboardCard
      title="Receita Mensal"
      value={value}
      icon={<img src="/icons/icone_financeiro.png" alt="Financeiro" className="w-8 h-8" />}
      color="bg-yellow-50"
      loading={loading}
    />
  )
}

export function ProfissionaisCard({ count, loading }: { count: number, loading?: boolean }) {
  return (
    <DashboardCard
      title="Profissionais"
      value={count}
      icon={<img src="/icons/icone_profissionais.png" alt="Profissionais" className="w-8 h-8" />}
      color="bg-purple-50"
      loading={loading}
    />
  )
}

export function AtividadeRecenteCard({ loading }: { loading?: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-gray-600 text-sm font-medium mb-4">Atividade Recente</h3>
      {loading ? (
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 animate-pulse rounded w-2/3"></div>
          <div className="h-6 bg-gray-200 animate-pulse rounded w-4/5"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div>
              <p className="text-sm">Consulta finalizada - Maria Silva</p>
              <p className="text-xs text-gray-500">2 horas atrás</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div>
              <p className="text-sm">Novo paciente cadastrado - Pedro Lima</p>
              <p className="text-xs text-gray-500">4 horas atrás</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div>
              <p className="text-sm">Agendamento reagendado - Ana Costa</p>
              <p className="text-xs text-gray-500">1 dia atrás</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AgendaDoDiaCard({ loading }: { loading?: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-gray-600 text-sm font-medium mb-4">Agenda do Dia</h3>
      {loading ? (
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 animate-pulse rounded w-2/3"></div>
          <div className="h-6 bg-gray-200 animate-pulse rounded w-4/5"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">09:00</div>
              <div className="text-sm">Maria Silva - Limpeza</div>
            </div>
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Hoje</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">10:30</div>
              <div className="text-sm">João Pereira - Extração</div>
            </div>
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Hoje</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">14:00</div>
              <div className="text-sm">Ana Costa - Consulta</div>
            </div>
            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Hoje</div>
          </div>
        </div>
      )}
    </div>
  )
}

