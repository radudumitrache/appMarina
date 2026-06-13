import '../../css/admin/users/UsersSidebar.css'
import { useAuth } from '../../../auth/AuthContext'

const BASE_ROLES = [
  { id: 'all',     label: 'All Users' },
  { id: 'student', label: 'Students'  },
  { id: 'teacher', label: 'Teachers'  },
]
const ADMIN_ROLE = { id: 'admin', label: 'Admins' }

export default function UsersSidebar({ roleFilter, onRoleFilterChange, counts, className = '', organisations = [], orgFilter, onOrgFilterChange, orgCounts = {}, departments = [], deptFilter, onDeptFilterChange, deptCounts = {} }) {
  const { user } = useAuth()
  const roles = user?.is_staff ? [...BASE_ROLES, ADMIN_ROLE] : BASE_ROLES

  return (
    <aside className={`users-sidebar${className ? ` ${className}` : ''}`}>
      <nav className="users-sidebar-nav">
        {roles.map(r => (
          <button
            key={r.id}
            className={`users-sidebar-btn ${roleFilter === r.id ? 'users-sidebar-btn--active' : ''}`}
            onClick={() => onRoleFilterChange(r.id)}
          >
            <div className="users-sidebar-btn-row">
              <span className="users-sidebar-label">{r.label}</span>
              <span className="users-sidebar-count">{counts[r.id] ?? 0}</span>
            </div>
          </button>
        ))}
      </nav>

      {organisations.length > 1 && (
        <div className="users-sidebar-section">
          <span className="users-sidebar-section-title">Organisation</span>
          <nav className="users-sidebar-nav">
            <button
              className={`users-sidebar-btn ${orgFilter === null ? 'users-sidebar-btn--active' : ''}`}
              onClick={() => onOrgFilterChange(null)}
            >
              <div className="users-sidebar-btn-row">
                <span className="users-sidebar-label">All</span>
                <span className="users-sidebar-count">{counts.all}</span>
              </div>
            </button>
            {organisations.map(o => (
              <button
                key={o.id}
                className={`users-sidebar-btn ${orgFilter === o.id ? 'users-sidebar-btn--active' : ''}`}
                onClick={() => onOrgFilterChange(o.id)}
              >
                <div className="users-sidebar-btn-row">
                  <span className="users-sidebar-label users-sidebar-label--org">{o.name}</span>
                  <span className="users-sidebar-count">{orgCounts[o.id] ?? 0}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      )}

      {departments.length > 0 && (
        <div className="users-sidebar-section">
          <span className="users-sidebar-section-title">Department</span>
          <nav className="users-sidebar-nav users-sidebar-nav--scroll">
            <button
              className={`users-sidebar-btn ${deptFilter === null ? 'users-sidebar-btn--active' : ''}`}
              onClick={() => onDeptFilterChange(null)}
            >
              <div className="users-sidebar-btn-row">
                <span className="users-sidebar-label">All</span>
                <span className="users-sidebar-count">{counts.all}</span>
              </div>
            </button>
            {departments.map(d => (
              <button
                key={d.id}
                className={`users-sidebar-btn ${deptFilter === d.id ? 'users-sidebar-btn--active' : ''}`}
                onClick={() => onDeptFilterChange(d.id)}
              >
                <div className="users-sidebar-btn-row">
                  <span className="users-sidebar-label users-sidebar-label--org" title={d.name}>
                    {d.code ? `${d.code} – ${d.name}` : d.name}
                  </span>
                  <span className="users-sidebar-count">{deptCounts[d.id] ?? 0}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      )}

      <div className="users-sidebar-stat">
        <div className="users-sidebar-stat-bar">
          <div
            className="users-sidebar-stat-fill"
            style={{ width: `${counts.all ? (counts.student / counts.all) * 100 : 0}%` }}
          />
        </div>
        <span className="users-sidebar-stat-text">
          <span className="users-sidebar-stat-num">{counts.student}</span>
          {' '}students /{' '}
          <span className="users-sidebar-stat-num">{counts.teacher}</span>
          {' '}teachers
        </span>
      </div>
    </aside>
  )
}
