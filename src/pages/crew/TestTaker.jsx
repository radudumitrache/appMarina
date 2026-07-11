import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate }                  from 'react-router-dom'
import { getTest, submitTest }                     from '../../api/tests'

import TestIntro   from '../../components/crew/test-taker/TestIntro'
import TestResults from '../../components/crew/test-taker/TestResults'
import TestHeader  from '../../components/crew/test-taker/TestHeader'
import TestSidebar from '../../components/crew/test-taker/TestSidebar'
import PanelView   from '../../components/crew/test-taker/PanelView'

import '../css/crew/TestTaker.css'

export default function TestTaker() {
  const { id }   = useParams()
  const navigate = useNavigate()

  // ── Data ──────────────────────────────────────────────────────────
  const [test,    setTest]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // ── Phase: 'intro' | 'taking' | 'submitted' ───────────────────────
  const [phase, setPhase] = useState('intro')

  // ── Taking state ──────────────────────────────────────────────────
  const [answers,    setAnswers]    = useState({})
  const [panelIdx,   setPanelIdx]   = useState(0)
  const [timeLeft,   setTimeLeft]   = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [result,     setResult]     = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const timerRef = useRef(null)

  // ── Load test ─────────────────────────────────────────────────────
  useEffect(() => {
    getTest(id)
      .then(res => setTest(res.data))
      .catch(() => setError('Failed to load test.'))
      .finally(() => setLoading(false))
  }, [id])

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)

    const answerList = []
    for (const panel of (test?.panels ?? []).filter(p => p.type === 'exercise')) {
      for (const ex of panel.exercise_content?.exercises ?? []) {
        const val = answers[ex.id]
        const ans = { exercise: ex.id }

        if (ex.type === 'mcq') {
          if (!Array.isArray(val) || val.length === 0) continue
          ans.selected_option_ids = val
        } else if (ex.type === 'tf') {
          if (val === undefined || val === null) continue
          ans.selected_tf = val
        } else if (ex.type === 'short' || ex.type === 'argument' || ex.type === 'gap_fill') {
          ans.text_answer = val ?? ''
        } else if (ex.type === 'arrange') {
          const arrVal = Array.isArray(val) ? val : []
          if (arrVal.length === 0) continue
          ans.text_answer = arrVal.join(',')
        } else {
          continue
        }

        answerList.push(ans)
      }
    }

    // Collect VR panel answers (browser mode)
    for (const panel of (test?.panels ?? []).filter(p => p.type === 'vr_exercise')) {
      const vr = panel.vr_exercise
      if (!vr) continue
      for (const anchor of vr.mcq_anchors ?? []) {
        const val = answers[`vr_mcq_${anchor.id}`]
        if (!Array.isArray(val) || val.length === 0) continue
        answerList.push({ vr_mcq_anchor: anchor.id, selected_option_ids: val })
      }
      for (const anchor of vr.tf_anchors ?? []) {
        const val = answers[`vr_tf_${anchor.id}`]
        if (val === undefined || val === null) continue
        answerList.push({ vr_tf_anchor: anchor.id, selected_tf: val })
      }
      for (const anchor of vr.short_anchors ?? []) {
        const val = answers[`vr_short_${anchor.id}`]
        answerList.push({ vr_short_anchor: anchor.id, text_answer: val ?? '' })
      }
      for (const anchor of vr.word_completion_anchors ?? []) {
        const val = answers[`vr_word_${anchor.id}`]
        answerList.push({ vr_word_anchor: anchor.id, text_answer: val ?? '' })
      }
      for (const anchor of vr.localization_anchors ?? []) {
        const val = answers[`vr_loc_${anchor.id}`]
        if (!val) continue  // no sensible default position
        answerList.push({ vr_localization_anchor: anchor.id, text_answer: val })
      }
    }

    const hasManualQuestions = (test?.panels ?? []).some(p =>
      p.type === 'exercise' &&
      (p.exercise_content?.exercises ?? []).some(ex => ex.type === 'short' || ex.type === 'argument')
    )
    // gap_fill is auto-graded by the backend (exact/case-insensitive match), so no manual flag needed

    try {
      const res = await submitTest(id, answerList)
      setResult({ grade: hasManualQuestions ? null : res.data.grade })
    } catch {
      setResult({ grade: null })
    } finally {
      setSubmitting(false)
      if (timerRef.current) clearInterval(timerRef.current)
      setPhase('submitted')
    }
  }, [id, test, answers, submitting])

  // ── Countdown timer ───────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'taking') return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, handleSubmit])

  // ── Handlers ──────────────────────────────────────────────────────
  function handleStart() {
    setTimeLeft((test.time_limit_minutes ?? 30) * 60)
    setPanelIdx(0)
    setPhase('taking')
  }

  function setAnswer(exId, value) {
    setAnswers(prev => ({ ...prev, [exId]: value }))
  }

  // ── Loading / error ───────────────────────────────────────────────
  if (loading) return <div className="tt-page tt-centered"><span className="tt-status">Loading…</span></div>
  if (error || !test) return <div className="tt-page tt-centered"><span className="tt-status tt-status--error">{error ?? 'Test not found.'}</span></div>

  const panels  = test.panels ?? []
  const isFirst = panelIdx === 0
  const isLast  = panelIdx === panels.length - 1

  // ── Phases ────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="tt-page">
        <TestIntro
          test={test}
          panels={panels}
          onStart={handleStart}
          onBack={() => navigate('/crew/modules')}
        />
      </div>
    )
  }

  if (phase === 'submitted') {
    return (
      <div className="tt-page">
        <TestResults
          result={result}
          onBack={() => navigate('/crew/modules')}
        />
      </div>
    )
  }

  // ── Taking phase ──────────────────────────────────────────────────
  return (
    <div className="tt-page">
      <TestHeader
        title={test.title}
        timeLeft={timeLeft}
        submitting={submitting}
        onBack={() => navigate('/crew/modules')}
        onSubmit={handleSubmit}
      />

      <div className="tt-body">
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <TestSidebar
          panels={panels}
          panelIdx={panelIdx}
          answers={answers}
          onSelect={(i) => { setPanelIdx(i); setSidebarOpen(false) }}
          className={sidebarOpen ? 'sidebar--open' : ''}
        />

        <main className="tt-main">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            Questions
          </button>
          {panels[panelIdx] && (
            <PanelView
              panel={panels[panelIdx]}
              answers={answers}
              setAnswer={setAnswer}
              isFirst={isFirst}
              isLast={isLast}
              submitting={submitting}
              onPrev={() => setPanelIdx(i => i - 1)}
              onNext={() => setPanelIdx(i => i + 1)}
              onSubmit={handleSubmit}
              panels={panels}
              onNavigate={setPanelIdx}
              timeLeft={timeLeft}
            />
          )}
        </main>
      </div>
    </div>
  )
}
