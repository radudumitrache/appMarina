import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import QuestionHtmlEditor from './QuestionHtmlEditor'
import DocumentSection from '../module-panel-editor/DocumentSection'
import { useAuth } from '../../../auth/AuthContext'
import {
  deleteTestPanel, updateTestPanel,
  createExercise, updateExercise, deleteExercise,
  createArrangeItem, updateArrangeItem, deleteArrangeItem,
  updateMCQAnchor, deleteMCQAnchor,
  updateWordCompletionAnchor, deleteWordCompletionAnchor,
  updateLocalizationAnchor, deleteLocalizationAnchor,
  createLocalizationPoint, deleteLocalizationPoint,
  createTestPanelDocument, deleteTestPanelDocument,
  createExerciseDocument, deleteExerciseDocument,
  createMCQAnchorDocument, deleteMCQAnchorDocument,
  createWCAnchorDocument, deleteWCAnchorDocument,
  createLocAnchorDocument, deleteLocAnchorDocument,
} from '../../../api/tests'
import { Q_TYPES } from '../../../pages/teacher/testBuilderMock'
import '../../css/teacher/test-builder/QuestionCard.css'
import '../../css/teacher/test-builder/AddQuestionPanel.css'
import '../../css/teacher/test-builder/PanelSection.css'

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

// â”€â”€ MCQ Options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MCQOptions({ exercise, panelId, testId, onExerciseUpdate }) {
  const [localOpts, setLocalOpts] = useState(exercise.options?.map(o => o.text) ?? [])

  useEffect(() => {
    setLocalOpts(exercise.options?.map(o => o.text) ?? [])
  }, [exercise.options])

  async function saveAll(opts) {
    const res = await updateExercise(testId, panelId, exercise.id, {
      options: opts.map((text, i) => ({ text, order: i })),
    })
    return res
  }

  async function handleBlur(oi, newText) {
    const updated = localOpts.map((t, i) => (i === oi ? newText : t))
    setLocalOpts(updated)
    await saveAll(updated)
  }

  async function handleCorrect(oi) {
    const res = await updateExercise(testId, panelId, exercise.id, { correct_mcq_index: oi })
    onExerciseUpdate(exercise.id, res.data)
  }

  async function handleAdd() {
    const updated = [...localOpts, '']
    setLocalOpts(updated)
    await saveAll(updated)
  }

  async function handleDelete(oi) {
    const updated = localOpts.filter((_, i) => i !== oi)
    setLocalOpts(updated)
    const res = await saveAll(updated)
    onExerciseUpdate(exercise.id, res.data)
  }

  return (
    <div className="tb-mcq-options">
      {localOpts.map((opt, oi) => (
        <label key={oi} className={`tb-mcq-option ${exercise.correct_mcq_index === oi ? 'tb-mcq-option--correct' : ''}`}>
          <input
            type="radio"
            name={`ex-${exercise.id}-correct`}
            checked={exercise.correct_mcq_index === oi}
            onChange={() => handleCorrect(oi)}
          />
          <input
            className="tb-option-input"
            type="text"
            defaultValue={opt}
            key={`${exercise.id}-opt-${oi}`}
            onBlur={e => handleBlur(oi, e.target.value)}
            placeholder={`Option ${oi + 1}â€¦`}
          />
          <button type="button" className="tb-opt-del" onClick={() => handleDelete(oi)} title="Remove option">
            Ã—
          </button>
        </label>
      ))}
      <div className="tb-mcq-footer">
        <button className="tb-add-option-btn" onClick={handleAdd}>+ Add option</button>
        <span className="tb-mcq-hint">Select the correct answer</span>
      </div>
    </div>
  )
}

