import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import { getStudentProgress } from '../../api/admin'
import { getDiplomas, awardDiploma, revokeDiploma } from '../../api/departments'
import { gradeColor, gradeLabel, fmt } from '../../components/admin/student-progress/helpers'
import Sk from '../../components/shared/Skeleton'
import '../css/admin/StudentProgress.css'

// ── Diploma dropdown ────────────────────────────────────────────────────────

function DiplomaDropdown({ studentId, diplomas, onAward, onRevoke, onClose }) {
  const ref  = useRef(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [onClose])

  async function toggle(d) {
    const awarded = (d.recipients ?? []).some(r => r.id === studentId)
    setBusy(true)
    try {
      if (awarded) await onRevoke(d.department_id, d.id, studentId)
      else         await onAward(d.department_id, d.id, studentId)
    } finally { setBusy(false) }
  }

  return (
    <div className="sp-dip-drop" ref={ref}>
      <div className="sp-dip-drop-hd">Award Diploma</div>
      {diplomas.length === 0
        ? <p className="sp-dip-empty">No diplomas found for this student's departments.</p>
        : diplomas.map(d => {
            const awarded = (d.recipients ?? []).some(r => r.id === studentId)
            return (
              <div key={`${d.department_id}-${d.id}`} className={`sp-dip-row${awarded ? ' sp-dip-row--on' : ''}`}>
                <div className="sp-dip-info">
                  <span className="sp-dip-title">{d.title}</span>
                  {awarded && <span className="sp-dip-badge">Awarded</span>}
                </div>
                <button
                  className={`sp-dip-btn${awarded ? ' sp-dip-btn--revoke' : ' sp-dip-btn--award'}`}
                  onClick={() => toggle(d)}
                  disabled={busy}
                >
                  {awarded ? 'Revoke' : 'Award'}
                </button>
              </div>
            )
          })
      }
    </div>
  )
}

// ── Course card ─────────────────────────────────────────────────────────────

