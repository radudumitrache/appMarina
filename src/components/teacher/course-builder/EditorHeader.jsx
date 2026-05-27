import { useState } from 'react'
import '../../css/teacher/course-builder/EditorHeader.css'
import Dropdown from '../../shared/Dropdown'

export default function EditorHeader({
  selected,
  classes = [],
  onTitleChange,
  onDescChange,
  onClassroomChange,
  onToggleStatus,
  onDeleteCourse,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="cb-editor-header">
      <div className="cb-course-meta">
        <input
          className="cb-title-input"
          value={selected.title}
          onChange={e => onTitleChange(selected.id, e.target.value)}
          placeholder="Course title…"
        />
        <input
          className="cb-desc-input"
          value={selected.description ?? ''}
          onChange={e => onDescChange(selected.id, e.target.value)}
          placeholder="Add a short description…"
        />
        {classes.length > 0 && (
          <div className="cb-classroom-row">
            <span className="cb-classroom-label">Class</span>
            <Dropdown
              value={selected.department_id ?? null}
              onChange={v => onClassroomChange?.(selected.id, v)}
              placeholder="— unassigned —"
              options={classes.map(c => ({ value: c.id, label: `${c.name} (${c.code})` }))}
            />
          </div>
        )}
      </div>

      <div className="cb-course-actions-bar">
        <span className={`cb-status-badge cb-status--${selected.status}`}>
          {selected.status}
        </span>
        <button className="cb-toggle-btn" onClick={() => onToggleStatus(selected.id)}>
          {selected.status === 'draft' ? 'Publish' : 'Unpublish'}
        </button>
        {confirmDelete ? (
          <div className="cb-delete-confirm">
            <span className="cb-delete-confirm-label">Delete course?</span>
            <button className="cb-delete-confirm-yes" onClick={() => { onDeleteCourse(selected.id); setConfirmDelete(false) }}>
              Yes, delete
            </button>
            <button className="cb-delete-confirm-no" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="cb-delete-course-btn" onClick={() => setConfirmDelete(true)} title="Delete course">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
