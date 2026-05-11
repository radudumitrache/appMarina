import { useState, useEffect } from 'react'
import { getClassAssignments } from '../../../api/classes'
import { getAllSubmissions }    from '../../../api/tests'
import Sk from '../../shared/Skeleton'
import '../../css/teacher/progress/StudentDrawer.css'

function scoreColor(s) {
  if (s >= 90) return 'sd-score--pass'
  if (s >= 70) return 'sd-score--good'
  if (s >= 50) return 'sd-score--warn'
  return 'sd-score--fail'
}

export default function StudentDrawer({ student, onClose }) {
  const [tests,        setTests]        = useState([])
  const [loadingTests, setLoadingTests] = useState(true)

  useEffect(() => {
    if (!student.classId) { setLoadingTests(false); return }
    setLoadingTests(true)
    getClassAssignments(student.classId)
      .then(async ({ data: assignments }) => {
        const withScores = await Promise.all(
          assignments.map(async (test) => {
            try {
              const { data: subs } = await getAllSubmissions(test.id)
              const sub = subs.find(s => s.student === student.id)
              return { id: test.id, title: test.title, dueDate: test.due_date ?? null, grade: sub?.grade ?? null }
            } catch {
              return { id: test.id, title: test.title, dueDate: test.due_date ?? null, grade: null }
            }
          })
        )
        setTests(withScores)
      })
      .catch(() => {})
      .finally(() => setLoadingTests(false))
  }, [student.id, student.classId])

  const pct = student.lessonsTotal > 0
    ? Math.round((student.lessonsDone / student.lessonsTotal) * 100)
    : 0

  return (
    <>
      <div className="sd-backdrop" onClick={onClose} />

      <aside className="sd-drawer">
        <div className="sd-header">
          <div className="sd-avatar">
            {student.initials}
          </div>

          <div className="sd-id">
            <span className="sd-name">{student.name}</span>
            <span className="sd-class-name">{student.className}</span>
          </div>

          <button className="sd-close" onClick={onClose} aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6"  y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="sd-body">

          {/* ── Lesson Progress ─────────────────────────────── */}
          <section className="sd-section">
            <span className="sd-section-title">Lesson Progress</span>

            <div className="sd-progress-row">
              <div className="sd-bar-track">
                <div
                  className={`sd-bar-fill ${pct === 100 ? 'sd-bar-fill--complete' : ''}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="sd-pct">{pct}%</span>
            </div>

            <div className="sd-lesson-count">
              {student.lessonsDone} of {student.lessonsTotal} lessons completed
            </div>

          </section>

          <div className="sd-divider" />

          {/* ── Tests ───────────────────────────────────────── */}
          <section className="sd-section">
            <span className="sd-section-title">Tests</span>

            {loadingTests ? (
              <div className="sd-test-list">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="sd-test-row" style={{ opacity: 1 - i * 0.2 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
                      <Sk w="65%" h={13} r={4} />
                      <Sk w="40%" h={10} r={3} />
                    </div>
                    <Sk w={52} h={22} r={4} style={{ flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            ) : tests.length === 0 ? (
              <p className="sd-empty">No tests assigned to this class.</p>
            ) : (
              <div className="sd-test-list">
                {tests.map(t => (
                  <div key={t.id} className="sd-test-row">
                    <div className="sd-test-info">
                      <span className="sd-test-title">{t.title}</span>
                      {t.dueDate && (
                        <span className="sd-test-due">
                          Due {new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    {t.grade !== null
                      ? <span className={`sd-test-score ${scoreColor(t.grade)}`}>{Math.round(t.grade)}%</span>
                      : <span className="sd-test-score sd-test-score--missing">Not submitted</span>
                    }
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  )
}
