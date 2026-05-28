import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../css/teacher/NavBar.css'

const LINKS = [
  { label: 'Dashboard',        slug: 'dashboard'   },
  { label: 'My Departments',   slug: 'departments' },
  { label: 'Course Builder',   slug: 'builder'     },
  { label: 'Student Progress', slug: 'progress'    },
  { label: 'Test Builder',     slug: 'assignments' },
  { label: 'Media',            slug: 'media'       },
  { label: 'Support',          slug: 'support'     },
]

export default function NavBar() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar navbar--teacher">
      <span className="nav-logo" onClick={() => navigate('/teacher/dashboard')}>
        HANSA360
      </span>

      {menuOpen && <div className="nav-menu-backdrop" onClick={() => setMenuOpen(false)} />}

      <div className={`nav-links-wrap${menuOpen ? ' nav-links-wrap--open' : ''}`}>
        {LINKS.map((l) => {
          const path = `/teacher/${l.slug}`
          return (
            <button
              key={l.slug}
              className={`nav-link ${pathname.startsWith(path) ? 'nav-link--active' : ''}`}
              onClick={() => { navigate(path); setMenuOpen(false) }}
            >
              {l.label}
            </button>
          )
        })}
      </div>

      <div className="nav-end">
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
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(m => !m)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>
    </nav>
  )
}