// â”€â”€ Arrange Items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ArrangeItems({ exercise, panelId, testId, onExerciseUpdate }) {
  const items = exercise.arrange_items ?? []

  async function handleAdd() {
    const res = await createArrangeItem(testId, panelId, exercise.id, {
      text: '',
      correct_order: items.length + 1,
    })
    onExerciseUpdate(exercise.id, {
      arrange_items: [...items, res.data],
    })
  }

  async function handleDelete(iid) {
    await deleteArrangeItem(testId, panelId, exercise.id, iid)
    onExerciseUpdate(exercise.id, {
      arrange_items: items.filter(it => it.id !== iid),
    })
  }

  async function handleTextBlur(iid, text) {
    await updateArrangeItem(testId, panelId, exercise.id, iid, { text })
  }

  return (
    <div className="tb-arrange-items">
      {items.map((item, ii) => (
        <div key={item.id} className="tb-arrange-item">
          <span className="tb-arrange-order">{item.correct_order}</span>
          <input
            className="tb-arrange-input"
            type="text"
            defaultValue={item.text}
            key={`arr-${item.id}`}
            onBlur={e => handleTextBlur(item.id, e.target.value)}
            placeholder={`Item ${ii + 1} textâ€¦`}
          />
          <button type="button" className="tb-opt-del" onClick={() => handleDelete(item.id)} title="Remove item">
            Ã—
          </button>
        </div>
      ))}
      <button className="tb-add-option-btn" onClick={handleAdd}>+ Add item</button>
    </div>
  )
}

// â”€â”€ Gap Fill Editor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function GapFillEditor({ exercise, panelId, testId, onExerciseUpdate }) {
  const [wordLocal, setWordLocal] = useState(exercise.correct_word ?? '')

  useEffect(() => { setWordLocal(exercise.correct_word ?? '') }, [exercise.correct_word])

  async function handleWordBlur() {
    if (wordLocal === (exercise.correct_word ?? '')) return
    const res = await updateExercise(testId, panelId, exercise.id, { correct_word: wordLocal })
    onExerciseUpdate(exercise.id, res.data)
  }

  return (
    <div className="tb-gap-fill-editor">
      <div className="tb-short-hint">
        Write the question text above. Use <code>___</code> to mark where the blank should appear.
      </div>
      <div className="tb-anchor-field-row">
        <label className="tb-meta-label">Correct answer</label>
        <input
          className="tb-meta-input"
          value={wordLocal}
          onChange={e => setWordLocal(e.target.value)}
          onBlur={handleWordBlur}
          placeholder="Expected word or phraseâ€¦"
        />
      </div>
    </div>
  )
}

// â”€â”€ Exercise Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ExerciseCard({ exercise, panelId, testId, departmentId, index, onUpdate, onDelete, canWrite }) {
  const [docs,         setDocs]         = useState(exercise.documents ?? [])
  const [docUploading, setDocUploading] = useState(false)

  useEffect(() => { setDocs(exercise.documents ?? []) }, [exercise.id])

  async function handleTextBlur(html) {
    if (html === exercise.text) return
    await updateExercise(testId, panelId, exercise.id, { text: html })
  }

  async function handleDelete() {
    if (!window.confirm('Delete this question?')) return
    await deleteExercise(testId, panelId, exercise.id)
    onDelete(exercise.id)
  }

  async function handleTFChange(val) {
    const res = await updateExercise(testId, panelId, exercise.id, { correct_tf: val })
    onUpdate(exercise.id, res.data)
  }

  async function handleDocUpload(fileData) {
    setDocUploading(true)
    try {
      const res = await createExerciseDocument(testId, panelId, exercise.id, fileData)
      setDocs(prev => [...prev, res.data])
    } finally {
      setDocUploading(false)
    }
  }

  async function handleDocDelete(docId) {
    await deleteExerciseDocument(testId, panelId, exercise.id, docId)
    setDocs(prev => prev.filter(d => d.id !== docId))
  }

  const typeName = Q_TYPES.find(t => t.id === exercise.type)?.label

  return (
    <div className="tb-q-card" style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}>
      <div className="tb-q-card-header">
        <span className="tb-q-num">{String(index + 1).padStart(2, '0')}</span>
        <span className="tb-q-type-tag">{typeName}</span>
        <button className="tb-q-delete" onClick={handleDelete} title="Remove question">
          <TrashIcon />
        </button>
      </div>

      <QuestionHtmlEditor
        value={exercise.text}
        departmentId={departmentId}
        onBlur={handleTextBlur}
        placeholder="Question textâ€¦"
      />

      {exercise.type === 'mcq' && (
        <MCQOptions exercise={exercise} panelId={panelId} testId={testId} onExerciseUpdate={onUpdate} />
      )}

      {exercise.type === 'tf' && (
        <div className="tb-tf-options">
          <label className={`tb-tf-option ${exercise.correct_tf === true ? 'tb-tf-option--correct' : ''}`}>
            <input type="radio" name={`ex-${exercise.id}-tf`} checked={exercise.correct_tf === true} onChange={() => handleTFChange(true)} />
            True
          </label>
          <label className={`tb-tf-option ${exercise.correct_tf === false ? 'tb-tf-option--correct' : ''}`}>
            <input type="radio" name={`ex-${exercise.id}-tf`} checked={exercise.correct_tf === false} onChange={() => handleTFChange(false)} />
            False
          </label>
        </div>
      )}

      {exercise.type === 'short' && (
        <div className="tb-short-hint">Students type a free-text response.</div>
      )}

      {exercise.type === 'argument' && (
        <div className="tb-argument-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Students write a long-form argument or composition in response to the prompt above.
        </div>
      )}

      {exercise.type === 'arrange' && (
        <ArrangeItems exercise={exercise} panelId={panelId} testId={testId} onExerciseUpdate={onUpdate} />
      )}

      {exercise.type === 'gap_fill' && (
        <GapFillEditor exercise={exercise} panelId={panelId} testId={testId} onExerciseUpdate={onUpdate} />
      )}

      <DocumentSection
        documents={docs}
        onUpload={handleDocUpload}
        onDelete={handleDocDelete}
        uploading={docUploading}
        isAdmin={canWrite}
        departmentId={departmentId}
      />
    </div>
  )
}

