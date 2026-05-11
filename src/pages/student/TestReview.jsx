import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../../components/student/NavBar'
import { getTest, getMySubmission } from '../../api/tests'
import PanelSection from '../../components/student/test-review/PanelSection'
import { buildReviewPanels, gradeColor } from '../../components/student/test-review/reviewHelpers'
import '../css/student/TestReview.css'

export default function TestReview() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [test,       setTest]       = useState(null)
  const [submission, setSubmission] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    Promise.all([getTest(id), getMySubmission(id)])
      .then(([testRes, subRes]) => {
        setTest(testRes.data)
        setSubmission(subRes.data)
      })
      .catch(() => setError('Could not load review data.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="tr-page">
        <NavBar />
        <div className="tr-loading">Loading review…</div>
      </div>
    )
  }

  if (error || !test || !submission) {
    return (
      <div className="tr-page">
        <NavBar />
        <div className="tr-loading tr-loading--error">{error ?? 'Not found.'}</div>
      </div>
    )
  }

  const panels      = buildReviewPanels(test, submission)
  const grade       = submission.grade
  const submittedAt = new Date(submission.submitted_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  const allItems = panels.flatMap(p => p.items)
  const correct  = allItems.filter(i => i.answer.is_correct === true).length
  const wrong    = allItems.filter(i => i.answer.is_correct === false).length
  const pending  = allItems.filter(i => i.answer.is_correct === null).length

  return (
    <div className="tr-page">
      <NavBar />

      <header className="tr-header">
        <div className="tr-breadcrumb">
          <button className="tr-bc-link" onClick={() => navigate('/student/progress')}>My Progress</button>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          <span className="tr-bc-current">Review</span>
        </div>

        <div className="tr-header-main">
          <div className="tr-title-block">
            <h1 className="tr-title">{test.title}</h1>
            <span className="tr-meta">Submitted {submittedAt}</span>
          </div>

          <div className="tr-summary">
            {grade !== null && (
              <div className={`tr-grade ${gradeColor(grade)}`}>
                <span className="tr-grade-num">{Math.round(grade)}</span>
                <span className="tr-grade-pct">%</span>
              </div>
            )}
            <div className="tr-summary-chips">
              {correct > 0 && <span className="tr-chip tr-chip--correct">{correct} correct</span>}
              {wrong   > 0 && <span className="tr-chip tr-chip--wrong">{wrong} incorrect</span>}
              {pending > 0 && <span className="tr-chip tr-chip--pending">{pending} pending</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="tr-content">
        {panels.length === 0 ? (
          <p className="tr-empty">No graded answers found for this submission.</p>
        ) : (
          panels.map(panel => (
            <PanelSection key={panel.title} panel={panel} />
          ))
        )}
      </div>
    </div>
  )
}
