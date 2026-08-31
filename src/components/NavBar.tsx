import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Today', icon: '🏠' },
  { to: '/history', label: 'History', icon: '📅' },
  { to: '/split', label: 'Split', icon: '🧩' },
]

// Meal-prep app link is a full page navigation (not a route inside this app's
// own HashRouter) — only meaningful when the two apps are proxied under one
// domain (Vercel), so it's hidden on the GitHub Pages build.
const showMealAppLink = import.meta.env.BASE_URL === '/gym/'

export function NavBar() {
  return (
    <nav
      className={`sticky bottom-0 z-10 grid border-t ${showMealAppLink ? 'grid-cols-4' : 'grid-cols-3'}`}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/'}
          // Tab switches shouldn't pile onto the back stack the way a genuine
          // drill-down does — replace so pressing back from a tab doesn't
          // walk through every other tab you've visited first.
          replace
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
      {showMealAppLink && (
        <a
          href="/"
          className="flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-lg leading-none">🥗</span>
          Meals
        </a>
      )}
    </nav>
  )
}