// â”€â”€ VR Anchor Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MCQAnchorCard({ anchor, panelId, testId, departmentId, onReload, canWrite }) {
  const [titleLocal,   setTitleLocal]   = useState(anchor.title ?? '')
  const [localOpts,    setLocalOpts]    = useState(anchor.options?.map(o => o.text) ?? [])
  const [docs,         setDocs]         = useState(anchor.documents ?? [])
  const [docUploading, setDocUploading] = useState(false)

  useEffect(() => { setTitleLocal(anchor.title ?? '') }, [anchor.title])
  useEffect(() => { setLocalOpts(anchor.options?.map(o => o.text) ?? []) }, [anchor.options])
  useEffect(() => { setDocs(anchor.documents ?? []) }, [anchor.id])

  async function handleTitleBlur() {
    if (titleLocal === (anchor.title ?? '')) return
    await updateMCQAnchor(testId, panelId, anchor.id, { title: titleLocal })
  }

  async function handleTextBlur(html) {
    if (html === anchor.text) return
    await updateMCQAnchor(testId, panelId, anchor.id, { text: html })
  }

  async function handleDelete() {
    if (!window.confirm('Delete this anchor?')) return
    await deleteMCQAnchor(testId, panelId, anchor.id)
    onReload()
  }

  async function handleDocUpload(fileData) {
    setDocUploading(true)
    try {
      const res = await createMCQAnchorDocument(testId, panelId, anchor.id, fileData)
      setDocs(prev => [...prev, res.data])
    } finally {
      setDocUploading(false)
    }
  }

  async function handleDocDelete(docId) {
    await deleteMCQAnchorDocument(testId, panelId, anchor.id, docId)
    setDocs(prev => prev.filter(d => d.id !== docId))
  }

  async function saveOpts(opts) {
    await updateMCQAnchor(testId, panelId, anchor.id, {
      options: opts.map((text, i) => ({ text, order: i })),
    })
  }

  async function handleOptBlur(oi, newText) {
    const updated = localOpts.map((t, i) => (i === oi ? newText : t))
    setLocalOpts(updated)
    await saveOpts(updated)
  }

  async function handleCorrect(oi) {
    await updateMCQAnchor(testId, panelId, anchor.id, { correct_mcq_index: oi })
    onReload()
  }

  async function handleAddOpt() {
    const updated = [...localOpts, '']
    setLocalOpts(updated)
    await saveOpts(updated)
  }

  async function handleDelOpt(oi) {
    const updated = localOpts.filter((_, i) => i !== oi)
    setLocalOpts(updated)
    await saveOpts(updated)
    onReload()
  }

  return (
    <div className="tb-anchor-card">
      <div className="tb-anchor-card-header">
        <span className="tb-anchor-type-tag">MCQ</span>
        <span className="tb-anchor-pos">({anchor.pos_x}, {anchor.pos_y}, {anchor.pos_z})</span>
        <button className="tb-q-delete" onClick={handleDelete} title="Delete anchor"><TrashIcon /></button>
      </div>
      <input
        className="tb-meta-input"
        value={titleLocal}
        onChange={e => setTitleLocal(e.target.value)}
        onBlur={handleTitleBlur}
        placeholder="Anchor titleâ€¦"
        style={{ width: '100%', marginBottom: 8 }}
      />
      <QuestionHtmlEditor
        value={anchor.text}
        departmentId={departmentId}
        onBlur={handleTextBlur}
        placeholder="Question textâ€¦"
      />
      <div className="tb-mcq-options">
        {localOpts.map((opt, oi) => (
          <label key={oi} className={`tb-mcq-option ${anchor.correct_mcq_index === oi ? 'tb-mcq-option--correct' : ''}`}>
            <input type="radio" name={`anc-${anchor.id}-correct`} checked={anchor.correct_mcq_index === oi} onChange={() => handleCorrect(oi)} />
            <input className="tb-option-input" type="text" defaultValue={opt} key={`anc-${anchor.id}-opt-${oi}`} onBlur={e => handleOptBlur(oi, e.target.value)} placeholder={`Option ${oi + 1}â€¦`} />
            <button type="button" className="tb-opt-del" onClick={() => handleDelOpt(oi)}>Ã—</button>
          </label>
        ))}
        <div className="tb-mcq-footer">
          <button className="tb-add-option-btn" onClick={handleAddOpt}>+ Add option</button>
        </div>
      </div>
      <DocumentSection
        documents={docs}
        onUpload={handleDocUpload}
        onDelete={handleDocDelete}
        uploading={docUploading}
        isAdmin={canWrite}
        departmentId={departmentId}
      />
    </div>
  )
}

