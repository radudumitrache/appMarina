import { useState, useEffect } from 'react'
import QuestionHtmlEditor from '../test-builder/QuestionHtmlEditor'
import DocumentSection from '../lesson-panel-editor/DocumentSection'
import {
  createMCQAnchorDocument, deleteMCQAnchorDocument,
  createWCAnchorDocument, deleteWCAnchorDocument,
  createLocAnchorDocument, deleteLocAnchorDocument,
} from '../../../api/tests'

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

const DELETE_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
)

export default function VRAnchorDrawer({
  mcqAnchors, wcAnchors, locAnchors, allCount,
  selectedAnchor, moving, saving, classroomId, testId, panelId,
  onOpenEdit, onCloseEdit, onSaveEdit, onDeleteAnchor, onSetMoving,
}) {
  const [drawerWidth,  setDrawerWidth]  = useState(300)
  const [editForm,     setEditForm]     = useState({})
  const [docs,         setDocs]         = useState([])
  const [docUploading, setDocUploading] = useState(false)

  useEffect(() => {
    if (!selectedAnchor) { setEditForm({}); setDocs([]); return }
    const { type, data } = selectedAnchor
    setDocs(data.documents ?? [])
    if (type === 'mcq') {
      setEditForm({
        title: data.title || '',
        text: data.text || '',
        correct_mcq_index: data.correct_mcq_index ?? 0,
        options: data.options?.length ? data.options.map(o => o.text) : ['', ''],
      })
    } else if (type === 'wc') {
      setEditForm({ title: data.title || '', text: data.text || '', correct_word: data.correct_word || '' })
    } else if (type === 'loc') {
      setEditForm({ title: data.title || '', text: data.text || '' })
    }
  }, [selectedAnchor])

  async function handleDocUpload(fileData) {
    if (!selectedAnchor) return
    setDocUploading(true)
    try {
      const { type, data } = selectedAnchor
      let res
      if (type === 'mcq') res = await createMCQAnchorDocument(testId, panelId, data.id, fileData)
      else if (type === 'wc') res = await createWCAnchorDocument(testId, panelId, data.id, fileData)
      else if (type === 'loc') res = await createLocAnchorDocument(testId, panelId, data.id, fileData)
      if (res) setDocs(prev => [...prev, res.data])
    } finally {
      setDocUploading(false)
    }
  }

  async function handleDocDelete(docId) {
    if (!selectedAnchor) return
    const { type, data } = selectedAnchor
    if (type === 'mcq') await deleteMCQAnchorDocument(testId, panelId, data.id, docId)
    else if (type === 'wc') await deleteWCAnchorDocument(testId, panelId, data.id, docId)
    else if (type === 'loc') await deleteLocAnchorDocument(testId, panelId, data.id, docId)
    setDocs(prev => prev.filter(d => d.id !== docId))
  }

  function handleResizeDrag(e) {
    e.preventDefault()
    const startX = e.clientX
    const startW = drawerWidth
    function onMove(ev) { setDrawerWidth(Math.min(600, Math.max(220, startW + (startX - ev.clientX)))) }
    function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  async function handleSave() {
    await onSaveEdit(selectedAnchor.type, selectedAnchor.data.id, editForm)
  }

  return (
    <div className="vrpe-anchor-drawer" style={{ width: drawerWidth }}>
      <div className="vrpe-drawer-resize-handle" onMouseDown={handleResizeDrag} />

      {selectedAnchor ? (
        <>
          <div className="vrpe-edit-header">
            <button className="vrpe-edit-back" onClick={onCloseEdit}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              All anchors
            </button>
            <span className={`vrpe-anchor-badge vrpe-anchor-badge--${selectedAnchor.type}`}>
              {selectedAnchor.type.toUpperCase()}
            </span>
          </div>

          <input
            className="tb-meta-input vrpe-edit-input"
            value={editForm.title || ''}
            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Anchor title (hotspot label)…"
          />

          <QuestionHtmlEditor
            key={selectedAnchor.data.id}
            value={selectedAnchor.data.text || ''}
            classroomId={classroomId}
            onBlur={html => setEditForm(f => ({ ...f, text: html }))}
            placeholder="Question / prompt text…"
          />

          {selectedAnchor.type === 'mcq' && (
            <div className="tb-mcq-options vrpe-edit-options">
              {(editForm.options || []).map((opt, oi) => (
                <label key={oi} className={`tb-mcq-option ${editForm.correct_mcq_index === oi ? 'tb-mcq-option--correct' : ''}`}>
                  <input
                    type="radio"
                    name="vrpe-edit-mcq-correct"
                    checked={editForm.correct_mcq_index === oi}
                    onChange={() => setEditForm(f => ({ ...f, correct_mcq_index: oi }))}
                  />
                  <input
                    className="tb-option-input"
                    type="text"
                    value={opt}
                    onChange={e => {
                      const opts = [...editForm.options]; opts[oi] = e.target.value
                      setEditForm(f => ({ ...f, options: opts }))
                    }}
                    placeholder={`Option ${oi + 1}…`}
                  />
                  {(editForm.options || []).length > 2 && (
                    <button type="button" className="tb-opt-del" onClick={() => setEditForm(f => ({ ...f, options: f.options.filter((_, i) => i !== oi) }))}>×</button>
                  )}
                </label>
              ))}
              <button className="tb-add-option-btn" onClick={() => setEditForm(f => ({ ...f, options: [...(f.options || []), ''] }))}>
                + Add option
              </button>
            </div>
          )}

          {selectedAnchor.type === 'wc' && (
            <div className="tb-anchor-field-row">
              <label className="tb-meta-label">Correct word</label>
              <input
                className="tb-meta-input vrpe-edit-input"
                value={editForm.correct_word || ''}
                onChange={e => setEditForm(f => ({ ...f, correct_word: e.target.value }))}
                placeholder="Expected answer…"
              />
            </div>
          )}

          <DocumentSection
            documents={docs}
            onUpload={handleDocUpload}
            onDelete={handleDocDelete}
            uploading={docUploading}
            isAdmin
            classroomId={classroomId}
          />

          <div className="vrpe-edit-actions">
            <button className="vrpe-edit-move-btn" onClick={() => onSetMoving(true)} disabled={moving || saving}>
              {moving ? 'Click in scene…' : 'Move position'}
            </button>
            <button
              className="vrpe-anchor-del vrpe-edit-del-btn"
              onClick={() => { onDeleteAnchor(selectedAnchor.type, selectedAnchor.data.id); onCloseEdit() }}
            >
              Delete
            </button>
          </div>

          <button className="tb-add-q-confirm vrpe-edit-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </>
      ) : (
        <>
          <div className="vrpe-drawer-title">Placed Anchors ({allCount})</div>

          {allCount === 0 && <div className="vrpe-drawer-empty">No anchors yet.</div>}

          {mcqAnchors.map(a => (
            <div key={a.id} className="vrpe-anchor-item vrpe-anchor-item--clickable" onClick={() => onOpenEdit('mcq', a)}>
              <span className="vrpe-anchor-badge">MCQ</span>
              <div className="vrpe-anchor-info">
                {a.title && <span className="vrpe-anchor-title">{a.title}</span>}
                <span className="vrpe-anchor-text">{stripHtml(a.text) || '(no text)'}</span>
              </div>
              <button className="vrpe-anchor-del" onClick={e => { e.stopPropagation(); onDeleteAnchor('mcq', a.id) }} title="Delete">{DELETE_ICON}</button>
            </div>
          ))}

          {wcAnchors.map(a => (
            <div key={a.id} className="vrpe-anchor-item vrpe-anchor-item--clickable" onClick={() => onOpenEdit('wc', a)}>
              <span className="vrpe-anchor-badge">WC</span>
              <div className="vrpe-anchor-info">
                {a.title && <span className="vrpe-anchor-title">{a.title}</span>}
                <span className="vrpe-anchor-text">{stripHtml(a.text) || '(no text)'}</span>
              </div>
              <button className="vrpe-anchor-del" onClick={e => { e.stopPropagation(); onDeleteAnchor('wc', a.id) }} title="Delete">{DELETE_ICON}</button>
            </div>
          ))}

          {locAnchors.map(a => (
            <div key={a.id} className="vrpe-anchor-item vrpe-anchor-item--clickable" onClick={() => onOpenEdit('loc', a)}>
              <span className="vrpe-anchor-badge">LOC</span>
              <div className="vrpe-anchor-info">
                {a.title && <span className="vrpe-anchor-title">{a.title}</span>}
                <span className="vrpe-anchor-text">{stripHtml(a.text) || '(no text)'}</span>
              </div>
              <button className="vrpe-anchor-del" onClick={e => { e.stopPropagation(); onDeleteAnchor('loc', a.id) }} title="Delete">{DELETE_ICON}</button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
