import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart3, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatKm, formatPeso, formatCurrency } from '../utils/formatUtils'
import { useAuth } from '../contexts/AuthContext'
import LoadingSkeleton from '../components/LoadingSkeleton'
import EmptyState from '../components/EmptyState'

interface Stats {
  totalLancamentos: number
  totalKm: number
  totalPeso: number
  totalReceita: number
}

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalLancamentos: 0,
    totalKm: 0,
    totalPeso: 0,
    totalReceita: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      const now = new Date()
      const start = startOfMonth(now)
      const end = endOfMonth(now)

      const { data, error } = await supabase
        .from('lancamentos')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .gte('data', format(start, 'yyyy-MM-dd'))
        .lte('data', format(end, 'yyyy-MM-dd'))

      if (error) throw error

      if (data) {
        const totalKm = data.reduce((sum, item) => sum + item.km_total, 0)
        const totalPeso = data.reduce((sum, item) => sum + item.peso, 0)
        const totalReceita = data.reduce((sum, item) => sum + item.preco_total, 0)

        setStats({
          totalLancamentos: data.length,
          totalKm,
          totalPeso,
          totalReceita,
        })
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: 'Total de Viagens',
      value: stats.totalLancamentos,
      icon: BarChart3,
      color: 'bg-blue-500',
      format: (val: number) => val.toString(),
    },
    {
      title: 'Total KM',
      value: stats.totalKm,
      icon: TrendingUp,
      color: 'bg-green-500',
      format: (val: number) => `${formatKm(val)} km`,
    },
    {
      title: 'Total Peso',
      value: stats.totalPeso,
      icon: Package,
      color: 'bg-orange-500',
      format: (val: number) => `${formatPeso(val)} kg`,
    },
    {
      title: 'Receita Total',
      value: stats.totalReceita,
      icon: DollarSign,
      color: 'bg-primary-500',
      format: (val: number) => formatCurrency(val),
    },
  ]

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
        <LoadingSkeleton type="cards" />
      </div>
    )
  }

  const hasData = stats.totalLancamentos > 0
  const mesAtual = format(new Date(), 'MMMM yyyy', { locale: ptBR })

  return (
    <div>
      {/* Header com contexto */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={18} />
          <span>Resumo de {mesAtual}</span>
          {user?.empresa && (
            <>
              <span className="text-gray-400">•</span>
              <span>{user.empresa}</span>
            </>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {card.format(card.value)}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State ou Informações */}
      {!hasData ? (
        <div className="card">
          <EmptyState
            icon={BarChart3}
            title="Nenhum lançamento este mês"
            description="Comece registrando suas viagens para ver as estatísticas aqui. Configure os preços e taxas antes de fazer o primeiro lançamento."
          />
        </div>
      ) : (
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">📊 Resumo do Período</h3>
          <p className="text-gray-600 mb-4">
            Você tem <strong>{stats.totalLancamentos} viagens</strong> registradas neste mês.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-gray-600 mb-1">Média por Viagem</p>
              <p className="text-lg font-semibold text-blue-700">
                {formatCurrency(stats.totalReceita / stats.totalLancamentos)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-gray-600 mb-1">Média KM por Viagem</p>
              <p className="text-lg font-semibold text-green-700">
                {formatKm(stats.totalKm / stats.totalLancamentos)} km
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-gray-600 mb-1">Média Peso por Viagem</p>
              <p className="text-lg font-semibold text-orange-700">
                {formatPeso(stats.totalPeso / stats.totalLancamentos)} kg
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
