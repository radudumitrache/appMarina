import { useNavigate, useLocation } from 'react-router-dom'
import '../css/admin/NavBar.css'

const LINKS = [
  { label: 'Dashboard', slug: 'dashboard' },
  { label: 'Users',     slug: 'users'     },
  { label: 'Lessons',   slug: 'lessons'   },
  { label: 'Classes',   slug: 'classes'   },
  { label: 'Settings',  slug: 'settings'  },
]

export default function NavBar() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()

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
    </nav>
  )
}
