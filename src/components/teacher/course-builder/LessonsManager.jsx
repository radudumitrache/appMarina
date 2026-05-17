import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDuration } from './courseBuilderUtils'
import LessonEditModal from './LessonEditModal'
import '../../css/teacher/course-builder/LessonsManager.css'

const TYPE_LABELS = { vr_tour: 'VR Tour', text: 'Text' }

export default function LessonsManager({
  lessonBank,
  lessonCourseMap,
  departments = [],
  saving,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  panelsBasePath = '/teacher/lessons',
  builderPath    = '/teacher/builder',
}) {
  const navigate = useNavigate()
  const [search,         setSearch]         = useState('')
  const [deptFilter,     setDeptFilter]     = useState('')
  const [editLesson,     setEditLesson]     = useState(null)
  const [confirmDelete,  setConfirmDelete]  = useState(null)
  const [deleteLoading,  setDeleteLoading]  = useState(false)

  const deptName = id => departments.find(d => d.id === id)?.name ?? id

  const filtered = lessonBank.filter(l => {
    const q = search.toLowerCase().trim()
    const matchSearch = !q || l.title.toLowerCase().includes(q)
    const matchDept   = !deptFilter || (l.department_ids ?? []).includes(Number(deptFilter))
    return matchSearch && matchDept
  })

  async function handleSave(data) {
    if (editLesson?.id) {
      await onUpdateLesson(editLesson.id, data)
    } else {
      await onCreateLesson(data)
    }
    setEditLesson(null)
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return
    setDeleteLoading(true)
    try {
      await onDeleteLesson(confirmDelete.id)
      setConfirmDelete(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="lm-panel">
      {/* Toolbar */}
      <div className="lm-toolbar">
        {/* New Lesson button disabled for teachers — admins only
        <button className="lm-new-btn" onClick={() => setEditLesson({})}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Lesson
        </button>
        */}

        <div className="lm-search-wrap">
          <svg className="lm-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="lm-search"
            type="text"
            placeholder="Search lessons…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="lm-cat-filters">
          <button
            className={`lm-cat-btn ${deptFilter === '' ? 'lm-cat-btn--active' : ''}`}
            onClick={() => setDeptFilter('')}
          >
            All
          </button>
          {departments.map(d => (
            <button
              key={d.id}
              className={`lm-cat-btn ${deptFilter === String(d.id) ? 'lm-cat-btn--active' : ''}`}
              onClick={() => setDeptFilter(String(d.id))}
            >
              {d.name}
            </button>
          ))}
        </div>

        <span className="lm-count">{filtered.length} lesson{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="lm-table-wrap">
        {filtered.length === 0 ? (
          <div className="lm-empty-state">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>No lessons found</span>
          </div>
        ) : (
          <table className="lm-table">
            <thead>
              <tr className="lm-thead-row">
                <th className="lm-th lm-th--title">Lesson</th>
                <th className="lm-th lm-th--cat">Departments</th>
                <th className="lm-th lm-th--type">Type</th>
                <th className="lm-th lm-th--dur">Duration</th>
                <th className="lm-th lm-th--courses">In Courses</th>
                <th className="lm-th lm-th--actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lesson, i) => {
                const courses = lessonCourseMap[lesson.id] ?? []
                return (
                  <tr
                    key={lesson.id}
                    className="lm-row"
                    style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                  >
                    <td className="lm-td lm-td--title">
                      <span className="lm-lesson-title">{lesson.title}</span>
                      {lesson.description && (
                        <span className="lm-lesson-desc">{lesson.description}</span>
                      )}
                    </td>
                    <td className="lm-td">
                      {(lesson.department_ids ?? []).length > 0 ? (
                        <div className="lm-dept-tags">
                          {(lesson.department_ids ?? []).map(id => (
                            <span key={id} className="cb-dept-tag">{deptName(id)}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="lm-no-value">—</span>
                      )}
                    </td>
                    <td className="lm-td">
                      <span className={`lm-type-badge lm-type--${lesson.type}`}>
                        {TYPE_LABELS[lesson.type] ?? lesson.type ?? '—'}
                      </span>
                    </td>
                    <td className="lm-td lm-td--mono">
                      {formatDuration(lesson.duration_minutes)}
                    </td>
                    <td className="lm-td lm-td--courses">
                      {courses.length === 0 ? (
                        <span className="lm-warn-cell">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                          Assign to a course &amp; class to enable media uploads
                        </span>
                      ) : (
                        <div className="lm-course-tags">
                          {courses.map(c => (
                            <span key={c.id} className="lm-course-tag">{c.title}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="lm-td lm-td--actions">
                      <div className="lm-actions">
                        <button
                          className="lm-action-btn lm-action-btn--edit"
                          onClick={() => setEditLesson(lesson)}
                          title="Edit lesson metadata"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          className="lm-action-btn lm-action-btn--preview"
                          onClick={() => navigate(`${panelsBasePath}/${lesson.id}`, { state: { lesson } })}
                          title="Preview lesson"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          Preview
                        </button>
                        <button
                          className="lm-action-btn lm-action-btn--panels"
                          onClick={() => navigate(`${panelsBasePath}/${lesson.id}/panels`, { state: { backPath: builderPath } })}
                          title="Edit panels"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                          </svg>
                          Panels
                        </button>
                        <button
                          className="lm-action-btn lm-action-btn--delete"
                          onClick={() => setConfirmDelete(lesson)}
                          title="Delete lesson"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit / Create Modal */}
      {editLesson !== null && (
        <LessonEditModal
          lesson={editLesson?.id ? editLesson : null}
          departments={departments}
          onSave={handleSave}
          onClose={() => setEditLesson(null)}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="lm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="lm-confirm" onClick={e => e.stopPropagation()}>
            <p className="lm-confirm-title">Delete lesson?</p>
            <p className="lm-confirm-body">
              <strong>{confirmDelete.title}</strong> will be permanently deleted and removed from all courses.
            </p>
            <div className="lm-confirm-actions">
              <button className="lm-confirm-cancel" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button
                className="lm-confirm-delete"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
