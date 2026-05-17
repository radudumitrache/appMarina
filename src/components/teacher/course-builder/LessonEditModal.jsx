import { useState } from 'react'
import '../../css/teacher/course-builder/LessonEditModal.css'

const DIFFICULTY_OPTIONS = ['easy', 'intermediate', 'advanced']
const VISIBILITY_OPTIONS  = ['class', 'public']

export default function LessonEditModal({ lesson, departments = [], onSave, onClose }) {
  const isNew = !lesson?.id

  const [title,         setTitle]         = useState(lesson?.title ?? '')
  const [departmentIds, setDepartmentIds] = useState(lesson?.department_ids ?? [])
  const [duration,      setDuration]      = useState(lesson?.duration_minutes ?? '')
  const [visibility,    setVisibility]    = useState(lesson?.visibility ?? 'class')
  const [difficulty,    setDifficulty]    = useState(lesson?.difficulty ?? 'easy')
  const [saving,        setSaving]        = useState(false)
  const [err,           setErr]           = useState(null)

  function toggleDept(id) {
    setDepartmentIds(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim())  { setErr('Title is required.'); return }
    if (!duration)      { setErr('Duration is required.'); return }
    setSaving(true)
    setErr(null)
    try {
      await onSave({
        title:            title.trim(),
        department_ids:   departmentIds,
        duration_minutes: Number(duration),
        visibility,
        difficulty,
      })
    } catch {
      setErr('Could not save lesson.')
      setSaving(false)
    }
  }

  return (
    <div className="lem-overlay" onClick={onClose}>
      <div className="lem-modal" onClick={e => e.stopPropagation()}>
        <div className="lem-header">
          <span className="lem-title">{isNew ? 'New Lesson' : 'Edit Lesson'}</span>
          <button className="lem-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form className="lem-form" onSubmit={handleSubmit}>
          <div className="lem-field">
            <label className="lem-label">Title <span className="lem-required">*</span></label>
            <input
              className="lem-input"
              type="text"
              placeholder="e.g. Bridge Watch Procedures"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="lem-field">
            <label className="lem-label">Duration (minutes) <span className="lem-required">*</span></label>
            <input
              className="lem-input"
              type="number"
              min="1"
              placeholder="e.g. 45"
              value={duration}
              onChange={e => setDuration(e.target.value)}
            />
          </div>

          {departments.length > 0 && (
            <div className="lem-field">
              <label className="lem-label">Departments</label>
              <div className="lem-check-list">
                {departments.map(d => (
                  <label key={d.id} className={`lem-check-item ${departmentIds.includes(d.id) ? 'lem-check-item--active' : ''}`}>
                    <span className={`lem-check-box ${departmentIds.includes(d.id) ? 'lem-check-box--checked' : ''}`}>
                      {departmentIds.includes(d.id) && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </span>
                    <input type="checkbox" checked={departmentIds.includes(d.id)} onChange={() => toggleDept(d.id)} style={{ display: 'none' }} />
                    <span className="lem-check-label">{d.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="lem-field">
            <label className="lem-label">Visibility</label>
            <div className="lem-pill-row">
              {VISIBILITY_OPTIONS.map(v => (
                <button
                  key={v}
                  type="button"
                  className={`lem-pill ${visibility === v ? 'lem-pill--active' : ''}`}
                  onClick={() => setVisibility(v)}
                >
                  {v === 'class' ? 'Class' : 'Public'}
                </button>
              ))}
            </div>
          </div>

          <div className="lem-field">
            <label className="lem-label">Difficulty</label>
            <div className="lem-pill-row">
              {DIFFICULTY_OPTIONS.map(d => (
                <button
                  key={d}
                  type="button"
                  className={`lem-pill ${difficulty === d ? 'lem-pill--active' : ''}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {err && <div className="lem-error">{err}</div>}

          <div className="lem-footer">
            <button type="button" className="lem-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="lem-save" disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create Lesson' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