function WordCompletionCard({ anchor, panelId, testId, departmentId, onReload, canWrite }) {
  const [titleLocal,   setTitleLocal]   = useState(anchor.title ?? '')
  const [wordLocal,    setWordLocal]    = useState(anchor.correct_word)
  const [docs,         setDocs]         = useState(anchor.documents ?? [])
  const [docUploading, setDocUploading] = useState(false)

  useEffect(() => { setTitleLocal(anchor.title ?? '') }, [anchor.title])
  useEffect(() => { setWordLocal(anchor.correct_word) }, [anchor.correct_word])
  useEffect(() => { setDocs(anchor.documents ?? []) }, [anchor.id])

  async function handleDelete() {
    if (!window.confirm('Delete this anchor?')) return
    await deleteWordCompletionAnchor(testId, panelId, anchor.id)
    onReload()
  }

  async function handleDocUpload(fileData) {
    setDocUploading(true)
    try {
      const res = await createWCAnchorDocument(testId, panelId, anchor.id, fileData)
      setDocs(prev => [...prev, res.data])
    } finally {
      setDocUploading(false)
    }
  }

  async function handleDocDelete(docId) {
    await deleteWCAnchorDocument(testId, panelId, anchor.id, docId)
    setDocs(prev => prev.filter(d => d.id !== docId))
  }

  async function handleTitleBlur() {
    if (titleLocal === (anchor.title ?? '')) return
    await updateWordCompletionAnchor(testId, panelId, anchor.id, { title: titleLocal })
  }

  async function handleTextBlur(html) {
    if (html === anchor.text) return
    await updateWordCompletionAnchor(testId, panelId, anchor.id, { text: html })
  }

  async function handleWordBlur() {
    if (wordLocal === anchor.correct_word) return
    await updateWordCompletionAnchor(testId, panelId, anchor.id, { correct_word: wordLocal })
  }

  return (
    <div className="tb-anchor-card">
      <div className="tb-anchor-card-header">
        <span className="tb-anchor-type-tag">Word Completion</span>
        <span className="tb-anchor-pos">({anchor.pos_x}, {anchor.pos_y}, {anchor.pos_z})</span>
        <button className="tb-q-delete" onClick={handleDelete} title="Delete anchor"><TrashIcon /></button>
      </div>
      <input
        className="tb-meta-input"
        value={titleLocal}
        onChange={e => setTitleLocal(e.target.value)}
        onBlur={handleTitleBlur}
        placeholder="Anchor titleâ€¦"
        style={{ width: '100%', marginBottom: 8 }}
      />
      <QuestionHtmlEditor
        value={anchor.text}
        departmentId={departmentId}
        onBlur={handleTextBlur}
        placeholder="Sentence with ___ for the blankâ€¦"
      />
      <div className="tb-anchor-field-row">
        <label className="tb-meta-label">Correct word</label>
        <input
          className="tb-meta-input"
          value={wordLocal}
          onChange={e => setWordLocal(e.target.value)}
          onBlur={handleWordBlur}
          placeholder="Expected answerâ€¦"
        />
      </div>
      <DocumentSection
        documents={docs}
        onUpload={handleDocUpload}
        onDelete={handleDocDelete}
        uploading={docUploading}
        isAdmin={canWrite}
        departmentId={departmentId}
      />
    </div>
  )
}

