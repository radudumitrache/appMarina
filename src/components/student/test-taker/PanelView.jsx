import { useState, useRef, useEffect } from 'react'
import VRSceneViewer from './VRSceneViewer'
import AnchorModal   from './AnchorModal'
import '../../css/student/test-taker/PanelView.css'

function PanelFooter({ isFirst, isLast, submitting, onPrev, onNext, onSubmit, className }) {
  return (
    <div className={className ?? 'tt-panel-footer'}>
      <button className="tt-nav-btn" onClick={onPrev} disabled={isFirst}>
        Previous Panel
      </button>
      {isLast ? (
        <button className="tt-nav-btn tt-nav-btn--primary" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Test'}
        </button>
      ) : (
        <button className="tt-nav-btn tt-nav-btn--primary" onClick={onNext}>
          Next Panel
        </button>
      )}
    </div>
  )
}

export default function PanelView({ panel, answers, setAnswer, isFirst, isLast, submitting, onPrev, onNext, onSubmit, panels, onNavigate, timeLeft }) {
  const isVRScene = panel.type === 'vr_exercise' && panel.vr_exercise?.scene_url

  // ── Fullscreen VR scene ───────────────────────────────────────────────────
  if (isVRScene) {
    return (
      <VRSceneFullscreen
        panel={panel}
        answers={answers}
        setAnswer={setAnswer}
        panels={panels}
        onNavigate={onNavigate}
        isFirst={isFirst}
        isLast={isLast}
        submitting={submitting}
        onPrev={onPrev}
        onNext={onNext}
        onSubmit={onSubmit}
        timeLeft={timeLeft}
      />
    )
  }

  // ── Normal panel ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="tt-panel-content">
        {panel.type === 'vr_exercise' ? (
          <VRFlatPanel panel={panel} answers={answers} setAnswer={setAnswer} />
        ) : (
          <ExercisePanel panel={panel} answers={answers} setAnswer={setAnswer} />
        )}
      </div>
      <PanelFooter
        isFirst={isFirst} isLast={isLast} submitting={submitting}
        onPrev={onPrev} onNext={onNext} onSubmit={onSubmit}
      />
    </>
  )
}

