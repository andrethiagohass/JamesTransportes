import { useEffect, useRef, useState } from 'react'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  MONTH_NAMES,
  PeriodFilterValue,
  QuickPeriod,
  getPeriodFilterLabel,
} from '../utils/periodFilter'

const QUICK_FILTERS: QuickPeriod[] = [
  'currentYear',
  'last30days',
  'last12months',
  'last5years',
  'currentMonth',
  'lastMonth',
  'all',
]

interface PeriodFilterDropdownProps {
  value: PeriodFilterValue
  onChange: (value: PeriodFilterValue) => void
  total: string
  totalLabel?: string
}

const PeriodFilterDropdown = ({ value, onChange, total, totalLabel = 'Total' }: PeriodFilterDropdownProps) => {
  const [open, setOpen] = useState(false)
  const [calendarYear, setCalendarYear] = useState(() =>
    value.type === 'month' ? value.year : new Date().getFullYear()
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOpen = () => {
    if (!open && value.type === 'month') {
      setCalendarYear(value.year)
    }
    setOpen(prev => !prev)
  }

  const selectQuick = (period: QuickPeriod) => {
    onChange({ type: 'quick', period })
    setOpen(false)
  }

  const selectMonth = (month: number) => {
    onChange({ type: 'month', year: calendarYear, month })
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <div className="flex items-center gap-2">
        <div className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm">
          <span className="text-gray-500">{totalLabel}: </span>
          <span className="font-semibold text-gray-900">{total}</span>
        </div>
        <button
          type="button"
          onClick={toggleOpen}
          className="input-field w-auto flex items-center gap-2 whitespace-nowrap"
        >
          <Calendar size={16} className="text-gray-500" />
          <span>{getPeriodFilterLabel(value)}</span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-[min(90vw,480px)] rounded-lg border border-gray-200 bg-white shadow-lg grid grid-cols-2 divide-x divide-gray-100">
          <div className="p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Filtros rápidos</p>
            <div className="flex flex-col">
              {QUICK_FILTERS.map(period => {
                const selected = value.type === 'quick' && value.period === period
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => selectQuick(period)}
                    className={`text-left px-2 py-2 rounded-md text-sm transition-colors ${
                      selected ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {getPeriodFilterLabel({ type: 'quick', period })}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Filtro mensal</p>
            <div className="flex items-center justify-between px-2 mb-2">
              <button
                type="button"
                onClick={() => setCalendarYear(y => y - 1)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
                aria-label="Ano anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-semibold text-gray-900">{calendarYear}</span>
              <button
                type="button"
                onClick={() => setCalendarYear(y => y + 1)}
                className="p-1 rounded hover:bg-gray-100 text-gray-500"
                aria-label="Próximo ano"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="flex flex-col max-h-48 overflow-y-auto">
              {[...MONTH_NAMES]
                .map((name, index) => ({ name, index }))
                .reverse()
                .map(({ name, index }) => {
                  const selected = value.type === 'month' && value.year === calendarYear && value.month === index
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectMonth(index)}
                      className={`text-left px-2 py-2 rounded-md text-sm transition-colors ${
                        selected ? 'bg-primary-600 text-white font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {name}
                    </button>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PeriodFilterDropdown
