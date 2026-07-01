import { useState } from 'react'
import QuestionHtmlEditor from '../test-builder/QuestionHtmlEditor'

export default function VRPlacementPanel({
  pendingCoords, placing, locStep, pendingLocPoints, saving, departmentId,
  onSetPlacing, onSetLocStep, onCancel, onUndoLocPoint,
  onAddMCQ, onAddWC, onAddLoc,
}) {
  const [mcqForm, setMCQForm] = useState({ title: '', text: '', correct_mcq_indices: [], options: ['', ''] })
  const [wcForm,  setWCForm]  = useState({ title: '', text: '', correct_word: '' })
  const [locForm, setLocForm] = useState({ title: '', text: '' })

  function updateMCQOption(oi, val) {
    setMCQForm(f => { const opts = [...f.options]; opts[oi] = val; return { ...f, options: opts } })
  }

  async function submitMCQ() {
    await onAddMCQ(mcqForm)
    setMCQForm({ title: '', text: '', correct_mcq_indices: [], options: ['', ''] })
  }

  async function submitWC() {
    await onAddWC(wcForm)
    setWCForm({ title: '', text: '', correct_word: '' })
  }

  async function submitLoc() {
    await onAddLoc(locForm)
    setLocForm({ title: '', text: '' })
  }

  return (
    <div className="vrpe-placement-panel">
      <div className="vrpe-placement-header">
        <span className="vrpe-placement-coords">
          {placing === 'loc' && locStep === 'drawing'
            ? `Draw polygon — ${pendingLocPoints.length} vert${pendingLocPoints.length !== 1 ? 'ices' : 'ex'}`
            : placing === 'loc' && locStep === 'filling'
              ? 'Localization anchor details'
              : `Anchor at (${Math.round(pendingCoords.lon)}°, ${Math.round(pendingCoords.lat)}°)`}
        </span>
        <button className="vrpe-cancel-btn" onClick={onCancel}>Cancel</button>
      </div>

      {!placing && (
        <div className="vrpe-type-row">
          <span className="vrpe-type-label">Type:</span>
          <button className="tb-q-type-btn" onClick={() => onSetPlacing('mcq')}>Multiple Choice</button>
          <button className="tb-q-type-btn" onClick={() => onSetPlacing('wc')}>Word Completion</button>
          <button className="tb-q-type-btn" onClick={() => onSetPlacing('loc')}>Localization</button>
        </div>
      )}

      {placing === 'mcq' && (
        <div>
          <input
            className="tb-meta-input"
            value={mcqForm.title}
            onChange={e => setMCQForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Anchor title (shown as hotspot label)…"
            autoFocus
            style={{ width: '100%', marginBottom: 8 }}
          />
          <QuestionHtmlEditor
            value={mcqForm.text}
            departmentId={departmentId}
            onBlur={html => setMCQForm(f => ({ ...f, text: html }))}
            placeholder="Question text…"
          />
          <div className="tb-mcq-options" style={{ marginTop: 8 }}>
            <p className="tb-mcq-hint" style={{ margin: '0 0 6px', fontSize: '0.75rem', opacity: 0.6 }}>Select all correct answers</p>
            {mcqForm.options.map((opt, oi) => (
              <label key={oi} className={`tb-mcq-option ${(mcqForm.correct_mcq_indices ?? []).includes(oi) ? 'tb-mcq-option--correct' : ''}`}>
                <input type="checkbox" checked={(mcqForm.correct_mcq_indices ?? []).includes(oi)} onChange={() => setMCQForm(f => { const cur = f.correct_mcq_indices ?? []; return { ...f, correct_mcq_indices: cur.includes(oi) ? cur.filter(i => i !== oi) : [...cur, oi] } })} />
                <input className="tb-option-input" type="text" value={opt} onChange={e => updateMCQOption(oi, e.target.value)} placeholder={`Option ${oi + 1}…`} />
                {mcqForm.options.length > 2 && (
                  <button type="button" className="tb-opt-del" onClick={() => setMCQForm(f => ({ ...f, options: f.options.filter((_, i) => i !== oi) }))}>×</button>
                )}
              </label>
            ))}
            <button className="tb-add-option-btn" onClick={() => setMCQForm(f => ({ ...f, options: [...f.options, ''] }))}>+ Add option</button>
          </div>
          <div className="tb-add-q-actions" style={{ marginTop: 8 }}>
            <button className="tb-add-q-cancel" onClick={() => onSetPlacing(null)}>Back</button>
            <button className="tb-add-q-confirm" onClick={submitMCQ} disabled={!mcqForm.text.trim() || saving}>Add Anchor</button>
          </div>
        </div>
      )}

      {placing === 'wc' && (
        <div>
          <input
            className="tb-meta-input"
            value={wcForm.title}
            onChange={e => setWCForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Anchor title (shown as hotspot label)…"
            autoFocus
            style={{ width: '100%', marginBottom: 8 }}
          />
          <QuestionHtmlEditor
            value={wcForm.text}
            departmentId={departmentId}
            onBlur={html => setWCForm(f => ({ ...f, text: html }))}
            placeholder="Sentence with ___ for the blank…"
          />
          <div className="tb-anchor-field-row" style={{ marginTop: 8 }}>
            <label className="tb-meta-label">Correct word</label>
            <input
              className="tb-meta-input"
              value={wcForm.correct_word}
              onChange={e => setWCForm(f => ({ ...f, correct_word: e.target.value }))}
              placeholder="Expected answer…"
            />
          </div>
          <div className="tb-add-q-actions" style={{ marginTop: 8 }}>
            <button className="tb-add-q-cancel" onClick={() => onSetPlacing(null)}>Back</button>
            <button className="tb-add-q-confirm" onClick={submitWC} disabled={!wcForm.text.trim() || !wcForm.correct_word.trim() || saving}>Add Anchor</button>
          </div>
        </div>
      )}

      {placing === 'loc' && locStep === 'drawing' && (
        <div className="vrpe-loc-drawing-ui">
          <div className="vrpe-loc-draw-prompt">
            <span className="vrpe-loc-draw-icon">⬡</span>
            <span className="vrpe-loc-draw-text">Click in the scene to place polygon vertices</span>
          </div>
          <div className="vrpe-loc-points-bar">
            <span className="vrpe-loc-points-count">
              {pendingLocPoints.length} {pendingLocPoints.length === 1 ? 'vertex' : 'vertices'}
              {pendingLocPoints.length >= 3 ? ' — polygon ready' : ` — ${3 - pendingLocPoints.length} more needed`}
            </span>
            {pendingLocPoints.length > 0 && (
              <button className="vrpe-loc-undo-btn" onClick={onUndoLocPoint}>Undo</button>
            )}
          </div>
          <div className="tb-add-q-actions" style={{ marginTop: 4 }}>
            <button className="tb-add-q-cancel" onClick={onCancel}>Cancel</button>
            <button className="tb-add-q-confirm" onClick={() => onSetLocStep('filling')} disabled={pendingLocPoints.length < 3}>
              Set polygon →
            </button>
          </div>
        </div>
      )}

      {placing === 'loc' && locStep === 'filling' && (
        <div>
          <button className="vrpe-loc-back-btn" onClick={() => onSetLocStep('drawing')}>
            ← Edit polygon ({pendingLocPoints.length} vertices)
          </button>
          <input
            className="tb-meta-input"
            value={locForm.title}
            onChange={e => setLocForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Anchor title (shown as hotspot label)…"
            autoFocus
            style={{ width: '100%', marginBottom: 8 }}
          />
          <QuestionHtmlEditor
            value={locForm.text}
            departmentId={departmentId}
            onBlur={html => setLocForm(f => ({ ...f, text: html }))}
            placeholder="What should the student locate?…"
          />
          <div className="tb-add-q-actions" style={{ marginTop: 8 }}>
            <button className="tb-add-q-cancel" onClick={onCancel}>Cancel</button>
            <button className="tb-add-q-confirm" onClick={submitLoc} disabled={!locForm.text.trim() || saving}>
              {saving ? 'Saving…' : 'Add Anchor'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
