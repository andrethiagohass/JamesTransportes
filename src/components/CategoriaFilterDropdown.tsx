import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckSquare, ChevronDown } from 'lucide-react'
import { ALL_CATEGORIAS, CATEGORIAS } from '../utils/categorias'

interface CategoriaFilterDropdownProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

const CategoriaFilterDropdown = ({ selected, onChange }: CategoriaFilterDropdownProps) => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const label = useMemo(() => {
    if (selected.length === 0) return 'Nenhuma categoria'
    if (selected.length === CATEGORIAS.length) return 'Todas as categorias'
    if (selected.length === 1) return '1 categoria'
    return `${selected.length} categorias`
  }, [selected])

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((c) => c !== value)
        : [...selected, value]
    )
  }

  const marcarTodas = () => onChange([...ALL_CATEGORIAS])
  const desmarcarTodas = () => onChange([])
  const todasMarcadas = selected.length === CATEGORIAS.length

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="input-field w-auto flex items-center gap-2 whitespace-nowrap"
      >
        <CheckSquare size={16} className="text-gray-500" />
        <span>{label}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 sm:left-auto sm:right-0 z-20 mt-2 w-[min(90vw,280px)] rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase">Categorias</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={marcarTodas}
                disabled={todasMarcadas}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:text-gray-300 disabled:hover:text-gray-300 transition-colors"
              >
                Marcar todas
              </button>
              <span className="text-gray-300 text-xs">|</span>
              <button
                type="button"
                onClick={desmarcarTodas}
                disabled={selected.length === 0}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:text-gray-300 disabled:hover:text-gray-300 transition-colors"
              >
                Desmarcar todas
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {CATEGORIAS.map((categoria) => {
              const checked = selected.includes(categoria.value)
              return (
                <label
                  key={categoria.value}
                  className="flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(categoria.value)}
                    className="w-4 h-4 rounded border-gray-300 accent-primary-600 cursor-pointer"
                  />
                  <span className={checked ? 'text-gray-900 font-medium' : 'text-gray-600'}>{categoria.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriaFilterDropdown
