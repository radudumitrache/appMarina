import { useNavigate, useLocation } from 'react-router-dom'
import '../css/shared/NavBar.css'

const NAV_SLUGS = [
  { label: 'Dashboard', slug: 'dashboard' },
  { label: 'Lessons',   slug: 'lessons'   },
]

export default function NavBar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Derive role from current path: "/student/lessons" → "student"
  const role = pathname.split('/')[1] || 'student'

  return (
    <nav className="navbar">
      <span className="nav-logo" onClick={() => navigate(`/${role}/dashboard`)}>
        SEAFARER
      </span>

      <div className="nav-links">
        {NAV_SLUGS.map((l) => {
          const path = `/${role}/${l.slug}`
          return (
            <button
              key={l.slug}
              className={`nav-link ${pathname === path ? 'nav-link--active' : ''}`}
              onClick={() => navigate(path)}
            >
              {l.label}
            </button>
          )
        })}
      </div>

      <div className="nav-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
    </nav>
  )
}
