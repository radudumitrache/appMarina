import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import VRViewer from '../../components/shared/VRViewer'
import MediaInsertModal from '../../components/trainer/module-panel-editor/MediaInsertModal'
import VRTopBar from '../../components/trainer/vr-panel-editor/VRTopBar'
import VRBottomControls from '../../components/trainer/vr-panel-editor/VRBottomControls'
import VRPlacementPanel from '../../components/trainer/vr-panel-editor/VRPlacementPanel'
import VRAnchorDrawer from '../../components/trainer/vr-panel-editor/VRAnchorDrawer'
import {
  getTest, updateTestPanel,
  createMCQAnchor, updateMCQAnchor, deleteMCQAnchor,
  createWordCompletionAnchor, updateWordCompletionAnchor, deleteWordCompletionAnchor,
  createLocalizationAnchor, updateLocalizationAnchor, deleteLocalizationAnchor,
  createLocalizationPoint,
} from '../../api/tests'
import '../../components/css/trainer/test-builder/AddQuestionPanel.css'
import '../../components/css/trainer/test-builder/QuestionCard.css'
import '../../components/css/trainer/test-builder/QuestionHtmlEditor.css'
import '../../components/css/trainer/test-builder/TestMetaRow.css'
import '../../components/css/trainer/test-builder/PanelSection.css'
import '../css/trainer/VRPanelEditor.css'

