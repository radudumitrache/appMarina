import { fmt, gradeClass } from './helpers'

export default function SubmissionHeader({ submission, pendingCount }) {
  const grade  = submission.grade
  const gClass = gradeClass(grade)

  return (
    <div className="so-header">
      <div className="so-header-crew">
        <div className="so-avatar">{(submission.crew_name ?? '?').charAt(0)}</div>
        <div className="so-crew-info">
          <span className="so-crew-name">{submission.crew_name}</span>
          <span className="so-crew-email">{submission.crew_email}</span>
        </div>
      </div>

      <div className="so-header-test">
        <span className="so-test-title">{submission.test_title}</span>
        <span className="so-test-meta">
          By {submission.test_author_name} · Submitted {fmt(submission.submitted_at)}
          {pendingCount > 0 && ` · ${pendingCount} pending review`}
        </span>
      </div>

      <div className="so-header-grade">
        <div className={`so-grade-display ${gClass}`}>
          {grade != null
            ? <><span className="so-grade-num">{Math.round(grade)}</span><span className="so-grade-pct">%</span></>
            : <span className="so-grade-num">—</span>
          }
        </div>
        <span className="so-min-grade">
          {submission.minimum_passing_grade != null
            ? <>Min. to pass: <strong>{submission.minimum_passing_grade}%</strong></>
            : 'No minimum specified'
          }
        </span>
      </div>
    </div>
  )
}

export function GradeBar({ gradeInput, currentGrade, onGradeChange, onGradeKeyDown, onGradeSave, gradeSaving }) {
  return (
    <div className="so-grade-bar">
      <span className="so-grade-bar-label">{currentGrade == null ? 'Set grade' : 'Override grade'}</span>
      <div className="so-grade-bar-controls">
        <input
          className="so-grade-input"
          type="number"
          min={0} max={100} step={0.1}
          placeholder="0 – 100"
          value={gradeInput}
          onChange={onGradeChange}
          onKeyDown={onGradeKeyDown}
        />
        <button
          className="so-grade-save"
          onClick={onGradeSave}
          disabled={gradeSaving}
        >
          {gradeSaving ? 'Saving…' : 'Set grade'}
        </button>
      </div>
    </div>
  )
}
