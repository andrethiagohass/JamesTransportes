import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Lancamento {
  id: string
  data: string
  km_total: number
  peso: number
  preco_total: number
}

interface MesData {
  mes: string
  totalViagens: number
  totalKm: number
  totalPeso: number
  totalReceita: number
}

const Relatorios = () => {
  const [mesAno, setMesAno] = useState(format(new Date(), 'yyyy-MM'))
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [stats, setStats] = useState<MesData | null>(null)
  const [dadosGrafico, setDadosGrafico] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRelatorio()
  }, [mesAno])

  const fetchRelatorio = async () => {
    setLoading(true)
    try {
      const [ano, mes] = mesAno.split('-')
      const date = new Date(parseInt(ano), parseInt(mes) - 1, 1)
      const start = startOfMonth(date)
      const end = endOfMonth(date)

      const { data, error } = await supabase
        .from('lancamentos')
        .select('*')
        .gte('data', format(start, 'yyyy-MM-dd'))
        .lte('data', format(end, 'yyyy-MM-dd'))
        .order('data', { ascending: true })

      if (error) throw error

      setLancamentos(data || [])

      if (data && data.length > 0) {
        const totalViagens = data.length
        const totalKm = data.reduce((sum: number, item: any) => sum + item.km_total, 0)
        const totalPeso = data.reduce((sum: number, item: any) => sum + item.peso, 0)
        const totalReceita = data.reduce((sum: number, item: any) => sum + item.preco_total, 0)

        setStats({
          mes: format(date, 'MMMM yyyy', { locale: ptBR }),
          totalViagens,
          totalKm,
          totalPeso,
          totalReceita,
        })

        // Preparar dados para o gráfico
        const graficoData = data.map((item: any) => ({
          data: format(parseISO(item.data), 'dd/MM'),
          'Valor Total': item.preco_total,
          'KM Total': item.km_total,
        }))
        setDadosGrafico(graficoData)
      } else {
        setStats(null)
        setDadosGrafico([])
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Relatórios</h1>

      <div className="card mb-8">
        <div className="flex items-center gap-4 mb-6">
          <label className="label mb-0">Selecionar Mês:</label>
          <input
            type="month"
            value={mesAno}
            onChange={(e) => setMesAno(e.target.value)}
            className="input-field w-auto"
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : stats ? (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-primary-700 capitalize">
              {stats.mes}
            </h2>

            {/* Resumo do Mês */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total de Viagens</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalViagens}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total KM</p>
                <p className="text-2xl font-bold text-green-700">{stats.totalKm.toFixed(0)} km</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Peso</p>
                <p className="text-2xl font-bold text-orange-700">{stats.totalPeso.toFixed(0)} kg</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                <p className="text-2xl font-bold text-primary-700">R$ {stats.totalReceita.toFixed(2)}</p>
              </div>
            </div>

            {/* Médias */}
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <h3 className="font-semibold mb-3">Médias por Viagem</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">KM Médio</p>
                  <p className="text-lg font-bold">{(stats.totalKm / stats.totalViagens).toFixed(2)} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Peso Médio</p>
                  <p className="text-lg font-bold">{(stats.totalPeso / stats.totalViagens).toFixed(2)} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Receita Média</p>
                  <p className="text-lg font-bold">R$ {(stats.totalReceita / stats.totalViagens).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Gráfico */}
            {dadosGrafico.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Evolução no Mês</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Valor Total" fill="#0ea5e9" />
                    <Bar dataKey="KM Total" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Detalhamento */}
            <div>
              <h3 className="font-semibold mb-4">Detalhamento de Lançamentos</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">KM Total</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Peso (kg)</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Valor (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lancamentos.map((lanc) => (
                      <tr key={lanc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {format(parseISO(lanc.data), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3 text-sm">{lanc.km_total} km</td>
                        <td className="px-4 py-3 text-sm">{lanc.peso} kg</td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600">
                          R$ {lanc.preco_total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Nenhum lançamento encontrado para este mês.
          </div>
        )}
      </div>
    </div>
  )
}

export default Relatorios
