import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Stats {
  totalLancamentos: number
  totalKm: number
  totalPeso: number
  totalReceita: number
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalLancamentos: 0,
    totalKm: 0,
    totalPeso: 0,
    totalReceita: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const now = new Date()
      const start = startOfMonth(now)
      const end = endOfMonth(now)

      const { data, error } = await supabase
        .from('lancamentos')
        .select('*')
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
      format: (val: number) => `${val.toFixed(0)} km`,
    },
    {
      title: 'Total Peso',
      value: stats.totalPeso,
      icon: Package,
      color: 'bg-orange-500',
      format: (val: number) => `${val.toFixed(0)} kg`,
    },
    {
      title: 'Receita Total',
      value: stats.totalReceita,
      icon: DollarSign,
      color: 'bg-primary-500',
      format: (val: number) => `R$ ${val.toFixed(2)}`,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      <div className="mb-6">
        <h2 className="text-xl text-gray-600">
          Resumo de {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="card">
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

      <div className="mt-8 card">
        <h3 className="text-xl font-semibold mb-4">Bem-vindo ao JCS Transportes e Logística!</h3>
        <p className="text-gray-600 mb-4">
          Sistema completo para gestão de transportes. Use o menu lateral para:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Cadastrar preços por KM e KG</li>
          <li>Configurar taxas de arrancada por faixa de distância</li>
          <li>Registrar lançamentos de viagens</li>
          <li>Visualizar relatórios mensais detalhados</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
