import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FileDown } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

  const exportarPDF = () => {
    if (!stats || !lancamentos.length) {
      alert('Não há dados para exportar')
      return
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Header - Título
    doc.setFillColor(14, 165, 233) // primary-500
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('JCS TRANSPORTES E LOGISTICA', pageWidth / 2, 15, { align: 'center' })
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Relatorio Mensal de Lancamentos', pageWidth / 2, 25, { align: 'center' })
    
    // Informações do Filtro
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Período:', 14, 45)
    doc.setFont('helvetica', 'normal')
    doc.text(stats.mes.charAt(0).toUpperCase() + stats.mes.slice(1), 35, 45)
    
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
    doc.text(`${stats.totalKm.toFixed(0)} km`, 16 + boxWidth + spacing, boxY + 15)
    
    // Box 3 - Total Peso
    doc.setFillColor(254, 243, 199) // orange-100
    doc.roundedRect(14 + (boxWidth + spacing) * 2, boxY, boxWidth, boxHeight, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('Total Peso', 16 + (boxWidth + spacing) * 2, boxY + 6)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(194, 65, 12) // orange-700
    doc.text(`${stats.totalPeso.toFixed(0)} kg`, 16 + (boxWidth + spacing) * 2, boxY + 15)
    
    // Box 4 - Receita Total
    doc.setFillColor(224, 242, 254) // sky-100
    doc.roundedRect(14 + (boxWidth + spacing) * 3, boxY, boxWidth, boxHeight, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('Receita Total', 16 + (boxWidth + spacing) * 3, boxY + 6)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(14, 165, 233) // primary-500
    doc.text(`R$ ${stats.totalReceita.toFixed(2)}`, 16 + (boxWidth + spacing) * 3, boxY + 15)
    
    // Médias
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Médias por Viagem', 14, 105)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`KM Médio: ${(stats.totalKm / stats.totalViagens).toFixed(2)} km`, 14, 112)
    doc.text(`Peso Médio: ${(stats.totalPeso / stats.totalViagens).toFixed(2)} kg`, 80, 112)
    doc.text(`Receita Média: R$ ${(stats.totalReceita / stats.totalViagens).toFixed(2)}`, 146, 112)
    
    // Tabela de Lançamentos
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Detalhamento dos Lançamentos', 14, 125)
    
    const tableData = lancamentos.map((lanc) => [
      format(parseISO(lanc.data), 'dd/MM/yyyy'),
      `${lanc.km_total} km`,
      `${lanc.peso} kg`,
      `R$ ${lanc.preco_total.toFixed(2)}`
    ])
    
    autoTable(doc, {
      startY: 130,
      head: [['Data', 'KM Total', 'Peso', 'Valor']],
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
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center', fontStyle: 'bold', textColor: [22, 163, 74] }
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
    doc.text(`KM: ${stats.totalKm.toFixed(0)}`, 60, finalY + 15)
    doc.text(`Peso: ${stats.totalPeso.toFixed(0)} kg`, 100, finalY + 15)
    
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(22, 163, 74)
    doc.text(`Receita: R$ ${stats.totalReceita.toFixed(2)}`, 150, finalY + 15)
    
    // Linha inferior
    doc.setDrawColor(14, 165, 233)
    doc.setLineWidth(0.5)
    doc.line(14, finalY + 22, pageWidth - 14, finalY + 22)
    
    // Rodapé
    const footerY = doc.internal.pageSize.getHeight() - 10
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('JCS Transportes e Logistica - Sistema de Gerenciamento', pageWidth / 2, footerY, { align: 'center' })
    
    // Salvar PDF
    const fileName = `relatorio-${format(new Date(), 'yyyy-MM')}-${Date.now()}.pdf`
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