function LocalizationCard({ anchor, panelId, testId, departmentId, onReload, canWrite }) {
  const [titleLocal,   setTitleLocal]   = useState(anchor.title ?? '')
  const [docs,         setDocs]         = useState(anchor.documents ?? [])
  const [docUploading, setDocUploading] = useState(false)
  const points = anchor.polygon_points ?? []

  useEffect(() => { setTitleLocal(anchor.title ?? '') }, [anchor.title])
  useEffect(() => { setDocs(anchor.documents ?? []) }, [anchor.id])

  async function handleDelete() {
    if (!window.confirm('Delete this anchor?')) return
    await deleteLocalizationAnchor(testId, panelId, anchor.id)
    onReload()
  }

  async function handleDocUpload(fileData) {
    setDocUploading(true)
    try {
      const res = await createLocAnchorDocument(testId, panelId, anchor.id, fileData)
      setDocs(prev => [...prev, res.data])
    } finally {
      setDocUploading(false)
    }
  }

  async function handleDocDelete(docId) {
    await deleteLocAnchorDocument(testId, panelId, anchor.id, docId)
    setDocs(prev => prev.filter(d => d.id !== docId))
  }

  async function handleTitleBlur() {
    if (titleLocal === (anchor.title ?? '')) return
    await updateLocalizationAnchor(testId, panelId, anchor.id, { title: titleLocal })
  }

  async function handleTextBlur(html) {
    if (html === anchor.text) return
    await updateLocalizationAnchor(testId, panelId, anchor.id, { text: html })
  }

  async function handleAddPoint() {
    await createLocalizationPoint(testId, panelId, anchor.id, { x: 0, y: 0, z: 0, order: points.length })
    onReload()
  }

  async function handleDeletePoint(ptid) {
    await deleteLocalizationPoint(testId, panelId, anchor.id, ptid)
    onReload()
  }

  return (
    <div className="tb-anchor-card">
      <div className="tb-anchor-card-header">
        <span className="tb-anchor-type-tag">Localization</span>
        <span className="tb-anchor-pos">({anchor.pos_x}, {anchor.pos_y}, {anchor.pos_z})</span>
        <button className="tb-q-delete" onClick={handleDelete} title="Delete anchor"><TrashIcon /></button>
      </div>
      <input
        className="tb-meta-input"
        value={titleLocal}
        onChange={e => setTitleLocal(e.target.value)}
        onBlur={handleTitleBlur}
        placeholder="Anchor titleâ€¦"
        style={{ width: '100%', marginBottom: 8 }}
      />
      <QuestionHtmlEditor
        value={anchor.text}
        departmentId={departmentId}
        onBlur={handleTextBlur}
        placeholder="What should the student locate?â€¦"
      />
      <div className="tb-anchor-points">
        <span className="tb-anchor-points-label">Polygon points ({points.length})</span>
        <div className="tb-anchor-points-list">
          {points.map((pt, pi) => (
            <div key={pt.id} className="tb-anchor-point-row">
              <span className="tb-arrange-order">{pi + 1}</span>
              <span className="tb-anchor-point-coords">({pt.x}, {pt.y}, {pt.z})</span>
              <button type="button" className="tb-opt-del" onClick={() => handleDeletePoint(pt.id)}>Ã—</button>
            </div>
          ))}
        </div>
        <button className="tb-add-option-btn" onClick={handleAddPoint}>+ Add point</button>
      </div>
      <DocumentSection
        documents={docs}
        onUpload={handleDocUpload}
        onDelete={handleDocDelete}
        uploading={docUploading}
        isAdmin={canWrite}
        departmentId={departmentId}
      />
    </div>
  )
}

