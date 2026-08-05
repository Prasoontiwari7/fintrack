import { useState } from 'react'
import Sidebar from './Sidebar'
import DashboardHome from './DashboardHome'
import TransactionsPage from './TransactionsPage'
import AnalyticsPage from './AnalyticsPage'
import AddExpensePage from './AddExpensePage'
import SettingsPage from './SettingsPage'

function Dashboard() {
  const [active, setActive] = useState('Dashboard')
  const [collapsed, setCollapsed] = useState(false)

  const renderPage = () => {
    switch (active) {
      case 'Dashboard': return <DashboardHome />
      case 'Transactions': return <TransactionsPage />
      case 'Analytics': return <AnalyticsPage />
      case 'Add Expense': return <AddExpensePage />
      case 'Settings': return <SettingsPage />
      default: return <DashboardHome />
    }
  }

  return (
    <div className="min-h-screen w-full bg-ink">
      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`p-8 transition-all duration-300 ${collapsed ? 'lg:ml-32' : 'lg:ml-72'}`}>
        {renderPage()}
      </div>
    </div>
  )
}

export default Dashboard