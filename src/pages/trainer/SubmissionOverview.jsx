import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import NavBar from '../../components/trainer/NavBar'
import SubmissionHeader, { GradeBar } from '../../components/admin/submission-overview/SubmissionHeader'
import PanelSection from '../../components/admin/submission-overview/PanelSection'
import { buildPanels } from '../../components/admin/submission-overview/helpers'
import { getTrainerSubmission, patchTrainerSubmission } from '../../api/trainer'
import Sk from '../../components/shared/Skeleton'
import '../css/trainer/SubmissionOverview.css'

export default function trainerSubmissionOverview() {
  const { submissionId } = useParams()
  const navigate         = useNavigate()

  const [submission,  setSubmission]  = useState(null)
  const [panels,      setPanels]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [gradeInput,  setGradeInput]  = useState('')
  const [gradeSaving, setGradeSaving] = useState(false)

  const applyResponse = res => {
    setSubmission(res.data)
    setPanels(buildPanels(res.data.test_panels ?? [], res.data.answers ?? []))
    setGradeInput(res.data.grade != null ? String(res.data.grade) : '')
  }

  useEffect(() => {
    getTrainerSubmission(submissionId)
      .then(applyResponse)
      .catch(() => setError('Could not load submission.'))
      .finally(() => setLoading(false))
  }, [submissionId])

  const handleToggle = useCallback(async (answerId, newIsCorrect) => {
    setSaving(true)
    try { applyResponse(await patchTrainerSubmission(submissionId, { answers: [{ answer_id: answerId, is_correct: newIsCorrect }] })) }
    catch {}
    setSaving(false)
  }, [submissionId])

  const handleGradeSave = async () => {
    const parsed = parseFloat(gradeInput)
    if (isNaN(parsed)) return
    setGradeSaving(true)
    try { applyResponse(await patchTrainerSubmission(submissionId, { grade: parsed })) }
    catch {}
    setGradeSaving(false)
  }

  if (loading) {
    return (
      <div className="so-page so-page--trainer">
        <NavBar />
        <div className="so-shell">
          <div className="so-topbar"><Sk w={80} h={12} r={4} /></div>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
            <Sk w={44} h={44} r={22} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Sk w={160} h={14} r={4} />
              <Sk w={120} h={11} r={3} />
            </div>
            <Sk w={100} h={36} r={6} />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="so-card" style={{ opacity: 1 - i * 0.2 }}>
              <div className="so-card-body" style={{ gap: 10 }}>
                <Sk w={90} h={20} r={4} />
                <Sk w="75%" h={13} r={4} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  {Array.from({ length: 3 }).map((_, j) => <Sk key={j} w="60%" h={28} r={6} />)}
                </div>
              </div>
              <Sk w={80} h={28} r={4} style={{ flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !submission) {
    return (
      <div className="so-page so-page--trainer">
        <NavBar />
        <div className="so-shell">
          <p className="so-error">{error ?? 'Not found.'}</p>
        </div>
      </div>
    )
  }

  const pendingCount = panels.reduce(
    (s, p) => s + p.items.filter(i => i.answer && i.answer.is_correct === null).length, 0
  )

  return (
    <div className="so-page so-page--trainer">
      <NavBar />

      <div className="so-shell">
        <div className="so-topbar">
          <button className="so-back" onClick={() => navigate(-1)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
        </div>

        <SubmissionHeader
          submission={submission}
          pendingCount={pendingCount}
        />

        <GradeBar
          gradeInput={gradeInput}
          currentGrade={submission.grade}
          onGradeChange={e => setGradeInput(e.target.value)}
          onGradeKeyDown={e => e.key === 'Enter' && handleGradeSave()}
          onGradeSave={handleGradeSave}
          gradeSaving={gradeSaving}
        />

        {panels.length === 0 ? (
          <p className="so-empty">No questions found in this submission.</p>
        ) : (
          <div className="so-panels">
            {panels.map((panel, pi) => (
              <PanelSection
                key={pi}
                panel={panel}
                index={pi}
                onToggle={handleToggle}
                saving={saving}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
