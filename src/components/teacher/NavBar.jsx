import { useNavigate, useLocation } from 'react-router-dom'
import '../css/teacher/NavBar.css'

const LINKS = [
  { label: 'Dashboard',        slug: 'dashboard'   },
  { label: 'My Classes',       slug: 'classes'     },
  { label: 'Course Builder',   slug: 'builder'     },
  { label: 'Student Progress', slug: 'progress'    },
  { label: 'Test Builder',     slug: 'assignments' },
  { label: 'Support',          slug: 'support'     },
]

export default function NavBar() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="navbar navbar--teacher">
      <span className="nav-logo" onClick={() => navigate('/teacher/dashboard')}>
        SEAFARER
      </span>

      <div className="nav-links">
        {LINKS.map((l) => {
          const path = `/teacher/${l.slug}`
          return (
            <button
              key={l.slug}
              className={`nav-link ${pathname.startsWith(path) ? 'nav-link--active' : ''}`}
              onClick={() => navigate(path)}
            >
              {l.label}
            </button>
          )
        })}
      </div>

      <button
        className={`nav-avatar ${pathname === '/teacher/profile' ? 'nav-avatar--active' : ''}`}
        onClick={() => navigate('/teacher/profile')}
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
