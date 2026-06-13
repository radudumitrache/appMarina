import { useState } from 'react'
import { createCourse, addCourseModule } from '../../../api/modules'
import '../../css/teacher/class-detail/AssignModuleModal.css'

export default function CreateCourseModal({ classModules = [], onClose, onCreated }) {
  const [title, setTitle]           = useState('')
  const [desc, setDesc]             = useState('')
  const [selected, setSelected]     = useState(new Set())
  const [titleError, setTitleError] = useState(null)
  const [saving, setSaving]         = useState(false)

  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const handleSave = async () => {
    if (!title.trim()) { setTitleError('Course title is required.'); return }
    setTitleError(null)
    setSaving(true)
    try {
      const { data: course } = await createCourse({ title: title.trim(), description: desc.trim() })
      await Promise.all([...selected].map(moduleId => addCourseModule(course.id, { module_id: moduleId })))
      onCreated(course)
      onClose()
    } catch {
      setTitleError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="alm-backdrop" onClick={onClose}>
      <div className="alm-modal alm-modal--form" onClick={e => e.stopPropagation()}>
        <div className="alm-header">
          <h3 className="alm-title">New Course</h3>
          <button className="alm-close" onClick={onClose}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="alm-form-body">
          <div className="alm-form-row">
            <label className="alm-label">Course Title <span className="alm-required">*</span></label>
            <input
              className={`alm-input${titleError ? ' alm-input--error' : ''}`}
              type="text"
              placeholder="e.g. Maritime Navigation Fundamentals"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(null) }}
              autoFocus
            />
            {titleError && <span className="alm-field-error">{titleError}</span>}
          </div>

          <div className="alm-form-row">
            <label className="alm-label">Description</label>
            <textarea
              className="alm-input alm-textarea"
              placeholder="Short description of this courseâ€¦"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={2}
            />
          </div>

          {classModules.length > 0 && (
            <div className="alm-form-row">
              <label className="alm-label">Add class modules to this course</label>
              <div className="alm-module-checklist">
                {classModules.map(l => (
                  <label key={l.id} className={`alm-check-row ${selected.has(l.id) ? 'alm-check-row--active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selected.has(l.id)}
                      onChange={() => toggle(l.id)}
                    />
                    <span className="alm-check-title">{l.title}</span>
                    {l.cat && <span className="alm-tag">{l.cat}</span>}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="alm-footer">
          <button className="alm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="alm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Creatingâ€¦' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  )
}
