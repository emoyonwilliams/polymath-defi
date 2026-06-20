import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WalletProvider } from './hooks/useWalletContext'
import { AppLayout } from './components/layout/AppLayout'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Health } from './pages/Health'
import { Portfolio } from './pages/Portfolio'
import { Settings } from './pages/Settings'
import { Agent } from './pages/Agent'
import { Rewards } from './pages/Rewards'
import { Governance } from './pages/Governance'
import { Docs } from './pages/Docs'

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="/app/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/app/health" element={<AppLayout><Health /></AppLayout>} />
          <Route path="/app/portfolio" element={<AppLayout><Portfolio /></AppLayout>} />
          <Route path="/app/settings" element={<AppLayout><Settings /></AppLayout>} />
          <Route path="/app/agent" element={<AppLayout><Agent /></AppLayout>} />
          <Route path="/app/rewards" element={<AppLayout><Rewards /></AppLayout>} />
          <Route path="/app/governance" element={<AppLayout><Governance /></AppLayout>} />
          <Route path="/app/docs" element={<AppLayout><Docs /></AppLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  )
}

export default App