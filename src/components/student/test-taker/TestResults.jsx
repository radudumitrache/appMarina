import '../../css/student/test-taker/TestResults.css'

function gradeClass(grade) {
  if (grade >= 90) return 'grade--pass'
  if (grade >= 70) return 'grade--good'
  if (grade >= 50) return 'grade--warn'
  return 'grade--fail'
}

export default function TestResults({ result, onBack }) {
  const grade = result?.grade ?? null

  return (
    <div className="tt-results">
      <div className="tt-results-card">
        {grade !== null ? (
          <>
            <div className={`tt-results-grade ${gradeClass(grade)}`}>
              <span className="tt-results-grade-num">{grade}</span>
              <span className="tt-results-grade-pct">%</span>
            </div>
            <p className="tt-results-title">{grade >= 50 ? 'Test Passed' : 'Test Failed'}</p>
            <p className="tt-results-sub">Your submission has been graded automatically.</p>
          </>
        ) : (
          <>
            <svg className="tt-results-pending-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <p className="tt-results-title">Pending Review</p>
            <p className="tt-results-sub">Your answers have been submitted. Short answer and argument questions require manual grading by your trainer.</p>
          </>
        )}

        <button className="tt-results-back" onClick={onBack}>Back to Courses</button>
      </div>
    </div>
  )
}
