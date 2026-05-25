import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import '../css/admin/NavBar.css'

const ALL_LINKS = [
  { label: 'Dashboard',     slug: 'dashboard',     superadminOnly: false },
  { label: 'Users',         slug: 'users',         superadminOnly: false },
  { label: 'Organisations', slug: 'organisations', superadminOnly: true  },
  { label: 'Lessons',       slug: 'lessons',       superadminOnly: false },
  { label: 'Tests',         slug: 'tests',         superadminOnly: false },
  { label: 'Classes',       slug: 'classes',       superadminOnly: false },
  { label: 'Courses',       slug: 'courses',       superadminOnly: false },
  { label: 'Media',         slug: 'media',         superadminOnly: false },
  { label: 'Support',       slug: 'support',       superadminOnly: false },
]

export default function NavBar() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()

  const links = ALL_LINKS.filter(l => !l.superadminOnly || user?.is_staff)

  return (
    <nav className="navbar navbar--admin">
      <span className="nav-logo" onClick={() => navigate('/admin/dashboard')}>
        HANSA360
      </span>

      <div className="nav-links">
        {links.map((l) => {
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
        <button
          className={`nav-avatar ${pathname === '/admin/settings' ? 'nav-avatar--active' : ''}`}
          onClick={() => navigate('/admin/settings')}
          title="Settings"
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