// â”€â”€ Coordinate helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function VRPanelEditor() {
  const { testId, panelId } = useParams()
  const navigate             = useNavigate()
  const { state }            = useLocation()

  const departmentId = state?.departmentId ?? null

  const [vr,            setVR]            = useState(state?.vr ?? null)
  const [panelTitle,    setPanelTitle]    = useState(state?.panelTitle ?? '')
  const [loading,       setLoading]       = useState(!state?.vr)
  const [sceneApplying, setSceneApplying] = useState(false)
  const [sceneError,    setSceneError]    = useState(null)
  const [editMode,      setEditMode]      = useState(false)
  const [sceneModal,    setSceneModal]    = useState(false)
  const [anchorDrawer,  setAnchorDrawer]  = useState(false)
  const [pendingCoords,    setPendingCoords]    = useState(null)
  const [pendingLocPoints, setPendingLocPoints] = useState([])
  const [placing,          setPlacing]          = useState(null)
  const [locStep,          setLocStep]          = useState('drawing')
  const [saving,       setSaving]       = useState(false)
  const [selectedAnchor, setSelectedAnchor] = useState(null)
  const [moving,         setMoving]         = useState(false)

  const loadPanel = useCallback(() => {
    return getTest(testId).then(res => {
      const panel = res.data.panels?.find(p => p.id === Number(panelId))
      if (panel) { setVR(panel.vr_exercise); setPanelTitle(panel.title) }
    }).finally(() => setLoading(false))
  }, [testId, panelId])

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
    ...(pendingCoords ? [{ id: 'pending', lon: pendingCoords.lon, lat: pendingCoords.lat, className: 'vr-hotspot--pending' }] : []),
    ...pendingLocPoints.map((pt, i) => ({ id: `pending-loc-${i}`, lon: pt.lon, lat: pt.lat, className: 'vr-hotspot--pending' })),
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
  }

  function closeEdit() {
    setSelectedAnchor(null)
    setMoving(false)
  }

  function cancelPlacement() {
    setPendingCoords(null)
    setPendingLocPoints([])
    setPlacing(null)
    setLocStep('drawing')
  }

  function handleSetPlacing(type) {
    if (type === 'loc' && pendingCoords) {
      setPendingLocPoints([pendingCoords])
      setPendingCoords(null)
    }
    setPlacing(type)
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

  async function handleSceneSelect(url) {
    setSceneModal(false)
    setSceneApplying(true)
    setSceneError(null)
    try {
      await updateTestPanel(testId, panelId, { scene_url: url })
      await loadPanel()
    } catch {
      setSceneError('Failed to apply the scene. Please try again.')
    } finally {
      setSceneApplying(false)
    }
  }

  async function handleAddMCQ(form) {
    setSaving(true)
    try {
      await createMCQAnchor(testId, panelId, {
        pos_x: pendingCoords.x, pos_y: pendingCoords.y, pos_z: pendingCoords.z,
        size: 1, color_r: 255, color_g: 255, color_b: 255,
        title: form.title, text: form.text,
        correct_mcq_indices: form.correct_mcq_indices ?? [],
        options: form.options.map((text, i) => ({ text, order: i })),
      })
      cancelPlacement()
      loadAnchors()
    } finally {
      setSaving(false)
    }
  }

  async function handleAddWC(form) {
    setSaving(true)
    try {
      await createWordCompletionAnchor(testId, panelId, {
        pos_x: pendingCoords.x, pos_y: pendingCoords.y, pos_z: pendingCoords.z,
        size: 1, color_r: 255, color_g: 255, color_b: 255,
        ...form,
      })
      cancelPlacement()
      loadAnchors()
    } finally {
      setSaving(false)
    }
  }

  async function handleAddLoc(form) {
    if (pendingLocPoints.length < 3) return
    setSaving(true)
    try {
      const cx = pendingLocPoints.reduce((s, p) => s + p.x, 0) / pendingLocPoints.length
      const cy = pendingLocPoints.reduce((s, p) => s + p.y, 0) / pendingLocPoints.length
      const cz = pendingLocPoints.reduce((s, p) => s + p.z, 0) / pendingLocPoints.length
      const res = await createLocalizationAnchor(testId, panelId, {
        pos_x: parseFloat(cx.toFixed(6)), pos_y: parseFloat(cy.toFixed(6)), pos_z: parseFloat(cz.toFixed(6)),
        size: 1, color_r: 255, color_g: 255, color_b: 255, ...form,
      })
      for (let i = 0; i < pendingLocPoints.length; i++) {
        const pt = pendingLocPoints[i]
        await createLocalizationPoint(testId, panelId, res.data.id, { x: pt.x, y: pt.y, z: pt.z, order: i })
      }
      cancelPlacement()
      setLocStep('drawing')
      loadAnchors()
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit(type, id, form) {
    setSaving(true)
    try {
      if (type === 'mcq') {
        await updateMCQAnchor(testId, panelId, id, {
          title: form.title, text: form.text,
          correct_mcq_indices: form.correct_mcq_indices ?? [],
          options: form.options.map((text, i) => ({ text, order: i })),
        })
      } else if (type === 'wc') {
        await updateWordCompletionAnchor(testId, panelId, id, { title: form.title, text: form.text, correct_word: form.correct_word })
      } else if (type === 'loc') {
        await updateLocalizationAnchor(testId, panelId, id, { title: form.title, text: form.text })
      }
      closeEdit()
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

  return (
    <div className="vrpe-page">

      <div className="vrpe-viewer">
        {loading || sceneApplying ? (
          <div className="vrpe-loading">
            <div className="vrpe-spinner" />
            <span className="vrpe-loading-label">
              {sceneApplying ? 'Applying sceneâ€¦' : ''}
            </span>
          </div>
        ) : sceneUrl ? (
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
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginBottom: 16 }}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className="vrpe-no-scene-title">No 360&deg; scene selected</span>
              {sceneError ? (
                <span className="vrpe-no-scene-error">{sceneError}</span>
              ) : (
                <span className="vrpe-no-scene-hint">Choose an equirectangular image to start building this panel.</span>
              )}
              <button className="vrpe-no-scene-btn" onClick={() => { setSceneError(null); setSceneModal(true) }}>
                {sceneError ? 'Try Again' : 'Select Scene'}
              </button>
            </div>
          </div>
        )}
      </div>

      <VRTopBar
        panelTitle={panelTitle}
        sceneUrl={sceneUrl}
        allCount={allCount}
        anchorDrawer={anchorDrawer}
        saving={saving}
        onBack={() => navigate(-1)}
        onOpenSceneModal={() => setSceneModal(true)}
        onToggleDrawer={() => setAnchorDrawer(o => !o)}
      />

      {sceneUrl && (
        <VRBottomControls
          moving={moving}
          editMode={editMode}
          pendingCoords={pendingCoords}
          placing={placing}
          locStep={locStep}
          pendingLocPoints={pendingLocPoints}
          onCancelMove={() => setMoving(false)}
          onToggleEditMode={() => { if (editMode) { setEditMode(false); cancelPlacement() } else setEditMode(true) }}
        />
      )}

      {(pendingCoords || placing === 'loc') && (
        <VRPlacementPanel
          pendingCoords={pendingCoords}
          placing={placing}
          locStep={locStep}
          pendingLocPoints={pendingLocPoints}
          saving={saving}
          departmentId={departmentId}
          onSetPlacing={handleSetPlacing}
          onSetLocStep={setLocStep}
          onCancel={cancelPlacement}
          onUndoLocPoint={() => setPendingLocPoints(pts => pts.slice(0, -1))}
          onAddMCQ={handleAddMCQ}
          onAddWC={handleAddWC}
          onAddLoc={handleAddLoc}
        />
      )}

      {anchorDrawer && (
        <VRAnchorDrawer
          mcqAnchors={mcqAnchors}
          wcAnchors={wcAnchors}
          locAnchors={locAnchors}
          allCount={allCount}
          selectedAnchor={selectedAnchor}
          moving={moving}
          saving={saving}
          departmentId={departmentId}
          testId={testId}
          panelId={panelId}
          onOpenEdit={openEdit}
          onCloseEdit={closeEdit}
          onSaveEdit={handleSaveEdit}
          onDeleteAnchor={handleDeleteAnchor}
          onSetMoving={setMoving}
        />
      )}

      {sceneModal && (
        <MediaInsertModal
          initialMode="image"
          imageOnly
          vrScene
          departmentId={departmentId}
          onInsert={handleSceneSelect}
          onClose={() => setSceneModal(false)}
        />
      )}
    </div>
  )
}
