import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/history', label: 'Sessions' },
  { to: '/history/volume', label: 'Volume' },
  { to: '/history/bodyweight', label: 'Body weight' },
]

export function HistoryTabs() {
  return (
    <div
      className="mb-4 flex gap-1 rounded-lg border p-1"
      style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className="flex-1 rounded-md py-1.5 text-center text-xs font-semibold"
          style={({ isActive }) => ({
            background: isActive ? 'var(--surface)' : 'transparent',
            color: isActive ? 'var(--text)' : 'var(--text-muted)',
          })}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
