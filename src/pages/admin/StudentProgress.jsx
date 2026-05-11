import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../../components/admin/NavBar'
import StudentProgressHeader from '../../components/admin/student-progress/StudentProgressHeader'
import TestResultsSection from '../../components/admin/student-progress/TestResultsSection'
import LessonsSection from '../../components/admin/student-progress/LessonsSection'
import { getStudentProgress } from '../../api/admin'
import Sk from '../../components/shared/Skeleton'
import '../css/admin/StudentProgress.css'

export default function AdminStudentProgress() {
  const { studentId } = useParams()
  const navigate      = useNavigate()

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    getStudentProgress(studentId)
      .then(res => setData(res.data))
      .catch(() => setError('Could not load student progress.'))
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) {
    return (
      <div className="sp-page">
        <NavBar />
        <div className="sp-shell">
          <div className="sp-topbar"><Sk w={90} h={12} r={4} /></div>
          <div className="sp-header">
            <Sk w={48} h={48} r={24} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Sk w={200} h={20} r={5} />
              <Sk w={140} h={12} r={4} />
            </div>
          </div>
          <div className="sp-grid">
            {[0, 1].map(i => (
              <div key={i} className="sp-section">
                <div className="sp-section-head"><Sk w={100} h={12} r={4} /></div>
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="sp-row" style={{ opacity: 1 - j * 0.18 }}>
                    <Sk w={44} h={44} r={6} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <Sk w={`${55 + (j % 3) * 12}%`} h={13} r={4} />
                      <Sk w={100} h={10} r={3} />
                    </div>
                  </div>
                ))}
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
        <div className="sp-shell">
          <p className="sp-error">{error ?? 'Not found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sp-page">
      <NavBar />

      <div className="sp-shell">
        <div className="sp-topbar">
          <button className="sp-back" onClick={() => navigate(-1)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
        </div>

        <StudentProgressHeader
          studentName={data.student_name}
          email={data.email}
          testCount={data.test_results.length}
          lessonCount={data.lessons_done.length}
        />

        <div className="sp-grid">
          <TestResultsSection
            results={data.test_results}
            onSelect={t => navigate(`/admin/submissions/${t.id}`)}
          />
          <LessonsSection lessons={data.lessons_done} />
        </div>
      </div>
    </div>
  )
}
