import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import VRViewer from '../../components/shared/VRViewer'
import MediaInsertModal from '../../components/teacher/lesson-panel-editor/MediaInsertModal'
import QuestionHtmlEditor from '../../components/teacher/test-builder/QuestionHtmlEditor'
import {
  getTest, updateTestPanel,
  createMCQAnchor, updateMCQAnchor, deleteMCQAnchor,
  createWordCompletionAnchor, updateWordCompletionAnchor, deleteWordCompletionAnchor,
  createLocalizationAnchor, updateLocalizationAnchor, deleteLocalizationAnchor,
  createLocalizationPoint,
} from '../../api/tests'
import '../../components/css/teacher/test-builder/AddQuestionPanel.css'
import '../../components/css/teacher/test-builder/QuestionCard.css'
import '../../components/css/teacher/test-builder/QuestionHtmlEditor.css'
import '../../components/css/teacher/test-builder/TestMetaRow.css'
import '../../components/css/teacher/test-builder/PanelSection.css'
import '../css/teacher/VRPanelEditor.css'

// ── Coordinate helpers ────────────────────────────────────────────────────────

function xyzToLonLat(x, y, z) {
  const r = Math.sqrt(x * x + y * y + z * z) || 1
  return {
    lon: Math.atan2(z, x) * (180 / Math.PI),
    lat: 90 - Math.acos(Math.max(-1, Math.min(1, y / r))) * (180 / Math.PI),
  }
}

function lonLatToXyz(lon, lat) {
  const phi   = (90 - lat) * (Math.PI / 180)
  const theta = lon * (Math.PI / 180)
  return {
    x: parseFloat((Math.sin(phi) * Math.cos(theta)).toFixed(6)),
    y: parseFloat((Math.cos(phi)).toFixed(6)),
    z: parseFloat((Math.sin(phi) * Math.sin(theta)).toFixed(6)),
  }
}

