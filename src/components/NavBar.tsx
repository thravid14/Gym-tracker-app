import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Today', icon: '🏠' },
  { to: '/history', label: 'History', icon: '📅' },
  { to: '/split', label: 'Split', icon: '🧩' },
]

export function NavBar() {
  return (
    <nav
      className="sticky bottom-0 z-10 grid grid-cols-3 border-t"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
              isActive ? '' : ''
            }`
          }
          style={({ isActive }) => ({
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
          })}
        >
          <span className="text-lg leading-none">{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
