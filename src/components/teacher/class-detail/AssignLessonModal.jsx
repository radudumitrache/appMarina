import { useState, useEffect } from 'react'
import { getLessons } from '../../../api/lessons'
import { assignLesson } from '../../../api/classes'
import '../../css/teacher/class-detail/AssignLessonModal.css'

const CAT_LABELS = { nav: 'Navigation', emg: 'Emergency', eng: 'Engineering', cargo: 'Cargo', comm: 'Communication' }

export default function AssignLessonModal({ classId, assignedIds = [], onClose, onAssigned }) {
  const [lessons, setLessons]   = useState([])
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getLessons()
      .then(({ data }) => setLessons(data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = lessons.filter(l => {
    const q = search.toLowerCase().trim()
    return l.title.toLowerCase().includes(q) || (l.category || '').toLowerCase().includes(q)
  })

  const handleAssign = async () => {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      const { data } = await assignLesson(classId, { lesson: selected })
      onAssigned(data)
      onClose()
    } catch {
      setError('Failed to assign lesson. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="alm-backdrop" onClick={onClose}>
      <div className="alm-modal" onClick={e => e.stopPropagation()}>
        <div className="alm-header">
          <h3 className="alm-title">Assign Lesson</h3>
          <button className="alm-close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="alm-search-wrap">
          <svg className="alm-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            className="alm-search"
            type="text"
            placeholder="Search lessons…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="alm-list">
          {loading ? (
            <p className="alm-empty">Loading lessons…</p>
          ) : filtered.length === 0 ? (
            <p className="alm-empty">No lessons found.</p>
          ) : (
            filtered.map(l => {
              const already = assignedIds.includes(l.id)
              const isSelected = selected === l.id
              return (
                <button
                  key={l.id}
                  className={`alm-row ${isSelected ? 'alm-row--selected' : ''} ${already ? 'alm-row--assigned' : ''}`}
                  onClick={() => !already && setSelected(l.id)}
                  disabled={already}
                >
                  <div className="alm-row-main">
                    <span className="alm-row-title">{l.title}</span>
                    <div className="alm-row-meta">
                      {l.category && <span className="alm-tag">{CAT_LABELS[l.category] ?? l.category}</span>}
                      {l.duration_minutes && <span className="alm-dur">{l.duration_minutes} min</span>}
                    </div>
                  </div>
                  {already && <span className="alm-assigned-badge">Assigned</span>}
                  {isSelected && !already && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              )
            })
          )}
        </div>

        {error && <p className="alm-error">{error}</p>}

        <div className="alm-footer">
          <button className="alm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="alm-btn-primary" onClick={handleAssign} disabled={!selected || saving}>
            {saving ? 'Assigning…' : 'Assign Lesson'}
          </button>
        </div>
      </div>
    </div>
  )
}
