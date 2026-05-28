import { useState } from 'react'
import '../../css/admin/lessons/LessonRow.css'

export default function LessonRow({ lesson, departments = [], index, canEdit = true, onView, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const deptName = departments.find(c => c.id === lesson.department_id)?.name ?? null
  const missingDept = lesson.visibility === 'class' && !lesson.department_id

  const statusBadge = (
    <span className={`lesson-status-badge lesson-status-badge--${lesson.visibility}${missingDept ? ' lesson-status-badge--warn' : ''}`}>
      {lesson.visibility === 'class' && deptName
        ? <>Department<span className="lesson-status-class-name"> · {deptName}</span></>
        : lesson.visibility === 'class'
          ? <>
              {missingDept && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, flexShrink: 0 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              )}
              Department
            </>
          : lesson.visibility
      }
    </span>
  )

  return (
    <div
      className={`lesson-row${expanded ? ' lesson-row--expanded' : ''}${missingDept ? ' lesson-row--warn' : ''}`}
      style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}
    >
      {/* ── always-visible header row ── */}
      <div className="lesson-row-header">
        <div className="lesson-row-main">
          <div className="lesson-row-title">{lesson.title}</div>
          <div className="lesson-row-meta lesson-row-meta--desktop">
            <span className="lesson-duration">{lesson.duration}</span>
            <span className="lesson-meta-sep">·</span>
            <span className={`lesson-difficulty lesson-difficulty--${lesson.difficulty}`}>
              {lesson.difficulty}
            </span>
            <span className="lesson-meta-sep">·</span>
            <span className="lesson-author">{lesson.author}</span>
          </div>
        </div>

        <div className="lesson-row-right">
          {statusBadge}
          {/* desktop action buttons */}
          <div className="lesson-row-actions">
            <button className="row-btn" onClick={onView} title="View lesson">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            {canEdit && (
              <button className="row-btn" onClick={onEdit} title="Edit lesson">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            {canEdit && (
              <button className="row-btn row-btn--delete" onClick={onDelete} title="Delete lesson">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            )}
          </div>
          {/* mobile chevron toggle */}
          <button className="lesson-expand-btn" onClick={() => setExpanded(o => !o)}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={expanded ? 'expand-icon--open' : ''}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── collapsible detail + actions (mobile only) ── */}
      {expanded && (
        <div className="lesson-row-collapse">
          <div className="lesson-collapse-meta">
            <span className="lesson-duration">{lesson.duration}</span>
            <span className="lesson-meta-sep">·</span>
            <span className={`lesson-difficulty lesson-difficulty--${lesson.difficulty}`}>
              {lesson.difficulty}
            </span>
            <span className="lesson-meta-sep">·</span>
            <span className="lesson-author">{lesson.author}</span>
          </div>

          <div className="lesson-collapse-actions">
            <button className="action-bar-btn" onClick={() => { onView(); setExpanded(false) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              View
            </button>
            {canEdit && (
              <button className="action-bar-btn" onClick={() => { onEdit(); setExpanded(false) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
            )}
            {canEdit && (
              <button className="action-bar-btn action-bar-btn--delete" onClick={() => { onDelete(); setExpanded(false) }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
