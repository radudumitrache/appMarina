import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import '../css/admin/NavBar.css'

const LINKS = [
  { label: 'Dashboard', slug: 'dashboard' },
  { label: 'Users',     slug: 'users'     },
  { label: 'Lessons',   slug: 'lessons'   },
  { label: 'Classes',   slug: 'classes'   },
  { label: 'Support',   slug: 'support'   },
  { label: 'Settings',  slug: 'settings'  },
]

export default function NavBar() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="navbar navbar--admin">
      <span className="nav-logo" onClick={() => navigate('/admin/dashboard')}>
        SEAFARER
      </span>

      <div className="nav-links">
        {LINKS.map((l) => {
          const path = `/admin/${l.slug}`
          const isActive = pathname === path || pathname.startsWith(`${path}/`)
          return (
            <button
              key={l.slug}
              className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
              onClick={() => navigate(path)}
            >
              {l.label}
            </button>
          )
        })}
      </div>

      <div className="nav-end">
        <button className="nav-theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} aria-label="Toggle theme">
          {theme === 'dark' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        <button
          className={`nav-avatar ${pathname === '/admin/profile' ? 'nav-avatar--active' : ''}`}
          onClick={() => navigate('/admin/profile')}
          title="My Profile"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>
    </nav>
  )
}