// â”€â”€ VR Panel Section (inline in test builder) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function VRPanelSection({ vr, panelId, testId, departmentId, panelTitle, vrBasePath, onReload, canWrite }) {
  const navigate   = useNavigate()
  const mcqAnchors = vr?.mcq_anchors ?? []
  const wcAnchors  = vr?.word_completion_anchors ?? []
  const locAnchors = vr?.localization_anchors ?? []
  const allCount   = mcqAnchors.length + wcAnchors.length + locAnchors.length

  function openVREditor() {
    const base = vrBasePath ?? '/teacher/assignments'
    navigate(`${base}/${testId}/panels/${panelId}/vr`, {
      state: { vr, panelTitle, departmentId },
    })
  }

  return (
    <div className="tb-vr-editor">
      <button className="tb-vr-open-btn" onClick={openVREditor}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8l-4 8h8z" fill="currentColor" stroke="none"/>
        </svg>
        Open VR Scene Editor
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>

      {allCount > 0 ? (
        <div className="tb-vr-anchors-section">
          <div className="tb-vr-section-header">
            <span className="tb-vr-section-title">Placed Anchors ({allCount})</span>
            <span className="tb-vr-section-hint">Edit content below â€” use the VR Scene Editor to add, move or delete anchors.</span>
          </div>
          {mcqAnchors.map(a => <MCQAnchorCard key={a.id} anchor={a} panelId={panelId} testId={testId} departmentId={departmentId} onReload={onReload} canWrite={canWrite} />)}
          {wcAnchors.map(a => <WordCompletionCard key={a.id} anchor={a} panelId={panelId} testId={testId} departmentId={departmentId} onReload={onReload} canWrite={canWrite} />)}
          {locAnchors.map(a => <LocalizationCard key={a.id} anchor={a} panelId={panelId} testId={testId} departmentId={departmentId} onReload={onReload} canWrite={canWrite} />)}
        </div>
      ) : (
        <div className="tb-anchor-empty">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 8l-4 8h8z" fill="currentColor" stroke="none"/>
          </svg>
          No anchors placed yet. Open the VR Scene Editor to add anchors directly onto the 360Â° scene.
        </div>
      )}
    </div>
  )
}

