import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate }                  from 'react-router-dom'
import { getTest, submitTest }                     from '../../api/tests'

import TestIntro   from '../../components/student/test-taker/TestIntro'
import TestResults from '../../components/student/test-taker/TestResults'
import TestHeader  from '../../components/student/test-taker/TestHeader'
import TestSidebar from '../../components/student/test-taker/TestSidebar'
import PanelView   from '../../components/student/test-taker/PanelView'

import '../css/student/TestTaker.css'

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
        if (ex.type === 'argument') continue  // argument questions are exempt

        const val = answers[ex.id]
        const ans = { exercise: ex.id }

        if (ex.type === 'mcq') {
          if (val === undefined || val === null) continue
          ans.selected_option = val
        } else if (ex.type === 'tf') {
          if (val === undefined || val === null) continue
          ans.selected_tf = val
        } else if (ex.type === 'short') {
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
        if (val === undefined || val === null) continue
        answerList.push({ vr_mcq_anchor: anchor.id, vr_mcq_anchor_option: val })
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

    try {
      const res = await submitTest(id, answerList)
      setResult({ grade: res.data.grade })
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
          onBack={() => navigate('/student/tests')}
        />
      </div>
    )
  }

  if (phase === 'submitted') {
    return (
      <div className="tt-page">
        <TestResults
          result={result}
          onBack={() => navigate('/student/tests')}
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
        onBack={() => navigate('/student/tests')}
        onSubmit={handleSubmit}
      />

      <div className="tt-body">
        <TestSidebar
          panels={panels}
          panelIdx={panelIdx}
          answers={answers}
          onSelect={setPanelIdx}
        />

        <main className="tt-main">
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
