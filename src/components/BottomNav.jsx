import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Today', icon: '◉' },
  { to: '/stats', label: 'Stats', icon: '▦' },
  { to: '/skills', label: 'Skills', icon: '✦' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex safe-area-pb">
      {tabs.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-400' : 'text-slate-500'
            }`
          }
        >
          <span className="text-lg leading-none">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
