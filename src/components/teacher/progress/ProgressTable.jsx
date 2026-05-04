import { STATUS_META } from '../../../pages/teacher/progressMock'
import '../../css/teacher/progress/ProgressTable.css'

function scoreColor(s) {
  if (s === null) return 'score--none'
  if (s >= 90)   return 'score--pass'
  if (s >= 70)   return 'score--good'
  if (s >= 50)   return 'score--warn'
  return 'score--fail'
}

export default function ProgressTable({ students, totalCount }) {
  return (
    <>
      <div className="tp-table-wrap">
        <div className="tp-table-head">
          <span className="tp-col tp-col--student">Student</span>
          <span className="tp-col tp-col--class">Class</span>
          <span className="tp-col tp-col--progress">Progress</span>
          <span className="tp-col tp-col--lessons">Lessons</span>
          <span className="tp-col tp-col--score">Avg. Score</span>
          <span className="tp-col tp-col--last">Last Active</span>
          <span className="tp-col tp-col--status">Status</span>
        </div>

        {students.length === 0 ? (
          <p className="tp-empty">No students match your filters.</p>
        ) : (
          students.map((s, i) => {
            const pct    = Math.round((s.lessonsDone / s.lessonsTotal) * 100)
            const status = STATUS_META[s.status]
            return (
              <div
                key={s.id}
                className={`tp-row ${s.status === 'at-risk' ? 'tp-row--risk' : ''}`}
                style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
              >
                <div className="tp-col tp-col--student tp-student-cell">
                  <div className={`tp-avatar tp-avatar--${s.status}`}>{s.initials}</div>
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
                <div className="tp-col tp-col--lessons">
                  <span className="tp-mono">{s.lessonsDone}/{s.lessonsTotal}</span>
                </div>
                <div className="tp-col tp-col--score">
                  {s.avgScore !== null
                    ? <span className={`tp-score ${scoreColor(s.avgScore)}`}>{s.avgScore}%</span>
                    : <span className="tp-mono tp-muted">—</span>
                  }
                </div>
                <div className="tp-col tp-col--last">
                  <span className="tp-mono tp-muted">{s.lastActive}</span>
                </div>
                <div className="tp-col tp-col--status">
                  <span className={`tp-badge ${status.className}`}>{status.label}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="tp-table-footer">
        <span className="tp-footer-count">
          Showing <span className="tp-footer-num">{students.length}</span> of <span className="tp-footer-num">{totalCount}</span> students
        </span>
      </div>
    </>
  )
}
