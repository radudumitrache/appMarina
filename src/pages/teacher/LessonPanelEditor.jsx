import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { usePanelEditor }  from '../../components/teacher/lesson-panel-editor/usePanelEditor'
import PanelPreview        from '../../components/teacher/lesson-panel-editor/PanelPreview'
import AnchorContextMenu   from '../../components/teacher/lesson-panel-editor/AnchorContextMenu'
import TopBar              from '../../components/teacher/lesson-panel-editor/TopBar'
import FloatActions        from '../../components/teacher/lesson-panel-editor/FloatActions'
import AddPanelMenu        from '../../components/teacher/lesson-panel-editor/AddPanelMenu'
import PanelStrip          from '../../components/teacher/lesson-panel-editor/PanelStrip'
import DeleteDialog        from '../../components/teacher/lesson-panel-editor/DeleteDialog'
import EditDrawer          from '../../components/teacher/lesson-panel-editor/EditDrawer'
import '../css/teacher/LessonPanelEditor.css'

export default function LessonPanelEditor() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { state } = useLocation()

  const {
    lesson, panels, panelIdx, setPanelIdx,
    loading, saving,
    error, setError,
    drawerOpen, setDrawerOpen,
    deleteTarget, setDeleteTarget,
    addMenuOpen, setAddMenuOpen,
    activeTextAnchor, setActiveTextAnchor,
    panel,
    handleAnchorsChange,
    handleAddPanel,
    handleSavePanel,
    handleDeletePanel,
    handleMove,
    handleQuickDeleteAnchor,
  } = usePanelEditor(id, state?.lesson)

  const [anchorMenu,         setAnchorMenu]         = useState(null)  // { anchor, anchorType, x, y }
  const [focusAnchor,        setFocusAnchor]        = useState(null)  // { anchor, type, ts }
  const [placementMode,      setPlacementMode]      = useState(null)  // 'text'|'nav'|'poly'|'poly_pt'|'poly_pt_move'|null
  const [placementContext,   setPlacementContext]   = useState(null)  // extra data for poly_pt modes
  const [newAnchorPlacement, setNewAnchorPlacement] = useState(null)  // { type, x, y, z, ts }
  const [polyPoints,         setPolyPoints]         = useState([])    // in-progress polygon vertices
  const [newPolyPlacement,   setNewPolyPlacement]   = useState(null)  // completed polygon for AnchorSection
  const [newPolyPoint,       setNewPolyPoint]       = useState(null)  // single point for poly_pt / poly_pt_move
  const [activePolyPoints,   setActivePolyPoints]   = useState([])   // edit-mode hotspots for open polygon

  function handleSceneClick(lon, lat) {
    if (!placementMode) return
    const lonR = lon * Math.PI / 180
    const latR = lat * Math.PI / 180
    const r = 500
    const x = parseFloat((r * Math.cos(latR) * Math.cos(lonR)).toFixed(2))
    const y = parseFloat((r * Math.sin(latR)).toFixed(2))
    const z = parseFloat((r * Math.cos(latR) * Math.sin(lonR)).toFixed(2))

    if (placementMode === 'poly') {
      setPolyPoints(prev => [...prev, { lon, lat, x, y, z, order: prev.length }])
      return  // stay in poly placement mode for more clicks
    }

    if (placementMode === 'poly_pt' || placementMode === 'poly_pt_move') {
      setNewPolyPoint({ lon, lat, x, y, z, ...placementContext, ts: Date.now() })
      setPlacementMode(null)
      setPlacementContext(null)
      return
    }

    setNewAnchorPlacement({ type: placementMode, lon, lat, x, y, z, ts: Date.now() })
    setPlacementMode(null)
  }

  function handleEnterPlacement(type, context = null) {
    setPlacementMode(type)
    setPlacementContext(context)
  }

  function handleFinishPolygon() {
    if (polyPoints.length < 3) return
    if (!drawerOpen) setDrawerOpen(true)
    setNewPolyPlacement({ points: polyPoints, ts: Date.now() })
    setPolyPoints([])
    setPlacementMode(null)
  }

  function handleCancelPolyPlacement() {
    setPolyPoints([])
    setPlacementMode(null)
    setPlacementContext(null)
  }

  /* ── Loading / error gates ────────────────────────────────────────────── */
  if (loading) {
    return <div className="lpe-page"><div className="lpe-loading"><div className="lpe-spinner" /></div></div>
  }

  if (error && panels.length === 0) {
    return (
      <div className="lpe-page">
        <div className="lpe-state">
          <span>{error}</span>
          <button className="lpe-state-btn" onClick={() => navigate('/teacher/builder')}>Back to Builder</button>
        </div>
      </div>
    )
  }
  return (
    <div
      className={`lpe-page${activeTextAnchor ? ' lpe-page--panel-open' : ''}`}
      onClick={() => addMenuOpen && setAddMenuOpen(false)}
    >
      {panels.length === 0 ? (
        <div className="lpe-state"><span>No panels yet. Add a panel below.</span></div>
      ) : (
        <PanelPreview
          panel={panel}
          editMode={drawerOpen}
          placementMode={placementMode}
          onSceneClick={handleSceneClick}
          pendingPlacement={newAnchorPlacement}
          pendingPolyPoints={polyPoints}
          activePolyPoints={activePolyPoints}
          activeTextAnchor={activeTextAnchor}
          onAnchorClick={setActiveTextAnchor}
          onEditModeAnchorClick={(anchor, anchorType, x, y) => setAnchorMenu({ anchor, anchorType, x, y })}
          onCloseAnchorPanel={() => setActiveTextAnchor(null)}
        />
      )}

      <TopBar
        lessonTitle={lesson?.title}
        lessonId={id}
        panelCount={panels.length}
        panelIdx={panelIdx}
        onChangePanelIdx={setPanelIdx}
        onBack={() => navigate('/teacher/builder')}
      />

      {panel && (
        <FloatActions
          onEdit={() => setDrawerOpen(o => !o)}
          onMoveUp={() => handleMove(-1)}
          onMoveDown={() => handleMove(1)}
          onDelete={() => setDeleteTarget(panel.id)}
          panelIdx={panelIdx}
          panelCount={panels.length}
          saving={saving}
        />
      )}

      <AddPanelMenu
        addMenuOpen={addMenuOpen}
        onToggle={() => setAddMenuOpen(o => !o)}
        onAdd={handleAddPanel}
        saving={saving}
      />

      {panels.length > 0 && (
        <PanelStrip
          panels={panels}
          panelIdx={panelIdx}
          onSelect={setPanelIdx}
        />
      )}

      {drawerOpen && panel && (
        <EditDrawer
          key={panel.id}
          panel={panel}
          onSave={handleSavePanel}
          onClose={() => setDrawerOpen(false)}
          saving={saving}
          lessonId={id}
          onAnchorsChange={handleAnchorsChange}
          focusAnchor={focusAnchor}
          onEnterPlacement={handleEnterPlacement}
          newAnchorPlacement={newAnchorPlacement}
          onNewAnchorSaved={() => setNewAnchorPlacement(null)}
          newPolyPlacement={newPolyPlacement}
          onNewPolySaved={() => setNewPolyPlacement(null)}
          newPolyPoint={newPolyPoint}
          onNewPolyPointSaved={() => setNewPolyPoint(null)}
          onActivePolyPointsChange={pts => setActivePolyPoints(pts ?? [])}
        />
      )}

      {placementMode && (
        <div className="lpe-placement-hint">
          {placementMode === 'poly' ? (
            <>
              <span>
                {polyPoints.length === 0
                  ? 'Click on the scene to place polygon vertices'
                  : `${polyPoints.length} ${polyPoints.length === 1 ? 'vertex' : 'vertices'} — click to add more`}
              </span>
              {polyPoints.length > 0 && (
                <button className="lpe-placement-undo" onClick={() => setPolyPoints(prev => prev.slice(0, -1))}>
                  Undo
                </button>
              )}
              <button
                className="lpe-placement-finish"
                onClick={handleFinishPolygon}
                disabled={polyPoints.length < 3}
              >
                Finish{polyPoints.length >= 3 ? ` (${polyPoints.length})` : ''}
              </button>
              <button className="lpe-placement-cancel" onClick={handleCancelPolyPlacement}>Cancel</button>
            </>
          ) : (
            <>
              <span>Click on the scene to place the {
                placementMode === 'text'         ? 'text anchor' :
                placementMode === 'nav'          ? 'navigator anchor' :
                placementMode === 'poly_pt'      ? 'new point' :
                placementMode === 'poly_pt_move' ? 'point (new position)' : 'anchor'
              }</span>
              <button className="lpe-placement-cancel" onClick={() => { setPlacementMode(null); setPlacementContext(null) }}>Cancel</button>
            </>
          )}
        </div>
      )}

      {anchorMenu && (
        <AnchorContextMenu
          anchor={anchorMenu.anchor}
          anchorType={anchorMenu.anchorType}
          x={anchorMenu.x}
          y={anchorMenu.y}
          onEdit={() => {
            const { anchor, anchorType } = anchorMenu
            setAnchorMenu(null)
            setDrawerOpen(true)
            setFocusAnchor({ anchor, type: anchorType, ts: Date.now() })
          }}
          onDelete={() => { handleQuickDeleteAnchor(anchorMenu.anchorType, anchorMenu.anchor.id); setAnchorMenu(null) }}
          onClose={() => setAnchorMenu(null)}
        />
      )}

      {error && panels.length > 0 && (
        <div className="lpe-toast" onClick={() => setError(null)}>{error}</div>
      )}

      {deleteTarget && (
        <DeleteDialog
          onConfirm={() => handleDeletePanel(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
