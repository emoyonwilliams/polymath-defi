import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WalletProvider } from './hooks/useWalletContext'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Health } from './pages/Health'
import { Portfolio } from './pages/Portfolio'
import { Settings } from './pages/Settings'
import { Agent } from './pages/Agent'
import { Rewards } from './pages/Rewards'
import { Governance } from './pages/Governance'

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/health" element={<Health />} />
          <Route path="/app/portfolio" element={<Portfolio />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/agent" element={<Agent />} />
          <Route path="/app/rewards" element={<Rewards />} />
          <Route path="/app/governance" element={<Governance />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  )
}

export default App