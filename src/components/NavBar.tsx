import { NavLink, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'Today', icon: '🏠' },
  { to: '/history', label: 'History', icon: '📅' },
  { to: '/split', label: 'Split', icon: '🧩' },
]

// Meal-prep app link is a full page navigation (not a route inside this app's
// own HashRouter) — only meaningful when the two apps are proxied under one
// domain (Vercel), so it's hidden on the GitHub Pages build.
const showMealAppLink = import.meta.env.BASE_URL === '/gym/'

const totalSlots = tabs.length + (showMealAppLink ? 1 : 0)

export function NavBar() {
  const { pathname } = useLocation()
  // History's own sub-tabs (Sessions/Volume/Body weight) all count as the
  // History tab being active here.
  const activeIndex = tabs.findIndex((tab) =>
    tab.to === '/' ? pathname === '/' : pathname.startsWith(tab.to),
  )

  return (
    <nav
      className={`sticky bottom-0 z-10 grid border-t relative ${showMealAppLink ? 'grid-cols-4' : 'grid-cols-3'}`}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {activeIndex >= 0 && (
        <div
          className="absolute top-0 h-0.5 rounded-full"
          style={{
            background: 'var(--accent)',
            left: `${(activeIndex / totalSlots) * 100}%`,
            width: `${100 / totalSlots}%`,
            transition: 'left 0.25s cubic-bezier(0.22, 1, 0.36, 1), width 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      )}
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
          {({ isActive }) => (
            <>
              <span
                className="text-lg leading-none"
                style={{
                  display: 'inline-block',
                  transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isActive ? 'translateY(-2px) scale(1.1)' : undefined,
                }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </>
          )}
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
