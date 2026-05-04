import '../../css/student/tests/TestsContent.css'
import TestCard from './TestCard'

function avgGrade(tests) {
  const done = tests.filter(t => t.completed && t.grade !== null)
  if (!done.length) return null
  return Math.round(done.reduce((s, t) => s + t.grade, 0) / done.length)
}

export default function TestsContent({ sortedPending, completed, classLabels }) {
  const completedAvg = avgGrade(completed)

  return (
    <div className="tests-content">
      <section className="tests-section">
        <div className="tests-section-head">
          <span className="tests-section-title">Upcoming</span>
          <span className="tests-section-badge">{sortedPending.length}</span>
        </div>
        {sortedPending.length === 0 ? (
          <p className="tests-empty">No upcoming tests.</p>
        ) : (
          <div className="tests-list">
            {sortedPending.map((test, i) => (
              <TestCard
                key={test.id}
                test={test}
                index={i}
                className={test.classId ? classLabels[test.classId] : null}
              />
            ))}
          </div>
        )}
      </section>

      <section className="tests-section">
        <div className="tests-section-head">
          <span className="tests-section-title">Completed</span>
          <span className="tests-section-badge">{completed.length}</span>
          {completedAvg !== null && (
            <span className="tests-section-avg">
              avg&nbsp;<span className="tests-section-avg-num">{completedAvg}%</span>
            </span>
          )}
        </div>
        {completed.length === 0 ? (
          <p className="tests-empty">No completed tests yet.</p>
        ) : (
          <div className="tests-list">
            {completed.map((test, i) => (
              <TestCard
                key={test.id}
                test={test}
                index={i}
                className={test.classId ? classLabels[test.classId] : null}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
