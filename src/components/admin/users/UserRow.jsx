import { useState } from 'react'
import '../../css/admin/users/UserRow.css'

export default function UserRow({ user, index, onEdit, onToggleStatus, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        className={`user-row${expanded ? ' user-row--expanded' : ''}`}
        style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}
      >
        <td className="user-name-cell">
          <div className="user-name-role">
            <span className="user-name">{user.username}</span>
            <span className={`role-badge role-badge--${user.role} role-badge--mobile-inline`}>{user.role}</span>
          </div>
          <span className="user-email-sub">{user.email}</span>
        </td>
        <td className="user-role-col">
          <span className={`role-badge role-badge--${user.role}`}>{user.role}</span>
        </td>
        <td className="user-crew-id">{user.role !== 'admin' ? (user.crew_id || '—') : '—'}</td>
        <td className="user-email">{user.email}</td>
        <td className="user-org">{user.organisation_name ?? '—'}</td>
        <td>
          <span className={`status-dot status-dot--${user.status}`} />
          <span className="status-label">{user.status}</span>
        </td>
        <td className="user-row-actions">
          <button className="row-btn" onClick={onEdit} title="Edit user">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            className={`row-btn ${user.status === 'active' ? 'row-btn--warn' : 'row-btn--ok'}`}
            onClick={onToggleStatus}
            title={user.status === 'active' ? 'Deactivate' : 'Activate'}
          >
            {user.status === 'active' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
          <button className="row-btn row-btn--delete" onClick={onDelete} title="Delete user">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </td>
        <td className="user-row-actions-mobile">
          <button className="row-expand-btn" onClick={() => setExpanded(o => !o)}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={expanded ? 'expand-icon--open' : ''}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="user-row-actions-expanded">
          <td colSpan={8}>
            <div className="user-actions-bar">
              <button className="action-bar-btn" onClick={() => { onEdit(); setExpanded(false) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
              <button
                className={`action-bar-btn ${user.status === 'active' ? 'action-bar-btn--warn' : 'action-bar-btn--ok'}`}
                onClick={() => { onToggleStatus(); setExpanded(false) }}
              >
                {user.status === 'active' ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                    Deactivate
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Activate
                  </>
                )}
              </button>
              <button className="action-bar-btn action-bar-btn--delete" onClick={() => { onDelete(); setExpanded(false) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Delete
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
