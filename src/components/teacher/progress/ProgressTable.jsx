import '../../css/teacher/progress/ProgressTable.css'

const PAGE_SIZES = [10, 15, 20]

export default function ProgressTable({
  students, filteredCount, totalCount, onSelect, selectedId,
  page, pageSize, totalPages, onPageChange, onPageSizeChange,
}) {
  return (
    <>
      <div className="tp-table-wrap">
        <div className="tp-table-head">
          <span className="tp-col tp-col--student">Student</span>
          <span className="tp-col tp-col--class">Class</span>
          <span className="tp-col tp-col--progress">Progress</span>
          <span className="tp-col tp-col--modules">Courses</span>
        </div>

        {students.length === 0 ? (
          <p className="tp-empty">No students match your filters.</p>
        ) : (
          students.map((s, i) => {
            const pct = s.coursesTotal > 0 ? Math.round((s.coursesDone / s.coursesTotal) * 100) : 0
            return (
              <div
                key={`${s.id}-${s.departmentId}`}
                className={`tp-row ${selectedId === s.id ? 'tp-row--selected' : ''}`}
                style={{ animationDelay: `${Math.min(i, 6) * 0.04}s`, cursor: 'pointer' }}
                onClick={() => onSelect(s)}
              >
                <div className="tp-col tp-col--student tp-student-cell">
                  <div className="tp-avatar">{s.initials}</div>
                  <span className="tp-student-name">{s.name}</span>
                </div>
                <div className="tp-col tp-col--class">
                  <span className="tp-class-name">{s.className}</span>
                </div>
                <div className="tp-col tp-col--progress tp-progress-cell">
                  <div className="tp-bar-track">
                    <div
                      className={`tp-bar-fill ${pct === 100 ? 'tp-bar-fill--complete' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="tp-pct">{pct}%</span>
                </div>
                <div className="tp-col tp-col--modules">
                  <span className="tp-mono">{s.coursesDone}/{s.coursesTotal}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="tp-table-footer">
        <span className="tp-footer-count">
          Showing <span className="tp-footer-num">{Math.min((page - 1) * pageSize + 1, filteredCount)}</span>
          {' '}&ndash;{' '}
          <span className="tp-footer-num">{Math.min(page * pageSize, filteredCount)}</span> of <span className="tp-footer-num">{filteredCount}</span>
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
