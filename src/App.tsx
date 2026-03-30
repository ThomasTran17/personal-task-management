import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Sidebar } from '@/components/shared/Sidebar'
import { BottomNav } from '@/components/shared/BottomNav'
import { Toaster } from '@/components/ui/sonner'
import ListPage from '@/pages/ListPage'
import StatisticsPage from '@/pages/StatisticsPage'
import { usePeriodicDeadlineCheck } from '@/hooks/usePeriodicDeadlineCheck'

const navItems = [
  {
    href: '/',
    label: 'List',
    iconType: 'kanban' as const,
  },
  {
    href: '/statistics',
    label: 'Statistics',
    iconType: 'stats' as const,
  },
]

export default function App() {
  // Setup deadline notifications that persist across page refreshes
  usePeriodicDeadlineCheck()

  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar items={navItems} />
        <main className="flex-1 overflow-auto pb-24 lg:pb-0">
          <Routes>
            <Route path="/" element={<ListPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </main>
        <BottomNav items={navItems} />
      </div>
      <Toaster />
    </Router>
  )
}
