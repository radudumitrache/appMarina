import { useState, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { usePanelEditor }  from '../../components/teacher/lesson-panel-editor/usePanelEditor'
import { usePlacement }    from '../../components/teacher/lesson-panel-editor/usePlacement'
import PanelPreview        from '../../components/teacher/lesson-panel-editor/PanelPreview'
import AnchorContextMenu   from '../../components/teacher/lesson-panel-editor/AnchorContextMenu'
import TopBar              from '../../components/teacher/lesson-panel-editor/TopBar'
import FloatActions        from '../../components/teacher/lesson-panel-editor/FloatActions'
import AddPanelMenu        from '../../components/teacher/lesson-panel-editor/AddPanelMenu'
import PanelStrip          from '../../components/teacher/lesson-panel-editor/PanelStrip'
import DeleteDialog        from '../../components/teacher/lesson-panel-editor/DeleteDialog'
import EditDrawer          from '../../components/teacher/lesson-panel-editor/EditDrawer'
import PlacementHint       from '../../components/teacher/lesson-panel-editor/PlacementHint'
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

  const editorRef                     = useRef(null)
  const [liveBody,    setLiveBody]    = useState(null)
  const [showHtml,    setShowHtml]    = useState(false)
  const [activeTags,  setActiveTags]  = useState([])

  const handleToggleHtml = () => {
    const el = editorRef.current
    if (!showHtml) {
      if (el) el.contentEditable = 'false'
      setShowHtml(true)
    } else {
      if (el) {
        el.innerHTML       = liveBody ?? panel?.text_content?.body ?? ''
        el.contentEditable = 'true'
      }
      setShowHtml(false)
    }
  }

  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setLiveBody(null)
    setShowHtml(false)
    setActiveTags([])
    if (editorRef.current) editorRef.current.contentEditable = 'true'
  }

  const {
    anchorMenu, setAnchorMenu,
    focusAnchor,
    placementMode,
    newAnchorPlacement, setNewAnchorPlacement,
    polyPoints, setPolyPoints,
    newPolyPlacement, setNewPolyPlacement,
    newPolyPoint, setNewPolyPoint,
    activePolyPoints, setActivePolyPoints,
    handleSceneClick,
    handleEnterPlacement,
    handleFinishPolygon,
    handleCancelPolyPlacement,
    handleCancelPlacement,
    handleAnchorEdit,
  } = usePlacement(setDrawerOpen)

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
          showHtml={showHtml}
          liveBody={liveBody}
          editorRef={editorRef}
          onBodyChange={setLiveBody}
          onTagsChange={setActiveTags}
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
        <PanelStrip panels={panels} panelIdx={panelIdx} onSelect={setPanelIdx} />
      )}

      {drawerOpen && panel && (
        <EditDrawer
          key={panel.id}
          panel={panel}
          editorRef={editorRef}
          liveBody={liveBody}
          showHtml={showHtml}
          onToggleHtml={handleToggleHtml}
          activeTags={activeTags}
          onSave={handleSavePanel}
          onClose={handleCloseDrawer}
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
          onActivePolyPointsChange={pts => setActivePolyPoints(pts ?? null)}
        />
      )}

      {placementMode && (
        <PlacementHint
          placementMode={placementMode}
          polyPoints={polyPoints}
          onUndo={() => setPolyPoints(prev => prev.slice(0, -1))}
          onFinish={handleFinishPolygon}
          onCancelPoly={handleCancelPolyPlacement}
          onCancelSimple={handleCancelPlacement}
        />
      )}

      {anchorMenu && (
        <AnchorContextMenu
          anchor={anchorMenu.anchor}
          anchorType={anchorMenu.anchorType}
          x={anchorMenu.x}
          y={anchorMenu.y}
          onEdit={handleAnchorEdit}
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
