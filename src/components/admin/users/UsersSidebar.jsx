import '../../css/admin/users/UsersSidebar.css'
import { useAuth } from '../../../auth/AuthContext'

const BASE_ROLES = [
  { id: 'all',     label: 'All Users' },
  { id: 'student', label: 'Students'  },
  { id: 'teacher', label: 'Teachers'  },
]
const ADMIN_ROLE = { id: 'admin', label: 'Admins' }

export default function UsersSidebar({ roleFilter, onRoleFilterChange, counts }) {
  const { user } = useAuth()
  const roles = user?.is_staff ? [...BASE_ROLES, ADMIN_ROLE] : BASE_ROLES

  return (
    <aside className="users-sidebar">
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
