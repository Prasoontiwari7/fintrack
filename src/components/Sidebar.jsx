import { LayoutDashboard, Receipt, PlusCircle, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Transactions', icon: Receipt },
  { name: 'Add Expense', icon: PlusCircle },
  { name: 'Analytics', icon: BarChart3 },
  { name: 'Settings', icon: Settings },
]

function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  return (
    <div
      className={`fixed left-6 top-6 bottom-6 flex flex-col items-center py-6 rounded-[2rem] border border-gold/15 shadow-2xl transition-all duration-300 z-20 ${
        collapsed ? 'w-20' : 'w-56'
      }`}
      style={{ background: 'linear-gradient(180deg, #12160f 0%, #0a0d0b 100%)' }}
    >

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center font-bold text-ink mb-8 shrink-0">
        ₹
      </div>

      <nav className="flex flex-col gap-2 w-full px-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.name
          return (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              title={item.name}
              className={`flex items-center gap-3 px-3 py-3 rounded-full text-sm font-medium transition-all ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive ? 'bg-gold text-ink' : 'text-stone hover:bg-cream/5 hover:text-cream'
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </button>
          )
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-9 h-9 rounded-full bg-cream/5 hover:bg-cream/10 flex items-center justify-center text-stone hover:text-cream transition mt-4 shrink-0"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

    </div>
  )
}

export default Sidebar