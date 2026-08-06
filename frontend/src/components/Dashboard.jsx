import { useState } from 'react';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import TransactionsPage from './TransactionsPage';
import AnalyticsPage from './AnalyticsPage';
import AddExpensePage from './AddExpensePage';
import AddIncomePage from './AddIncomePage';
import SettingsPage from './SettingsPage';

function Dashboard({ user, setUser, onLogout }) {
  const [active, setActive] = useState('Dashboard');
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (active) {
      case 'Dashboard':
        return <DashboardHome user={user} />;
      case 'Transactions':
        return <TransactionsPage user={user} />;
      case 'Analytics':
        return <AnalyticsPage />;
      case 'Add Expense':
        return <AddExpensePage setActive={setActive} />;
      case 'Add Income':
        return <AddIncomePage setActive={setActive} />;
      case 'Settings':
        return <SettingsPage user={user} setUser={setUser} onLogout={onLogout} />;
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-ink">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={onLogout}
        user={user}
        setUser={setUser}
      />
      <div className={`p-8 transition-all duration-300 ${collapsed ? 'lg:ml-32' : 'lg:ml-72'}`}>
        {renderPage()}
      </div>
    </div>
  );
}

export default Dashboard;