// â”€â”€ Panel Section (main export) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function PanelSection({ panel, testId, departmentId, vrBasePath, index, expanded, onExpand, onReload }) {
  const { user } = useAuth()
  const canWrite = user?.role === 'teacher' || user?.role === 'admin' || !!user?.is_staff

  const [titleLocal, setTitleLocal] = useState(panel.title)
  const [addingEx,   setAddingEx]   = useState(false)
  const [newExType,  setNewExType]  = useState('mcq')
  const [localExercises, setLocalExercises] = useState(
    panel.exercise_content?.exercises ?? []
  )
  const [panelDocs,         setPanelDocs]         = useState(panel.documents ?? [])
  const [panelDocUploading, setPanelDocUploading] = useState(false)

  useEffect(() => { setTitleLocal(panel.title) }, [panel.title])
  useEffect(() => {
    setLocalExercises(panel.exercise_content?.exercises ?? [])
    setPanelDocs(panel.documents ?? [])
  }, [panel.id])

  const vr = panel.vr_exercise

  async function handlePanelDocUpload(fileData) {
    setPanelDocUploading(true)
    try {
      const res = await createTestPanelDocument(testId, panel.id, fileData)
      setPanelDocs(prev => [...prev, res.data])
    } finally {
      setPanelDocUploading(false)
    }
  }

  async function handlePanelDocDelete(docId) {
    await deleteTestPanelDocument(testId, panel.id, docId)
    setPanelDocs(prev => prev.filter(d => d.id !== docId))
  }

  function updateExerciseLocal(exId, patch) {
    setLocalExercises(prev =>
      prev.map(ex => ex.id === exId ? { ...ex, ...patch } : ex)
    )
  }

  function deleteExerciseLocal(exId) {
    setLocalExercises(prev => prev.filter(ex => ex.id !== exId))
  }

  async function handleDeletePanel() {
    if (!window.confirm('Delete this panel and all its content?')) return
    await deleteTestPanel(testId, panel.id)
    onReload()
  }

  async function handleTitleBlur() {
    if (titleLocal === panel.title) return
    await updateTestPanel(testId, panel.id, { title: titleLocal })
  }

  async function handleAddExercise() {
    const res = await createExercise(testId, panel.id, {
      type: newExType,
      text: '',
      order: localExercises.length,
    })
    setAddingEx(false)
    setLocalExercises(prev => [...prev, res.data])
  }

  const typeBadgeClass = panel.type === 'vr_exercise' ? 'tb-panel-type-badge--vr' : 'tb-panel-type-badge--ex'
  const typeLabel      = panel.type === 'vr_exercise' ? 'VR' : 'EX'

  return (
    <div className="tb-panel" style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}>
      <div className="tb-panel-header">
        <button className="tb-panel-collapse-btn" onClick={onExpand}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {expanded ? <polyline points="6 9 12 15 18 9"/> : <polyline points="9 18 15 12 9 6"/>}
          </svg>
        </button>
        <span className={`tb-panel-type-badge ${typeBadgeClass}`}>{typeLabel}</span>
        <input
          className="tb-panel-title-input"
          value={titleLocal}
          onChange={e => setTitleLocal(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={e => e.key === 'Enter' && e.target.blur()}
        />
        <button className="tb-panel-delete-btn" onClick={handleDeletePanel} title="Delete panel">
          <TrashIcon />
        </button>
      </div>

      {expanded && (
        <div className="tb-panel-body">
          {panel.type === 'exercise' && (
            <>
              <div className="tb-panel-exercises">
                {localExercises.map((ex, i) => (
                  <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    panelId={panel.id}
                    testId={testId}
                    departmentId={departmentId}
                    index={i}
                    onUpdate={updateExerciseLocal}
                    onDelete={deleteExerciseLocal}
                    canWrite={canWrite}
                  />
                ))}
                {localExercises.length === 0 && !addingEx && (
                  <div className="tb-q-empty tb-q-empty--inner">
                    <span>No questions. Add one below.</span>
                  </div>
                )}
              </div>

              {addingEx ? (
                <div className="tb-add-q-panel tb-add-q-panel--inner">
                  <span className="tb-add-q-label">Question type</span>
                  <div className="tb-q-type-picker">
                    {Q_TYPES.map(t => (
                      <button
                        key={t.id}
                        className={`tb-q-type-btn ${newExType === t.id ? 'tb-q-type-btn--active' : ''}`}
                        onClick={() => setNewExType(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="tb-add-q-actions">
                    <button className="tb-add-q-cancel" onClick={() => setAddingEx(false)}>Cancel</button>
                    <button className="tb-add-q-confirm" onClick={handleAddExercise}>Add Question</button>
                  </div>
                </div>
              ) : (
                <button className="tb-add-q-trigger tb-add-q-trigger--inner" onClick={() => setAddingEx(true)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Question
                </button>
              )}
            </>
          )}

          {panel.type === 'vr_exercise' && (
            <VRPanelSection vr={vr} panelId={panel.id} testId={testId} departmentId={departmentId} vrBasePath={vrBasePath} panelTitle={titleLocal} onReload={onReload} canWrite={canWrite} />
          )}

          <DocumentSection
            documents={panelDocs}
            onUpload={handlePanelDocUpload}
            onDelete={handlePanelDocDelete}
            uploading={panelDocUploading}
            isAdmin={canWrite}
            departmentId={departmentId}
          />
        </div>
      )}
    </div>
  )
}