function AnchorPin({ label }) {
  return (
    <>
      <div className="tb-vr-anchor-pin" />
      <span className="vr-hotspot-label">{label}</span>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function VRPanelEditor() {
  const { testId, panelId } = useParams()
  const navigate             = useNavigate()
  const { state }            = useLocation()

  const classroomId = state?.classroomId ?? null

  const [vr,           setVR]           = useState(state?.vr ?? null)
  const [panelTitle,   setPanelTitle]   = useState(state?.panelTitle ?? '')
  const [loading,      setLoading]      = useState(!state?.vr)
  const [editMode,     setEditMode]     = useState(false)
  const [sceneModal,   setSceneModal]   = useState(false)
  const [anchorDrawer, setAnchorDrawer] = useState(false)
  const [pendingCoords,    setPendingCoords]    = useState(null)   // {lon,lat,x,y,z}
  const [pendingLocPoints, setPendingLocPoints] = useState([])     // polygon vertices while drawing
  const [placing,          setPlacing]          = useState(null)   // 'mcq'|'wc'|'loc'
  const [locStep,          setLocStep]          = useState('drawing') // 'drawing'|'filling'
  const [saving,       setSaving]       = useState(false)

  const [mcqForm, setMCQForm] = useState({ title: '', text: '', correct_mcq_index: 0, options: ['', ''] })
  const [wcForm,  setWCForm]  = useState({ title: '', text: '', correct_word: '' })
  const [locForm, setLocForm] = useState({ title: '', text: '' })

  const [selectedAnchor, setSelectedAnchor] = useState(null) // { type: 'mcq'|'wc'|'loc', data: {...} }
  const [moving,         setMoving]         = useState(false)
  const [editForm,       setEditForm]       = useState({})
  const [drawerWidth,    setDrawerWidth]    = useState(300)

  const loadPanel = useCallback(() => {
    getTest(testId).then(res => {
      const panel = res.data.panels?.find(p => p.id === Number(panelId))
      if (panel) {
        setVR(panel.vr_exercise)
        setPanelTitle(panel.title)
      }
    }).finally(() => setLoading(false))
  }, [testId, panelId])

  // Refreshes only anchor arrays — does NOT touch scene_url so the 360 image never reloads.
  const loadAnchors = useCallback(() => {
    getTest(testId).then(res => {
      const panel = res.data.panels?.find(p => p.id === Number(panelId))
      if (panel?.vr_exercise) {
        const { mcq_anchors, word_completion_anchors, localization_anchors } = panel.vr_exercise
        setVR(prev => ({ ...prev, mcq_anchors, word_completion_anchors, localization_anchors }))
      }
    })
  }, [testId, panelId])

  useEffect(() => {
    if (!state?.vr) loadPanel()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const sceneUrl   = vr?.scene_url   || null
  const mcqAnchors = vr?.mcq_anchors ?? []
  const wcAnchors  = vr?.word_completion_anchors ?? []
  const locAnchors = vr?.localization_anchors ?? []
  const allCount   = mcqAnchors.length + wcAnchors.length + locAnchors.length

  const hotspots = [
    ...mcqAnchors.map(a => {
      const { lon, lat } = xyzToLonLat(a.pos_x, a.pos_y, a.pos_z)
      const sel = selectedAnchor?.type === 'mcq' && selectedAnchor.data.id === a.id
      return { id: `mcq-${a.id}`, lon, lat, className: sel ? 'vr-hotspot--selected' : '', render: () => <AnchorPin label={a.title || 'MCQ'} />, onClick: () => { if (!placing && !moving) openEdit('mcq', a) } }
    }),
    ...wcAnchors.map(a => {
      const { lon, lat } = xyzToLonLat(a.pos_x, a.pos_y, a.pos_z)
      const sel = selectedAnchor?.type === 'wc' && selectedAnchor.data.id === a.id
      return { id: `wc-${a.id}`, lon, lat, className: sel ? 'vr-hotspot--selected' : '', render: () => <AnchorPin label={a.title || 'WC'} />, onClick: () => { if (!placing && !moving) openEdit('wc', a) } }
    }),
    ...locAnchors.map(a => {
      const { lon, lat } = xyzToLonLat(a.pos_x, a.pos_y, a.pos_z)
      const sel = selectedAnchor?.type === 'loc' && selectedAnchor.data.id === a.id
      return { id: `loc-${a.id}`, lon, lat, className: sel ? 'vr-hotspot--selected' : '', render: () => <AnchorPin label={a.title || 'LOC'} />, onClick: () => { if (!placing && !moving) openEdit('loc', a) } }
    }),
    ...(pendingCoords
      ? [{ id: 'pending', lon: pendingCoords.lon, lat: pendingCoords.lat, className: 'vr-hotspot--pending' }]
      : []),
    ...pendingLocPoints.map((pt, i) => ({
      id: `pending-loc-${i}`,
      lon: pt.lon, lat: pt.lat,
      className: 'vr-hotspot--pending',
    })),
  ]

  const polygonAnchors = [
    ...locAnchors
      .filter(a => (a.polygon_points?.length ?? 0) >= 2)
      .map(a => ({ id: a.id, points: a.polygon_points, title: a.title || a.text })),
    ...(pendingLocPoints.length >= 2
      ? [{ id: 'pending-polygon', points: pendingLocPoints.map((p, i) => ({ x: p.x, y: p.y, z: p.z, order: i })), title: '' }]
      : []),
  ]

  function openEdit(type, data) {
    setSelectedAnchor({ type, data })
    setAnchorDrawer(true)
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
  }

  function closeEdit() {
    setSelectedAnchor(null)
    setMoving(false)
    setEditForm({})
  }

  async function saveEdit() {
    if (!selectedAnchor) return
    setSaving(true)
    try {
      const { type, data } = selectedAnchor
      if (type === 'mcq') {
        await updateMCQAnchor(testId, panelId, data.id, {
          title: editForm.title,
          text: editForm.text,
          correct_mcq_index: editForm.correct_mcq_index,
          options: editForm.options.map((text, i) => ({ text, order: i })),
        })
      } else if (type === 'wc') {
        await updateWordCompletionAnchor(testId, panelId, data.id, {
          title: editForm.title,
          text: editForm.text,
          correct_word: editForm.correct_word,
        })
      } else if (type === 'loc') {
        await updateLocalizationAnchor(testId, panelId, data.id, {
          title: editForm.title,
          text: editForm.text,
        })
      }
      closeEdit()
      loadAnchors()
    } finally {
      setSaving(false)
    }
  }

  async function handleMoveAnchor(x, y, z) {
    if (!selectedAnchor) return
    setSaving(true)
    try {
      const { type, data } = selectedAnchor
      const patch = { pos_x: x, pos_y: y, pos_z: z }
      if (type === 'mcq') await updateMCQAnchor(testId, panelId, data.id, patch)
      else if (type === 'wc') await updateWordCompletionAnchor(testId, panelId, data.id, patch)
      else if (type === 'loc') await updateLocalizationAnchor(testId, panelId, data.id, patch)
      setMoving(false)
      loadAnchors()
    } finally {
      setSaving(false)
    }
  }

  function handleSceneClick(lon, lat) {
    const { x, y, z } = lonLatToXyz(lon, lat)
    if (moving && selectedAnchor) {
      handleMoveAnchor(x, y, z)
      return
    }
    if (placing === 'loc') {
      setPendingLocPoints(pts => [...pts, { lon, lat, x, y, z }])
    } else {
      setPendingCoords({ lon, lat, x, y, z })
      setPlacing(null)
    }
  }

  function cancelPlacement() {
    setPendingCoords(null)
    setPendingLocPoints([])
    setPlacing(null)
    setLocStep('drawing')
  }

  function goBack() {
    navigate(-1)
  }

  async function handleSceneSelect(url) {
    setSceneModal(false)
    setSaving(true)
    try {
      await updateTestPanel(testId, panelId, { scene_url: url })
      loadPanel()
    } finally {
      setSaving(false)
    }
  }

  async function handleAddMCQ() {
    setSaving(true)
    try {
      await createMCQAnchor(testId, panelId, {
        pos_x: pendingCoords.x, pos_y: pendingCoords.y, pos_z: pendingCoords.z,
        size: 1, color_r: 255, color_g: 255, color_b: 255,
        title: mcqForm.title,
        text: mcqForm.text, correct_mcq_index: mcqForm.correct_mcq_index,
        options: mcqForm.options.map((text, i) => ({ text, order: i })),
      })
      cancelPlacement()
      setMCQForm({ title: '', text: '', correct_mcq_index: 0, options: ['', ''] })
      loadAnchors()
    } finally {
      setSaving(false)
    }
  }

  async function handleAddWC() {
    setSaving(true)
    try {
      await createWordCompletionAnchor(testId, panelId, {
        pos_x: pendingCoords.x, pos_y: pendingCoords.y, pos_z: pendingCoords.z,
        size: 1, color_r: 255, color_g: 255, color_b: 255,
        ...wcForm,
      })
      cancelPlacement()
      setWCForm({ title: '', text: '', correct_word: '' })
      loadAnchors()
    } finally {
      setSaving(false)
    }
  }

  async function handleAddLoc() {
    if (pendingLocPoints.length < 3) return
    setSaving(true)
    try {
      const cx = pendingLocPoints.reduce((s, p) => s + p.x, 0) / pendingLocPoints.length
      const cy = pendingLocPoints.reduce((s, p) => s + p.y, 0) / pendingLocPoints.length
      const cz = pendingLocPoints.reduce((s, p) => s + p.z, 0) / pendingLocPoints.length
      const res = await createLocalizationAnchor(testId, panelId, {
        pos_x: parseFloat(cx.toFixed(6)),
        pos_y: parseFloat(cy.toFixed(6)),
        pos_z: parseFloat(cz.toFixed(6)),
        size: 1, color_r: 255, color_g: 255, color_b: 255,
        ...locForm,
      })
      const anchorId = res.data.id
      for (let i = 0; i < pendingLocPoints.length; i++) {
        const pt = pendingLocPoints[i]
        await createLocalizationPoint(testId, panelId, anchorId, { x: pt.x, y: pt.y, z: pt.z, order: i })
      }
      cancelPlacement()
      setLocForm({ title: '', text: '' })
      setLocStep('drawing')
      loadAnchors()
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAnchor(type, id) {
    if (!window.confirm('Delete this anchor?')) return
    if (type === 'mcq') await deleteMCQAnchor(testId, panelId, id)
    else if (type === 'wc') await deleteWordCompletionAnchor(testId, panelId, id)
    else if (type === 'loc') await deleteLocalizationAnchor(testId, panelId, id)
    loadAnchors()
  }

  function updateMCQOption(oi, val) {
    const opts = [...mcqForm.options]
    opts[oi] = val
    setMCQForm(f => ({ ...f, options: opts }))
  }

  function handleDrawerResizeDrag(e) {
    e.preventDefault()
    const startX = e.clientX
    const startW = drawerWidth
    function onMove(ev) {
      const delta = startX - ev.clientX
      setDrawerWidth(Math.min(600, Math.max(220, startW + delta)))
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  if (loading) {
    return (
      <div className="vrpe-page">
        <div className="vrpe-loading">
          <div className="vrpe-spinner" />
          <span className="vrpe-loading-label">Loading scene…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="vrpe-page">

      {/* ── Fullscreen viewer ── */}
      <div className="vrpe-viewer">
        {sceneUrl ? (
          <VRViewer
            src={sceneUrl}
            hotspots={hotspots}
            polygonAnchors={polygonAnchors}
            editMode={editMode || moving}
            onSceneClick={handleSceneClick}
          />
        ) : (
          <div className="vrpe-no-scene">
            <div className="vrpe-no-scene-inner">
              <span className="vrpe-no-scene-title">No 360° scene selected</span>
              <button className="vrpe-no-scene-btn" onClick={() => setSceneModal(true)}>
                Select Scene
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Top bar ── */}
      <div className="vrpe-topbar">
        <button className="vrpe-back-btn" onClick={goBack}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <span className="vrpe-panel-title">{panelTitle}</span>

        <div className="vrpe-topbar-right">
          {sceneUrl && <span className="vrpe-scene-status">360° active</span>}
          <button className="vrpe-scene-btn" onClick={() => setSceneModal(true)} disabled={saving}>
            {sceneUrl ? 'Change Scene' : 'Select Scene'}
          </button>
          {allCount > 0 && (
            <button
              className={`vrpe-anchors-toggle${anchorDrawer ? ' vrpe-anchors-toggle--on' : ''}`}
              onClick={() => setAnchorDrawer(o => !o)}
            >
              Anchors ({allCount})
            </button>
          )}
        </div>
      </div>

      {/* ── Bottom placement controls ── */}
      {sceneUrl && (
        <div className="vrpe-bottom-controls">
          {moving ? (
            <>
              <button className="vrpe-place-btn vrpe-place-btn--on" onClick={() => setMoving(false)}>
                Cancel move
              </button>
              <span className="vrpe-place-hint">Click in the scene to set the new position</span>
            </>
          ) : (
            <>
              <button
                className={`vrpe-place-btn${editMode ? ' vrpe-place-btn--on' : ''}`}
                onClick={() => { if (editMode) { setEditMode(false); cancelPlacement() } else setEditMode(true) }}
              >
                {editMode ? 'Exit placement mode' : '+ Place anchor'}
              </button>
              {editMode && !pendingCoords && placing !== 'loc' && (
                <span className="vrpe-place-hint">Click anywhere in the scene to drop an anchor</span>
              )}
              {placing === 'loc' && locStep === 'drawing' && (
                <span className="vrpe-place-hint">
                  {pendingLocPoints.length < 3
                    ? `${pendingLocPoints.length}/3 vertices — click to add more`
                    : `${pendingLocPoints.length} vertices — click "Set polygon →" to continue`}
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Placement form ── */}
      {(pendingCoords || placing === 'loc') && (
        <div className="vrpe-placement-panel">
          <div className="vrpe-placement-header">
            <span className="vrpe-placement-coords">
              {placing === 'loc' && locStep === 'drawing'
                ? `Draw polygon — ${pendingLocPoints.length} vert${pendingLocPoints.length !== 1 ? 'ices' : 'ex'}`
                : placing === 'loc' && locStep === 'filling'
                  ? 'Localization anchor details'
                  : `Anchor at (${Math.round(pendingCoords.lon)}°, ${Math.round(pendingCoords.lat)}°)`}
            </span>
            <button className="vrpe-cancel-btn" onClick={cancelPlacement}>Cancel</button>
          </div>

          {!placing && (
            <div className="vrpe-type-row">
              <span className="vrpe-type-label">Type:</span>
              <button className="tb-q-type-btn" onClick={() => setPlacing('mcq')}>Multiple Choice</button>
              <button className="tb-q-type-btn" onClick={() => setPlacing('wc')}>Word Completion</button>
              <button className="tb-q-type-btn" onClick={() => {
                setPlacing('loc')
                if (pendingCoords) {
                  setPendingLocPoints([pendingCoords])
                  setPendingCoords(null)
                }
              }}>Localization</button>
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
                classroomId={classroomId}
                onBlur={html => setMCQForm(f => ({ ...f, text: html }))}
                placeholder="Question text…"
              />
              <div className="tb-mcq-options" style={{ marginTop: 8 }}>
                {mcqForm.options.map((opt, oi) => (
                  <label key={oi} className={`tb-mcq-option ${mcqForm.correct_mcq_index === oi ? 'tb-mcq-option--correct' : ''}`}>
                    <input type="radio" name="vrpe-mcq-correct" checked={mcqForm.correct_mcq_index === oi} onChange={() => setMCQForm(f => ({ ...f, correct_mcq_index: oi }))} />
                    <input className="tb-option-input" type="text" value={opt} onChange={e => updateMCQOption(oi, e.target.value)} placeholder={`Option ${oi + 1}…`} />
                    {mcqForm.options.length > 2 && (
                      <button type="button" className="tb-opt-del" onClick={() => setMCQForm(f => ({ ...f, options: f.options.filter((_, i) => i !== oi) }))}>×</button>
                    )}
                  </label>
                ))}
                <button className="tb-add-option-btn" onClick={() => setMCQForm(f => ({ ...f, options: [...f.options, ''] }))}>+ Add option</button>
              </div>
              <div className="tb-add-q-actions" style={{ marginTop: 8 }}>
                <button className="tb-add-q-cancel" onClick={() => setPlacing(null)}>Back</button>
                <button className="tb-add-q-confirm" onClick={handleAddMCQ} disabled={!mcqForm.text.trim() || saving}>Add Anchor</button>
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
                classroomId={classroomId}
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
                <button className="tb-add-q-cancel" onClick={() => setPlacing(null)}>Back</button>
                <button className="tb-add-q-confirm" onClick={handleAddWC} disabled={!wcForm.text.trim() || !wcForm.correct_word.trim() || saving}>Add Anchor</button>
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
                  <button
                    className="vrpe-loc-undo-btn"
                    onClick={() => setPendingLocPoints(pts => pts.slice(0, -1))}
                  >
                    Undo
                  </button>
                )}
              </div>
              <div className="tb-add-q-actions" style={{ marginTop: 4 }}>
                <button className="tb-add-q-cancel" onClick={cancelPlacement}>Cancel</button>
                <button
                  className="tb-add-q-confirm"
                  onClick={() => setLocStep('filling')}
                  disabled={pendingLocPoints.length < 3}
                >
                  Set polygon →
                </button>
              </div>
            </div>
          )}

          {placing === 'loc' && locStep === 'filling' && (
            <div>
              <button
                className="vrpe-loc-back-btn"
                onClick={() => setLocStep('drawing')}
              >
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
                classroomId={classroomId}
                onBlur={html => setLocForm(f => ({ ...f, text: html }))}
                placeholder="What should the student locate?…"
              />
              <div className="tb-add-q-actions" style={{ marginTop: 8 }}>
                <button className="tb-add-q-cancel" onClick={cancelPlacement}>Cancel</button>
                <button
                  className="tb-add-q-confirm"
                  onClick={handleAddLoc}
                  disabled={!locForm.text.trim() || saving}
                >
                  {saving ? 'Saving…' : 'Add Anchor'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Anchor drawer ── */}
      {anchorDrawer && (
        <div className="vrpe-anchor-drawer" style={{ width: drawerWidth }}>
          <div className="vrpe-drawer-resize-handle" onMouseDown={handleDrawerResizeDrag} />
          {selectedAnchor ? (
            /* ── Edit form ── */
            <>
              <div className="vrpe-edit-header">
                <button className="vrpe-edit-back" onClick={closeEdit}>
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
                value={editForm.text || ''}
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

              <div className="vrpe-edit-actions">
                <button
                  className="vrpe-edit-move-btn"
                  onClick={() => setMoving(true)}
                  disabled={moving || saving}
                >
                  {moving ? 'Click in scene…' : 'Move position'}
                </button>
                <button
                  className="vrpe-anchor-del vrpe-edit-del-btn"
                  onClick={() => { handleDeleteAnchor(selectedAnchor.type, selectedAnchor.data.id); closeEdit() }}
                >
                  Delete
                </button>
              </div>

              <button
                className="tb-add-q-confirm vrpe-edit-save-btn"
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </>
          ) : (
            /* ── Anchor list ── */
            <>
              <div className="vrpe-drawer-title">Placed Anchors ({allCount})</div>

              {allCount === 0 && (
                <div className="vrpe-drawer-empty">No anchors yet.</div>
              )}

              {mcqAnchors.map(a => (
                <div key={a.id} className="vrpe-anchor-item vrpe-anchor-item--clickable" onClick={() => openEdit('mcq', a)}>
                  <span className="vrpe-anchor-badge">MCQ</span>
                  <div className="vrpe-anchor-info">
                    {a.title && <span className="vrpe-anchor-title">{a.title}</span>}
                    <span className="vrpe-anchor-text">{a.text || '(no text)'}</span>
                  </div>
                  <button className="vrpe-anchor-del" onClick={e => { e.stopPropagation(); handleDeleteAnchor('mcq', a.id) }} title="Delete">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              ))}

              {wcAnchors.map(a => (
                <div key={a.id} className="vrpe-anchor-item vrpe-anchor-item--clickable" onClick={() => openEdit('wc', a)}>
                  <span className="vrpe-anchor-badge">WC</span>
                  <div className="vrpe-anchor-info">
                    {a.title && <span className="vrpe-anchor-title">{a.title}</span>}
                    <span className="vrpe-anchor-text">{a.text || '(no text)'}</span>
                  </div>
                  <button className="vrpe-anchor-del" onClick={e => { e.stopPropagation(); handleDeleteAnchor('wc', a.id) }} title="Delete">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              ))}

              {locAnchors.map(a => (
                <div key={a.id} className="vrpe-anchor-item vrpe-anchor-item--clickable" onClick={() => openEdit('loc', a)}>
                  <span className="vrpe-anchor-badge">LOC</span>
                  <div className="vrpe-anchor-info">
                    {a.title && <span className="vrpe-anchor-title">{a.title}</span>}
                    <span className="vrpe-anchor-text">{a.text || '(no text)'}</span>
                  </div>
                  <button className="vrpe-anchor-del" onClick={e => { e.stopPropagation(); handleDeleteAnchor('loc', a.id) }} title="Delete">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Scene picker modal ── */}
      {sceneModal && (
        <MediaInsertModal
          initialMode="image"
          imageOnly
          classroomId={classroomId}
          onInsert={handleSceneSelect}
          onClose={() => setSceneModal(false)}
        />
      )}
    </div>
  )
}
