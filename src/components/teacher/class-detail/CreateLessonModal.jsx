import { useState, useEffect } from 'react'
import { createLesson } from '../../../api/lessons'
import { assignLesson } from '../../../api/classes'
import { getDepartments } from '../../../api/departments'
import '../../css/teacher/class-detail/AssignLessonModal.css'

const EMPTY = {
  title: '',
  duration_minutes: '',
  visibility: 'class',
  difficulty: 'easy',
}

export default function CreateLessonModal({ classId, onClose, onCreated }) {
  const [form, setForm]           = useState(EMPTY)
  const [departments, setDepts]   = useState([])
  const [deptIds, setDeptIds]     = useState([])
  const [errors, setErrors]       = useState({})
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    getDepartments().then(r => setDepts(r.data)).catch(() => {})
  }, [])

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  const toggleDept = (id) => setDeptIds(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])

  const handleSave = async () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required.'
    if (!form.duration_minutes || isNaN(Number(form.duration_minutes))) errs.duration_minutes = 'Enter a valid number of minutes.'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const { data: lesson } = await createLesson({
        title:            form.title.trim(),
        department_ids:   deptIds,
        duration_minutes: Number(form.duration_minutes),
        visibility:       form.visibility,
        difficulty:       form.difficulty,
      })
      const { data: classLesson } = await assignLesson(classId, { lesson: lesson.id })
      onCreated(classLesson, lesson)
      onClose()
    } catch (err) {
      const d = err?.response?.data
      if (d && typeof d === 'object') {
        setErrors(Object.fromEntries(Object.entries(d).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])))
      } else {
        setErrors({ title: 'Something went wrong. Please try again.' })
      }
    } finally {
      setSaving(false)
    }
  }

  const err = field => errors[field]
    ? <span className="alm-field-error">{errors[field]}</span>
    : null

  return (
    <div className="alm-backdrop" onClick={onClose}>
      <div className="alm-modal alm-modal--form" onClick={e => e.stopPropagation()}>
        <div className="alm-header">
          <h3 className="alm-title">New Lesson</h3>
          <button className="alm-close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="alm-form-body">
          <div className="alm-form-row">
            <label className="alm-label">Title <span className="alm-required">*</span></label>
            <input
              className={`alm-input${errors.title ? ' alm-input--error' : ''}`}
              type="text"
              placeholder="e.g. Bridge Watch Procedures"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              autoFocus
            />
            {err('title')}
          </div>

          <div className="alm-form-row">
            <label className="alm-label">Duration (minutes) <span className="alm-required">*</span></label>
            <input
              className={`alm-input${errors.duration_minutes ? ' alm-input--error' : ''}`}
              type="number"
              min="1"
              placeholder="e.g. 45"
              value={form.duration_minutes}
              onChange={e => set('duration_minutes', e.target.value)}
            />
            {err('duration_minutes')}
          </div>

          {departments.length > 0 && (
            <div className="alm-form-row">
              <label className="alm-label">Departments</label>
              <div className="alm-check-list">
                {departments.map(d => (
                  <label key={d.id} className={`alm-check-item ${deptIds.includes(d.id) ? 'alm-check-item--active' : ''}`}>
                    <span className={`alm-check-box ${deptIds.includes(d.id) ? 'alm-check-box--checked' : ''}`}>
                      {deptIds.includes(d.id) && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </span>
                    <input type="checkbox" checked={deptIds.includes(d.id)} onChange={() => toggleDept(d.id)} style={{ display: 'none' }} />
                    <span className="alm-check-label">{d.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="alm-form-2col">
            <div className="alm-form-row">
              <label className="alm-label">Visibility</label>
              <div className="alm-radio-group">
                {['class', 'public'].map(v => (
                  <label key={v} className={`alm-radio ${form.visibility === v ? 'alm-radio--active' : ''}`}>
                    <input type="radio" name="visibility" value={v} checked={form.visibility === v} onChange={() => set('visibility', v)} />
                    <span>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="alm-form-row">
              <label className="alm-label">Difficulty</label>
              <div className="alm-radio-group">
                {['easy', 'intermediate', 'advanced'].map(v => (
                  <label key={v} className={`alm-radio ${form.difficulty === v ? 'alm-radio--active' : ''}`}>
                    <input type="radio" name="difficulty" value={v} checked={form.difficulty === v} onChange={() => set('difficulty', v)} />
                    <span>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="alm-footer">
          <button className="alm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="alm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Creating…' : 'Create & Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}
