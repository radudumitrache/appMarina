import { useState } from 'react'
import { STATUS_META } from '../../../pages/trainer/testBuilderMock'
import '../../css/trainer/test-builder/TestSidebar.css'

export default function TestSidebar({ tests, selectedId, onSelect, onNew, onDelete, loading, className = '', warnNoDept = false }) {
  const [search,        setSearch]        = useState('')
  const [confirmingId,  setConfirmingId]  = useState(null)
  const [deleting,      setDeleting]      = useState(false)

  const visible = tests.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase().trim())
  )

  async function handleConfirmDelete(e, id) {
    e.stopPropagation()
    setDeleting(true)
    try {
      await onDelete(id)
    } finally {
      setDeleting(false)
      setConfirmingId(null)
    }
  }

  return (
    <aside className={`tb-sidebar${className ? ` ${className}` : ''}`}>
      <div className="tb-sidebar-top">
        <div className="tb-sidebar-search-wrap">
          <svg className="tb-sidebar-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="tb-sidebar-search"
            type="text"
            placeholder="Search tests…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="tb-new-btn" onClick={onNew}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New
        </button>
      </div>

      <nav className="tb-test-nav">
        {loading && <div className="tb-sidebar-loading">Loading…</div>}
        {!loading && visible.map(t => {
          const meta        = STATUS_META[t.status] ?? STATUS_META.draft
          const confirming  = confirmingId === t.id
          const noDept      = warnNoDept && !(t.departments?.length)
          return (
            <div
              key={t.id}
              className={`tb-test-item ${selectedId === t.id ? 'tb-test-item--active' : ''} ${noDept ? 'tb-test-item--no-dept' : ''}`}
              onClick={() => { if (!confirming) onSelect(t.id) }}
            >
              <div className="tb-test-item-row">
                <span className="tb-test-item-title">{t.title}</span>
                {noDept && (
                  <span className="tb-test-item-warn-icon" title="No department — invisible to students">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                )}
                <span className={`tb-test-item-status ${meta.cls}`}>
                  {meta.label}
                </span>
                {onDelete && !confirming && (
                  <button
                    className="tb-test-item-delete"
                    onClick={e => { e.stopPropagation(); setConfirmingId(t.id) }}
                    title="Delete test"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                )}
              </div>

              {confirming && (
                <div className="tb-test-item-confirm" onClick={e => e.stopPropagation()}>
                  <span className="tb-test-item-confirm-label">Delete this test?</span>
                  <div className="tb-test-item-confirm-actions">
                    <button
                      className="tb-test-item-confirm-yes"
                      disabled={deleting}
                      onClick={e => handleConfirmDelete(e, t.id)}
                    >
                      {deleting ? '…' : 'Delete'}
                    </button>
                    <button
                      className="tb-test-item-confirm-no"
                      disabled={deleting}
                      onClick={e => { e.stopPropagation(); setConfirmingId(null) }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!confirming && (
                <div className="tb-test-item-meta">
                  <span>{t.departments?.length ? t.departments.map(d => d.name).join(', ') : 'No department'}</span>
                  <span>{t.time_limit_minutes} min</span>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="tb-sidebar-footer">
        <span className="tb-sidebar-footer-num">{tests.filter(t => t.status === 'published').length}</span>
        {' '}of{' '}
        <span className="tb-sidebar-footer-num">{tests.length}</span>
        {' '}published
      </div>
    </aside>
  )
}
