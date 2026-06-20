import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../css/admin/class-detail/AdminStudentsPanel.css'

function DiplomaDropdown({ student, diplomas, onAward, onRevoke, onClose }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [onClose])

  async function toggle(diploma) {
    const awarded = (diploma.recipients ?? []).some(r => r.id === student.id)
    setBusy(true)
    try {
      if (awarded) await onRevoke(diploma.id, student.id)
      else await onAward(diploma.id, student.id)
    } finally { setBusy(false) }
  }

  return (
    <div className="asp-dip-drop" ref={ref}>
      <div className="asp-dip-drop-hd">Diplomas — {student.name.split(' ')[0]}</div>
      {diplomas.length === 0 ? (
        <p className="asp-dip-drop-empty">No diplomas in this department.</p>
      ) : (
        diplomas.map(d => {
          const awarded = (d.recipients ?? []).some(r => r.id === student.id)
          return (
            <div key={d.id} className={`asp-dip-row${awarded ? ' asp-dip-row--on' : ''}`}>
              <span className="asp-dip-title">{d.title}</span>
              <button
                className={`asp-dip-btn${awarded ? ' asp-dip-btn--revoke' : ' asp-dip-btn--award'}`}
                onClick={() => toggle(d)}
                disabled={busy}
              >
                {awarded ? 'Revoke' : 'Award'}
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}

export default function AdminStudentsPanel({
  students,
  diplomas = [],
  searchValue, onSearchChange,
  suggestions, isFocused, onFocus, onBlur,
  onAdd, onRemove,
  onAward, onRevoke,
}) {
  const navigate = useNavigate()
  const [diplomaTarget, setDiplomaTarget] = useState(null)

  const pct = s => {
    const t = s.courseLessonsTotal || 0
    const d = s.courseLessonsDone  || 0
    return t > 0 ? Math.round((d / t) * 100) : 0
  }

  function statusLabel(s) {
    const p = pct(s)
    if ((s.coursesTotal || 0) > 0 && s.coursesDone >= s.coursesTotal) return 'completed'
    if (p > 0) return 'in-progress'
    return 'to-begin'
  }

  const STATUS_LABEL = { completed: 'Completed', 'in-progress': 'In Progress', 'to-begin': 'To Begin' }

  return (
    <div className="asp-panel">
      {/* Header */}
      <div className="asp-header">
        <span className="asp-title">Students</span>
        <span className="asp-count">{students.length}</span>
      </div>

      {/* Enroll search */}
      <div className="asp-add-wrap">
        <div className="asp-search-box">
          <svg className="asp-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="asp-search"
            placeholder="Enroll a student..."
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
        {isFocused && suggestions.length > 0 && (
          <div className="asp-suggestions">
            {suggestions.map(s => (
              <button key={s.id} className="asp-suggestion" onMouseDown={() => onAdd(s)}>
                <div className="asp-sug-avatar">{(s.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
                <div className="asp-sug-info">
                  <span className="asp-sug-name">{s.name}</span>
                  <span className="asp-sug-email">{s.email}</span>
                </div>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Column headers */}
      {students.length > 0 && (
        <div className="asp-list-hd">
          <span className="asp-col asp-col--student">Student</span>
          <span className="asp-col asp-col--progress">Progress</span>
          <span className="asp-col asp-col--status">Status</span>
        </div>
      )}

      {/* Student rows */}
      <div className="asp-list">
        {students.length === 0 ? (
          <p className="asp-empty">No students enrolled yet.</p>
        ) : (
          students.map((s, i) => {
            const p      = pct(s)
            const done   = s.coursesDone   || 0
            const total  = s.coursesTotal  || 0
            const status = statusLabel(s)
            const isDone = status === 'completed'
            const isOpen = diplomaTarget?.id === s.id

            return (
              <div
                key={s.id}
                className="asp-student"
                style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
              >
                {/* Avatar */}
                <div className={`asp-avatar${isDone ? ' asp-avatar--done' : ''}`}>{s.initials}</div>

                {/* Info */}
                <div className="asp-info">
                  <button className="asp-name" onClick={() => navigate(`/admin/students/${s.id}/progress`)}>
                    {s.name}
                  </button>
                  <span className="asp-email">{s.email}</span>

                  {/* Progress bar row */}
                  <div className="asp-prog-row">
                    <span className={`asp-pct${isDone ? ' asp-pct--done' : ''}`}>{p}%</span>
                    <div className="asp-bar">
                      <div className={`asp-bar-fill${isDone ? ' asp-bar-fill--done' : ''}`} style={{ width: `${p}%` }} />
                    </div>
                    <span className="asp-courses">{done}/{total}</span>
                  </div>
                </div>

                {/* Status */}
                <span className={`asp-status asp-status--${status}`}>{STATUS_LABEL[status]}</span>

                {/* Actions (show on hover) */}
                <div className="asp-actions">
                  {/* Diploma quick-award */}
                  <div className="asp-dip-wrap">
                    <button
                      className={`asp-act-btn asp-act-btn--dip${isOpen ? ' asp-act-btn--active' : ''}`}
                      title="Diplomas"
                      onClick={() => setDiplomaTarget(isOpen ? null : s)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6"/>
                        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                      </svg>
                    </button>
                    {isOpen && (
                      <DiplomaDropdown
                        student={s}
                        diplomas={diplomas}
                        onAward={onAward}
                        onRevoke={onRevoke}
                        onClose={() => setDiplomaTarget(null)}
                      />
                    )}
                  </div>

                  {/* Remove */}
                  <button className="asp-act-btn asp-act-btn--remove" onClick={() => onRemove(s.id)} title="Remove student">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
