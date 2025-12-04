import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDateBR, formatDateShortBR } from '../utils/dateUtils'
import { formatKm, formatPeso, formatCurrency } from '../utils/formatUtils'
import { useAuth } from '../contexts/AuthContext'

interface Lancamento {
  id: string
  data: string
  carga: string | null
  km_total: number
  peso: number
  preco_total: number
  tenant_id: string
}

interface MesData {
  mes: string
  totalViagens: number
  totalKm: number
  totalPeso: number
  totalReceita: number
}

const Relatorios = () => {
  const { user } = useAuth()
  
  // Criar datas padrão sem timezone
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const firstDay = `${year}-${month}-01`
  const lastDay = `${year}-${month}-${new Date(year, now.getMonth() + 1, 0).getDate()}`
  
  const [dataInicial, setDataInicial] = useState(firstDay)
  const [dataFinal, setDataFinal] = useState(lastDay)
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [stats, setStats] = useState<MesData | null>(null)
  const [dadosGrafico, setDadosGrafico] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchRelatorio()
    }
  }, [dataInicial, dataFinal, user])

  const fetchRelatorio = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('lancamentos')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .gte('data', dataInicial)
        .lte('data', dataFinal)
        .order('data', { ascending: true })

      if (error) throw error

      setLancamentos(data || [])

      if (data && data.length > 0) {
        const totalViagens = data.length
        const totalKm = data.reduce((sum: number, item: any) => sum + item.km_total, 0)
        const totalPeso = data.reduce((sum: number, item: any) => sum + item.peso, 0)
        const totalReceita = data.reduce((sum: number, item: any) => sum + item.preco_total, 0)

        // Criar label do período (sem conversão de timezone)
        const dataInicialFormatada = formatDateBR(dataInicial)
        const dataFinalFormatada = formatDateBR(dataFinal)
        const periodoLabel = `${dataInicialFormatada} a ${dataFinalFormatada}`

        setStats({
          mes: periodoLabel,
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

  const exportarPDF = () => {
    if (!stats || !lancamentos.length || !user) {
      alert('Não há dados para exportar')
      return
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Header - Título com nome da empresa
    doc.setFillColor(14, 165, 233) // primary-500
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text((user.empresa || 'HASSTREIO').toUpperCase(), pageWidth / 2, 15, { align: 'center' })
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Relatorio de Lancamentos', pageWidth / 2, 25, { align: 'center' })
    
    // Informações do Filtro
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Período:', 14, 45)
    doc.setFont('helvetica', 'normal')
    doc.text(stats.mes, 35, 45)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Data de Emissão:', 14, 52)
    doc.setFont('helvetica', 'normal')
    doc.text(format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }), 52, 52)
    
    // Resumo - Cards de Estatísticas
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumo do Período', 14, 65)
    
    // Boxes com estatísticas
    const boxY = 72
    const boxHeight = 20
    const boxWidth = 45
    const spacing = 2
    
    // Box 1 - Total de Viagens
    doc.setFillColor(219, 234, 254) // blue-100
    doc.roundedRect(14, boxY, boxWidth, boxHeight, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('Total de Viagens', 16, boxY + 6)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(29, 78, 216) // blue-700
    doc.text(stats.totalViagens.toString(), 16, boxY + 15)
    
    // Box 2 - Total KM
    doc.setFillColor(220, 252, 231) // green-100
    doc.roundedRect(14 + boxWidth + spacing, boxY, boxWidth, boxHeight, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('Total KM', 16 + boxWidth + spacing, boxY + 6)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(21, 128, 61) // green-700
    doc.text(`${formatKm(stats.totalKm)} km`, 16 + boxWidth + spacing, boxY + 15)
    
    // Box 3 - Total Peso
    doc.setFillColor(254, 243, 199) // orange-100
    doc.roundedRect(14 + (boxWidth + spacing) * 2, boxY, boxWidth, boxHeight, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('Total Peso', 16 + (boxWidth + spacing) * 2, boxY + 6)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(194, 65, 12) // orange-700
    doc.text(`${formatPeso(stats.totalPeso)} kg`, 16 + (boxWidth + spacing) * 2, boxY + 15)
    
    // Box 4 - Receita Total
    doc.setFillColor(224, 242, 254) // sky-100
    doc.roundedRect(14 + (boxWidth + spacing) * 3, boxY, boxWidth, boxHeight, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('Receita Total', 16 + (boxWidth + spacing) * 3, boxY + 6)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(14, 165, 233) // primary-500
    doc.text(formatCurrency(stats.totalReceita), 16 + (boxWidth + spacing) * 3, boxY + 15)
    
    // Médias
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Médias por Viagem', 14, 105)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`KM Médio: ${formatKm(stats.totalKm / stats.totalViagens)} km`, 14, 112)
    doc.text(`Peso Médio: ${formatPeso(stats.totalPeso / stats.totalViagens)} kg`, 80, 112)
    doc.text(`Receita Média: ${formatCurrency(stats.totalReceita / stats.totalViagens)}`, 146, 112)
    
    // Tabela de Lançamentos
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Detalhamento dos Lançamentos', 14, 125)
    
    const tableData = lancamentos.map((lanc) => [
      formatDateBR(lanc.data),
      lanc.carga || '-',
      `${formatKm(lanc.km_total)} km`,
      `${formatPeso(lanc.peso)} kg`,
      formatCurrency(lanc.preco_total)
    ])
    
    autoTable(doc, {
      startY: 130,
      head: [['Data', 'Carga', 'KM Total', 'Peso', 'Valor']],
      body: tableData,
      theme: 'striped',
      margin: { left: 14, right: 14 },
      tableWidth: 'auto',
      headStyles: {
        fillColor: [14, 165, 233],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center', fontStyle: 'bold', textColor: [59, 130, 246] },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center', fontStyle: 'bold', textColor: [22, 163, 74] }
      }
    })
    
    // Footer com totais
    const finalY = (doc as any).lastAutoTable.finalY + 10
    
    doc.setFillColor(240, 240, 240)
    doc.rect(14, finalY, pageWidth - 28, 25, 'F')
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('TOTAIS DO PERÍODO:', 18, finalY + 8)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Viagens: ${stats.totalViagens}`, 18, finalY + 15)
    doc.text(`KM: ${formatKm(stats.totalKm)}`, 60, finalY + 15)
    doc.text(`Peso: ${formatPeso(stats.totalPeso)} kg`, 100, finalY + 15)
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text(`Receita: ${formatCurrency(stats.totalReceita)}`, 150, finalY + 15)
    
    // Linha inferior
    doc.setDrawColor(14, 165, 233)
    doc.setLineWidth(0.5)
    doc.line(14, finalY + 22, pageWidth - 14, finalY + 22)
    
    // Rodapé
    const footerY = doc.internal.pageSize.getHeight() - 10
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('Hasstreio - Sistema de Gerenciamento', pageWidth / 2, footerY, { align: 'center' })
    
    // Salvar PDF
    const fileName = `relatorio-${dataInicial}-ate-${dataFinal}.pdf`
    doc.save(fileName)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Relatórios</h1>
        
        {stats && lancamentos.length > 0 && (
          <button
            onClick={exportarPDF}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <FileDown size={20} />
            <span>Exportar PDF</span>
          </button>
        )}
      </div>

      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <label className="label mb-0 font-semibold text-gray-700">Período:</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">De:</label>
              <input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="input-field w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Até:</label>
              <input
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                className="input-field w-auto"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : stats ? (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-primary-700">
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
                <p className="text-2xl font-bold text-green-700">{formatKm(stats.totalKm)} km</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Peso</p>
                <p className="text-2xl font-bold text-orange-700">{formatPeso(stats.totalPeso)} kg</p>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Receita Total</p>
                <p className="text-2xl font-bold text-primary-700">{formatCurrency(stats.totalReceita)}</p>
              </div>
            </div>

            {/* Médias */}
            <div className="bg-gray-50 p-4 rounded-lg mb-8">
              <h3 className="font-semibold mb-3">Médias por Viagem</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">KM Médio</p>
                  <p className="text-lg font-bold">{formatKm(stats.totalKm / stats.totalViagens)} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Peso Médio</p>
                  <p className="text-lg font-bold">{formatPeso(stats.totalPeso / stats.totalViagens)} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Receita Média</p>
                  <p className="text-lg font-bold">{formatCurrency(stats.totalReceita / stats.totalViagens)}</p>
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
              <div className="table-container">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Data</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden lg:table-cell">Carga</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">KM</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">Peso</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lancamentos.map((lanc) => (
                      <tr key={lanc.id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">
                          <span className="hidden sm:inline">{formatDateBR(lanc.data)}</span>
                          <span className="sm:hidden">{formatDateShortBR(lanc.data)}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden lg:table-cell">
                          {lanc.carga ? (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {lanc.carga}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">{formatKm(lanc.km_total)} km</td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm hidden sm:table-cell">{formatPeso(lanc.peso)} kg</td>
                        <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium text-green-600">
                          <span className="hidden sm:inline">{formatCurrency(lanc.preco_total)}</span>
                          <span className="sm:hidden">R$ {formatKm(lanc.preco_total)}</span>
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