// ── Fullscreen 360° scene (fixed overlay) ─────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function VRSceneFullscreen({ panel, answers, setAnswer, panels, onNavigate, isFirst, isLast, submitting, onPrev, onNext, onSubmit, timeLeft }) {
  const vr = panel.vr_exercise
  const [activeAnchor,     setActiveAnchor]     = useState(null)
  const [localizingAnchor, setLocalizingAnchor] = useState(null)

  const exerciseAnswerKey = activeAnchor ? `vr_${activeAnchor._type}_${activeAnchor.id}` : null

  function handleLocalizationPlace(x, y, z) {
    if (!localizingAnchor) return
    setAnswer(`vr_loc_${localizingAnchor.id}`, `${x},${y},${z}`)
    setLocalizingAnchor(null)
  }

  function handleExerciseAnchorClick(anchor) {
    setActiveAnchor(anchor)
    setLocalizingAnchor(null)
  }

  function handleLocalizationClick(anchor) {
    setLocalizingAnchor(prev => prev?.id === anchor.id ? null : anchor)
    setActiveAnchor(null)
  }

  return (
    <div className="tt-vr-fullscreen">
      <VRSceneViewer
        key={panel.id}
        vr={vr}
        panels={panels}
        answers={answers}
        onAnchorClick={handleExerciseAnchorClick}
        onNavigate={onNavigate}
        localizingAnchor={localizingAnchor}
        onLocalizationPlace={handleLocalizationPlace}
      />

      <VRSidePanel
        vr={vr}
        answers={answers}
        activeAnchor={activeAnchor}
        localizingAnchor={localizingAnchor}
        onExerciseClick={handleExerciseAnchorClick}
        onLocalizationClick={handleLocalizationClick}
      />

      <div className="tt-vr-fullscreen-bar">
        <span className="tt-vr-fullscreen-title">
          <span className="tt-nav-vr">VR</span>
          {panel.title}
        </span>
        {timeLeft !== undefined && (
          <span className={`tt-vr-timer${timeLeft <= 60 ? ' tt-vr-timer--urgent' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        )}
        <PanelFooter
          isFirst={isFirst} isLast={isLast} submitting={submitting}
          onPrev={onPrev} onNext={onNext} onSubmit={onSubmit}
          className="tt-vr-fullscreen-nav"
        />
      </div>

      {activeAnchor && (
        <AnchorModal
          anchor={activeAnchor}
          value={answers[exerciseAnswerKey]}
          onChange={val => setAnswer(exerciseAnswerKey, val)}
          onClose={() => setActiveAnchor(null)}
        />
      )}

      {localizingAnchor && (
        <LocalizationQuestion
          anchor={localizingAnchor}
          answered={Boolean(answers[`vr_loc_${localizingAnchor.id}`])}
          onCancel={() => setLocalizingAnchor(null)}
        />
      )}
    </div>
  )
}

function LocalizationQuestion({ anchor, answered, onCancel }) {
  return (
    <div className="tt-loc-question">
      <div className="tt-loc-question-header">
        <span className="tt-loc-question-label">Locate</span>
        <button className="tt-loc-question-close" onClick={onCancel} aria-label="Cancel">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      {anchor.title && (
        <p className="tt-loc-question-title">{anchor.title}</p>
      )}
      <div
        className="tt-loc-question-text"
        dangerouslySetInnerHTML={{ __html: anchor.text }}
      />
      <p className="tt-loc-question-hint">
        {answered ? 'Click the scene to move your marker.' : 'Click anywhere in the scene to place your marker.'}
      </p>
    </div>
  )
}

const TYPE_LABEL = { mcq: 'MCQ', tf: 'T / F', short: 'Short', word: 'Fill', localization: 'Locate' }

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function anchorAnswered(anchor, answers) {
  if (anchor._type === 'localization') return Boolean(answers[`vr_loc_${anchor.id}`])
  const prefixes = { mcq: 'vr_mcq', tf: 'vr_tf', short: 'vr_short', word: 'vr_word' }
  const val = answers[`${prefixes[anchor._type]}_${anchor.id}`]
  if (val === undefined || val === null) return false
  if (typeof val === 'boolean') return true
  return val !== ''
}

function VRSidePanel({ vr, answers, activeAnchor, localizingAnchor, onExerciseClick, onLocalizationClick }) {
  const [collapsed, setCollapsed] = useState(false)

  const allAnchors = [
    ...(vr?.mcq_anchors             ?? []).map(a => ({ ...a, _type: 'mcq'          })),
    ...(vr?.tf_anchors              ?? []).map(a => ({ ...a, _type: 'tf'           })),
    ...(vr?.short_anchors           ?? []).map(a => ({ ...a, _type: 'short'        })),
    ...(vr?.word_completion_anchors ?? []).map(a => ({ ...a, _type: 'word'         })),
    ...(vr?.localization_anchors    ?? []).map(a => ({ ...a, _type: 'localization' })),
  ]

  if (allAnchors.length === 0) return null

  const doneCount = allAnchors.filter(a => anchorAnswered(a, answers)).length

  return (
    <div className={`tt-vr-side${collapsed ? ' tt-vr-side--collapsed' : ''}`}>
      <div className="tt-vr-side-header">
        {!collapsed && (
          <span className="tt-vr-side-title">
            Exercises
            <span className="tt-vr-side-count">{doneCount}/{allAnchors.length}</span>
          </span>
        )}
        <button
          className="tt-vr-side-toggle"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand exercises' : 'Collapse exercises'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {collapsed
              ? <polyline points="15 18 9 12 15 6"/>
              : <polyline points="9 18 15 12 9 6"/>
            }
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="tt-vr-side-list">
          {allAnchors.map((anchor, idx) => {
            const done     = anchorAnswered(anchor, answers)
            const isActive = anchor._type === 'localization'
              ? localizingAnchor?.id === anchor.id
              : activeAnchor?.id === anchor.id && activeAnchor?._type === anchor._type

            let cls = 'tt-vr-side-item'
            if (done)     cls += ' tt-vr-side-item--done'
            if (isActive) cls += ' tt-vr-side-item--active'

            return (
              <button
                key={`${anchor._type}_${anchor.id}`}
                className={cls}
                onClick={() => anchor._type === 'localization'
                  ? onLocalizationClick(anchor)
                  : onExerciseClick(anchor)
                }
              >
                <span className="tt-vr-side-num">{idx + 1}</span>
                <div className="tt-vr-side-body">
                  <span className="tt-vr-side-type">{TYPE_LABEL[anchor._type]}</span>
                  {anchor.title && (
                    <span className="tt-vr-side-title">{anchor.title}</span>
                  )}
                  <span className="tt-vr-side-text">
                    {stripHtml(anchor.text)}
                  </span>
                  {anchor._type === 'localization' && isActive && (
                    <span className="tt-vr-side-locating">Click scene to place</span>
                  )}
                </div>
                {done && (
                  <svg className="tt-vr-side-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Flat panel for VR panels without a scene image ────────────────────────
function VRFlatPanel({ panel, answers, setAnswer }) {
  const vr = panel.vr_exercise
  if (!vr) return null

  const answerableAnchors = [
    ...(vr.mcq_anchors             ?? []).map(a => ({ ...a, _type: 'mcq'   })),
    ...(vr.tf_anchors              ?? []).map(a => ({ ...a, _type: 'tf'    })),
    ...(vr.short_anchors           ?? []).map(a => ({ ...a, _type: 'short' })),
    ...(vr.word_completion_anchors ?? []).map(a => ({ ...a, _type: 'word'  })),
  ]

  if (answerableAnchors.length === 0) return null

  return (
    <>
      <div className="tt-vr-panel-header">
        <span className="tt-nav-vr">VR</span>
        <h2 className="tt-panel-title">{panel.title}</h2>
        <span className="tt-vr-browser-badge">Browser mode</span>
      </div>

      <div className="tt-exercise-list">
        {answerableAnchors.map((anchor, idx) => {
          const key = `vr_${anchor._type}_${anchor.id}`
          return (
            <VRAnchorExercise
              key={key}
              anchor={anchor}
              index={idx}
              value={answers[key]}
              onChange={val => setAnswer(key, val)}
            />
          )
        })}
      </div>
    </>
  )
}

function VRAnchorExercise({ anchor, index, value, onChange }) {
  const answered = value !== undefined && value !== null && value !== ''

  return (
    <div className="tt-exercise-wrap">
      <div className={`tt-exercise-num${answered ? ' tt-exercise-answered' : ''}`}>
        {index + 1}
      </div>
      <div className="tt-exercise-content">
        {anchor.title && (
          <p className="tt-vr-anchor-title">{anchor.title}</p>
        )}
        <div className="tt-exercise-text" dangerouslySetInnerHTML={{ __html: anchor.text }} />
        <VRAnchorInput anchor={anchor} value={value} onChange={onChange} />
      </div>
    </div>
  )
}

function VRAnchorInput({ anchor, value, onChange }) {
  if (anchor._type === 'mcq') {
    return (
      <div className="tt-mcq-options">
        {(anchor.options ?? []).map(opt => (
          <button
            key={opt.id}
            className={`tt-mcq-option${value === opt.id ? ' tt-mcq-option--selected' : ''}`}
            onClick={() => onChange(opt.id)}
          >
            <span className="tt-mcq-marker" />
            {opt.text}
          </button>
        ))}
      </div>
    )
  }

  if (anchor._type === 'tf') {
    return (
      <div className="tt-tf-options">
        <button
          className={`tt-tf-btn${value === true  ? ' tt-tf-btn--selected' : ''}`}
          onClick={() => onChange(true)}
        >True</button>
        <button
          className={`tt-tf-btn${value === false ? ' tt-tf-btn--selected' : ''}`}
          onClick={() => onChange(false)}
        >False</button>
      </div>
    )
  }

  if (anchor._type === 'short') {
    return (
      <textarea
        className="tt-short-input"
        placeholder="Write your answer here..."
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      />
    )
  }

  if (anchor._type === 'word') {
    return (
      <input
        className="tt-word-input"
        placeholder="Fill in the blank…"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      />
    )
  }

  return null
}

function ExercisePanel({ panel, answers, setAnswer }) {
  const exercises = panel.exercise_content?.exercises ?? []

  return (
    <>
      <h2 className="tt-panel-title">{panel.title}</h2>
      <div className="tt-exercise-list">
        {exercises.length === 0 ? (
          <p className="tt-empty">No exercises in this panel.</p>
        ) : (
          exercises.map((ex, idx) => (
            <ExerciseView
              key={ex.id}
              exercise={ex}
              index={idx}
              value={answers[ex.id]}
              onChange={val => setAnswer(ex.id, val)}
            />
          ))
        )}
      </div>
    </>
  )
}

function ExerciseView({ exercise, index, value, onChange }) {
  const answered = Array.isArray(value) ? value.length > 0 : (value !== undefined && value !== null && value !== '')

  return (
    <div className="tt-exercise-wrap">
      <div className={`tt-exercise-num${answered ? ' tt-exercise-answered' : ''}`}>
        {index + 1}
      </div>
      <div className="tt-exercise-content">
        <div className="tt-exercise-text" dangerouslySetInnerHTML={{ __html: exercise.text }} />
        <AnswerInput exercise={exercise} value={value} onChange={onChange} />
      </div>
    </div>
  )
}

function AnswerInput({ exercise, value, onChange }) {
  if (exercise.type === 'mcq') {
    const selectedIds = Array.isArray(value) ? value : []
    return (
      <div className="tt-mcq-options">
        {(exercise.options ?? []).map(opt => {
          const selected = selectedIds.includes(opt.id)
          return (
            <button
              key={opt.id}
              className={`tt-mcq-option${selected ? ' tt-mcq-option--selected' : ''}`}
              onClick={() => {
                const next = selected
                  ? selectedIds.filter(id => id !== opt.id)
                  : [...selectedIds, opt.id]
                onChange(next)
              }}
            >
              <span className="tt-mcq-marker" />
              {opt.text}
            </button>
          )
        })}
      </div>
    )
  }

  if (exercise.type === 'tf') {
    return (
      <div className="tt-tf-options">
        <button
          className={`tt-tf-btn${value === true ? ' tt-tf-btn--selected' : ''}`}
          onClick={() => onChange(true)}
        >
          True
        </button>
        <button
          className={`tt-tf-btn${value === false ? ' tt-tf-btn--selected' : ''}`}
          onClick={() => onChange(false)}
        >
          False
        </button>
      </div>
    )
  }

  if (exercise.type === 'short') {
    return (
      <textarea
        className="tt-short-input"
        placeholder="Write your answer here..."
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      />
    )
  }

  if (exercise.type === 'argument') {
    return (
      <textarea
        className="tt-short-input tt-argument-input"
        placeholder="Write your argument here..."
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      />
    )
  }

  if (exercise.type === 'gap_fill') {
    return (
      <input
        className="tt-word-input"
        placeholder="Fill in the blank…"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
      />
    )
  }

  if (exercise.type === 'arrange') {
    return <ArrangeInput exercise={exercise} value={value} onChange={onChange} />
  }

  return null
}

function fisherYates(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function ArrangeInput({ exercise, value, onChange }) {
  const items = exercise.arrange_items ?? []

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const [orderedItems, setOrderedItems] = useState(() => {
    if (value && Array.isArray(value) && value.length > 0) {
      return value.map(id => items.find(i => i.id === id)).filter(Boolean)
    }
    return fisherYates(items)
  })

  useEffect(() => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      onChangeRef.current(orderedItems.map(i => i.id))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // drag: { srcIdx, insertBefore, clientY, offsetY, itemHeight, text }
  const [drag, setDrag]   = useState(null)
  const listRef           = useRef(null)
  const rowRefs           = useRef([])
  const dragRef           = useRef(null)
  dragRef.current         = drag

  // Compare the ghost card's center Y against each item's midpoint so the
  // trigger zone is the same regardless of where on the card the user grabbed.
  function getInsertBefore(clientY, offsetY, itemHeight) {
    const ghostCenterY = clientY - offsetY + itemHeight / 2
    for (let i = 0; i < rowRefs.current.length; i++) {
      const r = rowRefs.current[i]?.getBoundingClientRect()
      if (r && ghostCenterY < r.top + r.height / 2) return i
    }
    return rowRefs.current.length
  }

  function handlePointerDown(e, idx) {
    if (e.button !== 0) return
    e.preventDefault()
    const rowEl    = rowRefs.current[idx]
    const rect     = rowEl?.getBoundingClientRect()
    const offsetY   = rect ? e.clientY - rect.top  : 22
    const itemHeight = rect ? rect.height           : 44
    setDrag({ srcIdx: idx, insertBefore: idx, clientY: e.clientY, offsetY, itemHeight, text: orderedItems[idx].text })

    function onMove(ev) {
      const d = dragRef.current
      if (!d) return
      const insertBefore = getInsertBefore(ev.clientY, d.offsetY, d.itemHeight)
      setDrag(prev => prev ? { ...prev, clientY: ev.clientY, insertBefore } : null)
    }

    function onUp(ev) {
      const d = dragRef.current
      if (d) {
        const insertBefore = getInsertBefore(ev.clientY, d.offsetY, d.itemHeight)
        const noOp = insertBefore === d.srcIdx || insertBefore === d.srcIdx + 1
        if (!noOp) {
          setOrderedItems(cur => {
            const next = [...cur]
            const [moved] = next.splice(d.srcIdx, 1)
            const adjusted = insertBefore > d.srcIdx ? insertBefore - 1 : insertBefore
            next.splice(adjusted, 0, moved)
            onChangeRef.current(next.map(i => i.id))
            return next
          })
        }
      }
      setDrag(null)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  if (items.length === 0) {
    return <p className="tt-arrange-note">No items to arrange.</p>
  }

  const listRect  = listRef.current?.getBoundingClientRect()
  const ghostStyle = drag ? {
    top:   drag.clientY - drag.offsetY,
    left:  listRect?.left  ?? 0,
    width: listRect?.width ?? 320,
  } : {}

  const n = orderedItems.length

  return (
    <div className={`tt-arrange-list${drag ? ' tt-arrange-list--active' : ''}`} ref={listRef}>
      <p className="tt-arrange-hint">Drag to reorder</p>

      {orderedItems.map((item, idx) => {
        const isSrc   = drag?.srcIdx === idx
        const ibefore = drag?.insertBefore
        const noOp    = ibefore === drag?.srcIdx || ibefore === drag?.srcIdx + 1
        const showAbove = drag && !noOp && ibefore === idx
        const showBelow = drag && !noOp && idx === n - 1 && ibefore === n

        return (
          <div key={item.id} className="tt-arrange-slot">
            {showAbove && <div className="tt-arrange-line" />}
            <div
              ref={el => { rowRefs.current[idx] = el }}
              className={`tt-arrange-item${isSrc ? ' tt-arrange-item--src' : ''}`}
            >
              <div
                className="tt-arrange-grip"
                onPointerDown={e => handlePointerDown(e, idx)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="9"  cy="6"  r="1.2" fill="currentColor" stroke="none"/>
                  <circle cx="15" cy="6"  r="1.2" fill="currentColor" stroke="none"/>
                  <circle cx="9"  cy="12" r="1.2" fill="currentColor" stroke="none"/>
                  <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none"/>
                  <circle cx="9"  cy="18" r="1.2" fill="currentColor" stroke="none"/>
                  <circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              <span className="tt-arrange-pos">{idx + 1}</span>
              <span className="tt-arrange-text">{item.text}</span>
            </div>
            {showBelow && <div className="tt-arrange-line" />}
          </div>
        )
      })}

      {drag && (
        <div className="tt-arrange-ghost" style={ghostStyle}>
          <div className="tt-arrange-grip tt-arrange-grip--ghost">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="9"  cy="6"  r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="6"  r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="9"  cy="12" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="9"  cy="18" r="1.2" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <span className="tt-arrange-pos tt-arrange-pos--ghost">{drag.srcIdx + 1}</span>
          <span className="tt-arrange-text">{drag.text}</span>
        </div>
      )}
    </div>
  )
}