function CourseCard({ course, index, studentId, diplomas, onAward, onRevoke }) {
  const [open,     setOpen]     = useState(true)
  const [showDip,  setShowDip]  = useState(false)

  const items = course.items ?? []
  const done  = items.filter(i => i.completed).length
  const total = items.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0
  const isDone = course.completed

  return (
    <div className="sp-course-card" style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}>
      {/* Card header */}
      <div className="sp-course-hd">
        <button className="sp-course-toggle" onClick={() => setOpen(o => !o)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .18s ease' }}>
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

        <div className={`sp-course-icon${isDone ? ' sp-course-icon--done' : ''}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>

        <span className="sp-course-title">{course.course_title}</span>

        {/* Progress bar */}
        <div className="sp-course-prog-wrap">
          <div className="sp-course-prog-bar">
            <div className={`sp-course-prog-fill${isDone ? ' sp-course-prog-fill--done' : ''}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="sp-course-prog-label">{done}/{total}</span>
        </div>

        {isDone
          ? <span className="sp-course-badge sp-course-badge--done">Complete</span>
          : done > 0
            ? <span className="sp-course-badge sp-course-badge--progress">In Progress</span>
            : <span className="sp-course-badge sp-course-badge--idle">Not Started</span>
        }

        {/* Diploma button */}
        <div className="sp-dip-wrap">
          <button
            className={`sp-dip-trigger${showDip ? ' sp-dip-trigger--active' : ''}${isDone ? ' sp-dip-trigger--done' : ''}`}
            onClick={() => setShowDip(s => !s)}
            title="Award Diploma"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="6"/>
              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
            Award Diploma
          </button>
          {showDip && (
            <DiplomaDropdown
              studentId={studentId}
              diplomas={diplomas}
              onAward={onAward}
              onRevoke={onRevoke}
              onClose={() => setShowDip(false)}
            />
          )}
        </div>
      </div>

      {/* Item list */}
      {open && (
        <div className="sp-course-items">
          {items.length === 0
            ? <p className="sp-course-empty">No items in this course.</p>
            : items.map(item => {
                const isTest = item.type === 'test'
                return (
                  <div key={`${item.type}-${item.id}`} className={`sp-ci-row${item.completed ? ' sp-ci-row--done' : ' sp-ci-row--pending'}`}>
                    <div className={`sp-ci-icon${isTest ? ' sp-ci-icon--test' : ' sp-ci-icon--module'}`}>
                      {isTest ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        </svg>
                      )}
                    </div>

                    <div className="sp-ci-body">
                      <span className="sp-ci-title">{item.title}</span>
                      <div className="sp-ci-meta">
                        {isTest && <span className="sp-ci-tag">Test</span>}
                        {item.completed
                          ? <span>{isTest && item.grade != null ? `${Math.round(item.grade)}% · ` : ''}{fmt(item.completed_at)}</span>
                          : <span className="sp-ci-pending">Not completed</span>
                        }
                      </div>
                    </div>

                    <div className="sp-ci-check">
                      {item.completed ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                        </svg>
                      )}
                    </div>
                  </div>
                )
              })
          }
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminStudentProgress() {
  const { studentId } = useParams()
  const navigate      = useNavigate()

  const [data,     setData]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [diplomas, setDiplomas] = useState([])

  useEffect(() => {
    getStudentProgress(studentId)
      .then(res => {
        setData(res.data)
        // Load diplomas for all enrolled departments
        const deptIds = res.data.department_ids ?? []
        Promise.allSettled(deptIds.map(id => getDiplomas(id))).then(results => {
          const all = []
          results.forEach((r, i) => {
            if (r.status === 'fulfilled') {
              ;(r.value.data ?? []).forEach(d => all.push({ ...d, department_id: deptIds[i] }))
            }
          })
          setDiplomas(all)
        })
      })
      .catch(() => setError('Could not load student progress.'))
      .finally(() => setLoading(false))
  }, [studentId])

  const handleAward = async (deptId, dipId, sid) => {
    const { data: updated } = await awardDiploma(deptId, dipId, { student_ids: [sid] })
    setDiplomas(prev => prev.map(d => d.id === updated.id && d.department_id === deptId ? { ...updated, department_id: deptId } : d))
  }

  const handleRevoke = async (deptId, dipId, sid) => {
    await revokeDiploma(deptId, dipId, sid)
    setDiplomas(prev => prev.map(d =>
      d.id === dipId && d.department_id === deptId
        ? { ...d, recipients: (d.recipients ?? []).filter(r => r.id !== sid) }
        : d
    ))
  }

  if (loading) {
    return (
      <div className="sp-page">
        <NavBar />
        <div className="sp-shell">
          <Sk w={80} h={12} r={4} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
            <Sk w={56} h={56} r={28} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Sk w={200} h={22} r={5} />
              <Sk w={140} h={12} r={4} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, opacity: 1 - i * 0.2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Sk w={28} h={28} r={6} />
                  <Sk w={180} h={14} r={4} style={{ flex: 1 }} />
                  <Sk w={80} h={24} r={4} />
                  <Sk w={100} h={28} r={6} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="sp-page">
        <NavBar />
        <div className="sp-shell"><p className="sp-error">{error ?? 'Not found.'}</p></div>
      </div>
    )
  }

  const courses  = data.courses_progress ?? []
  const tests    = data.test_results ?? []
  const initials = (data.student_name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  // Overall progress across all courses
  const totalItems = courses.reduce((s, c) => s + (c.items?.length ?? 0), 0)
  const doneItems  = courses.reduce((s, c) => s + (c.items?.filter(i => i.completed).length ?? 0), 0)
  const overallPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0
  const coursesDone = courses.filter(c => c.completed).length

  return (
    <div className="sp-page">
      <NavBar />

      <div className="sp-shell">
        {/* Back */}
        <button className="sp-back" onClick={() => navigate(-1)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="sp-hd">
          <div className="sp-hd-avatar">{initials}</div>
          <div className="sp-hd-info">
            <h1 className="sp-hd-name">{data.student_name}</h1>
            <span className="sp-hd-email">{data.email}</span>
            <div className="sp-hd-meta">
              <span>{tests.length} test{tests.length !== 1 ? 's' : ''} taken</span>
              <span className="sp-hd-dot">·</span>
              <span>{coursesDone}/{courses.length} course{courses.length !== 1 ? 's' : ''} done</span>
            </div>
          </div>
          <div className="sp-hd-prog">
            <div className="sp-hd-prog-nums">
              <span className="sp-hd-prog-pct">{overallPct}%</span>
              <span className="sp-hd-prog-label">overall</span>
            </div>
            <div className="sp-hd-bar">
              <div className="sp-hd-bar-fill" style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>

        {/* Courses section */}
        <div className="sp-courses-section">
          <div className="sp-section-head">
            <span className="sp-section-title">Courses</span>
            <span className="sp-section-count">{coursesDone}/{courses.length} complete</span>
          </div>

          {courses.length === 0
            ? <p className="sp-empty">No courses assigned to this student's departments.</p>
            : <div className="sp-course-list">
                {courses.map((course, i) => (
                  <CourseCard
                    key={course.course_id}
                    course={course}
                    index={i}
                    studentId={data.student_id}
                    diplomas={diplomas}
                    onAward={handleAward}
                    onRevoke={handleRevoke}
                  />
                ))}
              </div>
          }
        </div>

        {/* Test results section */}
        <div className="sp-tests-section">
          <div className="sp-section-head">
            <span className="sp-section-title">Test Results</span>
            <span className="sp-section-count">{tests.length}</span>
          </div>

          {tests.length === 0
            ? <p className="sp-empty">No tests taken yet.</p>
            : <div className="sp-test-list">
                {tests.map((t, i) => (
                  <button
                    key={t.id}
                    className="sp-test-row"
                    style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                    onClick={() => navigate(`/admin/submissions/${t.id}`)}
                  >
                    <div className={`sp-test-grade ${t.grade != null ? gradeColor(t.grade) : 'sp-grade--none'}`}>
                      <span className="sp-test-grade-num">{t.grade != null ? Math.round(t.grade) : '—'}</span>
                      {t.grade != null && <span className="sp-test-grade-pct">%</span>}
                    </div>
                    <div className="sp-test-body">
                      <span className="sp-test-title">{t.test_title}</span>
                      <span className="sp-test-meta">By {t.test_author_name} · {fmt(t.submitted_at)}</span>
                    </div>
                    {t.grade != null && (
                      <span className={`sp-badge ${gradeColor(t.grade)}`}>{gradeLabel(t.grade)}</span>
                    )}
                    <svg className="sp-chevron" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  )
}
