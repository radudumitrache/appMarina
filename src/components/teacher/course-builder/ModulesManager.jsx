import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDuration } from './courseBuilderUtils'
import ModuleEditModal from './ModuleEditModal'
import '../../css/teacher/course-builder/ModulesManager.css'

const TYPE_LABELS = { vr_tour: 'VR Tour', text: 'Text' }

export default function ModulesManager({
  moduleBank,
  moduleCourseMap,
  saving,
  onCreateModule,
  onUpdateModule,
  onDeleteModule,
  panelsBasePath = '/teacher/modules',
  builderPath    = '/teacher/builder',
}) {
  const navigate = useNavigate()
  const [search,         setSearch]         = useState('')
  const [editModule,     setEditModule]     = useState(null)
  const [confirmDelete,  setConfirmDelete]  = useState(null)
  const [deleteLoading,  setDeleteLoading]  = useState(false)

  const filtered = moduleBank.filter(l => {
    const q = search.toLowerCase().trim()
    return !q || l.title.toLowerCase().includes(q)
  })

  async function handleSave(data) {
    if (editModule?.id) {
      await onUpdateModule(editModule.id, data)
    } else {
      await onCreateModule(data)
    }
    setEditModule(null)
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return
    setDeleteLoading(true)
    try {
      await onDeleteModule(confirmDelete.id)
      setConfirmDelete(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="lm-panel">
      {/* Toolbar */}
      <div className="lm-toolbar">
        {/* New Lesson button disabled for teachers â€” admins only
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
            placeholder="Search modulesâ€¦"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <span className="lm-count">{filtered.length} module{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="lm-table-wrap">
        {filtered.length === 0 ? (
          <div className="lm-empty-state">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <span>No modules found</span>
          </div>
        ) : (
          <table className="lm-table">
            <thead>
              <tr className="lm-thead-row">
                <th className="lm-th lm-th--title">Module</th>
                <th className="lm-th lm-th--type">Type</th>
                <th className="lm-th lm-th--dur">Duration</th>
                <th className="lm-th lm-th--courses">In Courses</th>
                <th className="lm-th lm-th--actions"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((module, i) => {
                const courses = moduleCourseMap[module.id] ?? []
                return (
                  <tr
                    key={module.id}
                    className="lm-row"
                    style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                  >
                    <td className="lm-td lm-td--title">
                      <span className="lm-module-title">{module.title}</span>
                      {module.description && (
                        <span className="lm-module-desc">{module.description}</span>
                      )}
                    </td>
                    <td className="lm-td">
                      <span className={`lm-type-badge lm-type--${module.type}`}>
                        {TYPE_LABELS[module.type] ?? module.type ?? 'â€”'}
                      </span>
                    </td>
                    <td className="lm-td lm-td--mono">
                      {formatDuration(module.duration_minutes)}
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
                          onClick={() => setEditModule(module)}
                          title="Edit module metadata"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          className="lm-action-btn lm-action-btn--preview"
                          onClick={() => navigate(`${panelsBasePath}/${module.id}`, { state: { module } })}
                          title="Preview module"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          Preview
                        </button>
                        <button
                          className="lm-action-btn lm-action-btn--panels"
                          onClick={() => navigate(`${panelsBasePath}/${module.id}/panels`, { state: { backPath: builderPath } })}
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
                          onClick={() => setConfirmDelete(module)}
                          title="Delete module"
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
      {editModule !== null && (
        <ModuleEditModal
          module={editModule?.id ? editModule : null}
          onSave={handleSave}
          onClose={() => setEditModule(null)}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="lm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="lm-confirm" onClick={e => e.stopPropagation()}>
            <p className="lm-confirm-title">Delete module?</p>
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
                {deleteLoading ? 'Deletingâ€¦' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
