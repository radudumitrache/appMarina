import '../../css/trainer/progress/ProgressTable.css'

const PAGE_SIZES = [10, 15, 20]

const STATUS_META = {
  'to-begin':    { label: 'To Begin',    cls: 'badge--to-begin',    rowCls: 'tp-row--to-begin'    },
  'in-progress': { label: 'In Progress', cls: 'badge--in-progress', rowCls: 'tp-row--in-progress' },
  'completed':   { label: 'Completed',   cls: 'badge--completed',   rowCls: 'tp-row--completed'   },
  'awarded':     { label: 'Awarded',     cls: 'badge--awarded',     rowCls: 'tp-row--awarded'     },
}

export default function ProgressTable({
  crew, allVisible = [], filteredCount, totalCount, onSelect, selectedId,
  page, pageSize, totalPages, onPageChange, onPageSizeChange,
  busyIds = new Set(), onAward, onRevoke, onBulkAward, onBulkRevoke,
}) {
  const completedCrew  = allVisible.filter(s => s.status === 'completed')
  const incompleteCrew = allVisible.filter(s => s.status === 'awarded' && s.coursesDone < s.coursesTotal)

  return (
    <>
      {/* ── Bulk actions ─────────────────────────────────────────── */}
      {(completedCrew.length > 0 || incompleteCrew.length > 0) && (
        <div className="tp-bulk-bar">
          {completedCrew.length > 0 && (
            <button
              className="tp-bulk-btn tp-bulk-btn--award"
              onClick={() => onBulkAward(completedCrew)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
              Award completed ({completedCrew.length})
            </button>
          )}
          {incompleteCrew.length > 0 && (
            <button
              className="tp-bulk-btn tp-bulk-btn--revoke"
              onClick={() => onBulkRevoke(incompleteCrew)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                <line x1="4" y1="4" x2="20" y2="20"/>
              </svg>
              Revoke awarded incomplete ({incompleteCrew.length})
            </button>
          )}
        </div>
      )}

      <div className="tp-table-wrap">
        <div className="tp-table-head">
          <span className="tp-col tp-col--crew">Crew Member</span>
          <span className="tp-col tp-col--class">Department</span>
          <span className="tp-col tp-col--progress">Progress</span>
          <span className="tp-col tp-col--modules">Items</span>
          <span className="tp-col tp-col--status-hd">Status</span>
          <span className="tp-col tp-col--action-hd" />
        </div>

        {crew.length === 0 ? (
          <p className="tp-empty">No crew match your filters.</p>
        ) : (
          crew.map((s, i) => {
            const pct      = s.coursesTotal > 0 ? Math.round((s.coursesDone / s.coursesTotal) * 100) : 0
            const sm       = STATUS_META[s.status] ?? STATUS_META['to-begin']
            const fillCls  = s.status === 'completed' || s.status === 'awarded' ? 'tp-bar-fill--complete' : ''
            const rowKey   = `${s.id}-${s.departmentId}`
            const isBusy   = busyIds.has(rowKey)

            return (
              <div
                key={rowKey}
                className={`tp-row ${sm.rowCls} ${selectedId === s.id ? 'tp-row--selected' : ''}`}
                style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                onClick={() => onSelect(s)}
              >
                {/* Crew Member */}
                <div className="tp-col tp-col--crew tp-crew-cell">
                  <div className="tp-avatar">{s.initials}</div>
                  <div className="tp-crew-info">
                    <span className="tp-crew-name">{s.name}</span>
                    <span className="tp-crew-sub">Last active: {s.lastActive}</span>
                  </div>
                </div>

                {/* Department */}
                <div className="tp-col tp-col--class">
                  <span className="tp-class-name">{s.className}</span>
                </div>

                {/* Progress bar */}
                <div className="tp-col tp-col--progress tp-progress-cell">
                  <div className="tp-bar-track">
                    <div className={`tp-bar-fill ${fillCls}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="tp-pct">{pct}%</span>
                </div>

                {/* Items count */}
                <div className="tp-col tp-col--modules" style={{ display: 'flex', justifyContent: 'center' }}>
                  <span className="tp-mono">{s.coursesDone}<span className="tp-muted">/{s.coursesTotal}</span></span>
                </div>

                {/* Status badge */}
                <div className="tp-col tp-col--status-hd">
                  <span className={`tp-badge ${sm.cls}`}>
                    <span className="tp-badge-dot" />
                    {sm.label}
                  </span>
                </div>

                {/* Row action */}
                <div className="tp-col tp-col--action-hd" onClick={e => e.stopPropagation()}>
                  {s.status === 'awarded' ? (
                    <button
                      className="tp-row-btn tp-row-btn--revoke"
                      disabled={isBusy}
                      onClick={() => onRevoke(s)}
                      title="Revoke diploma"
                    >
                      {isBusy ? '...' : 'Revoke'}
                    </button>
                  ) : s.status === 'completed' ? (
                    <button
                      className="tp-row-btn tp-row-btn--award"
                      disabled={isBusy}
                      onClick={() => onAward(s)}
                      title="Award diploma"
                    >
                      {isBusy ? '...' : 'Award'}
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="tp-table-footer">
        <span className="tp-footer-count">
          Showing{' '}
          <span className="tp-footer-num">{Math.min((page - 1) * pageSize + 1, filteredCount)}</span>
          {' '}&ndash;{' '}
          <span className="tp-footer-num">{Math.min(page * pageSize, filteredCount)}</span>
          {' '}of <span className="tp-footer-num">{filteredCount}</span>
          {filteredCount !== totalCount && <> (filtered from <span className="tp-footer-num">{totalCount}</span>)</>}
        </span>

        <div className="tp-pagination">
          <div className="tp-page-size">
            <span className="tp-page-size-label">Per page</span>
            {PAGE_SIZES.map(n => (
              <button
                key={n}
                className={`tp-page-size-btn ${pageSize === n ? 'tp-page-size-btn--active' : ''}`}
                onClick={() => onPageSizeChange(n)}
              >{n}</button>
            ))}
          </div>

          <div className="tp-page-nav">
            <button
              className="tp-page-btn"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span className="tp-page-info">
              <span className="tp-footer-num">{page}</span>
              <span className="tp-page-sep"> / </span>
              <span className="tp-footer-num">{totalPages}</span>
            </span>
            <button
              className="tp-page-btn"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
