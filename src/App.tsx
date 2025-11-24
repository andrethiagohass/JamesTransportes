import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import PrecoKm from './pages/PrecoKm'
import PrecoKg from './pages/PrecoKg'
import TaxaArrancada from './pages/TaxaArrancada'
import Lancamentos from './pages/Lancamentos'
import Relatorios from './pages/Relatorios'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/preco-km" element={<PrecoKm />} />
          <Route path="/preco-kg" element={<PrecoKg />} />
          <Route path="/taxa-arrancada" element={<TaxaArrancada />} />
          <Route path="/lancamentos" element={<Lancamentos />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
