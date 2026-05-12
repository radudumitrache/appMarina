import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEditor }          from '@tiptap/react'
import StarterKit              from '@tiptap/starter-kit'
import { usePanelEditor }     from '../../components/teacher/lesson-panel-editor/usePanelEditor'
import { usePlacement }       from '../../components/teacher/lesson-panel-editor/usePlacement'
import PanelPreview           from '../../components/teacher/lesson-panel-editor/PanelPreview'
import AnchorContextMenu      from '../../components/teacher/lesson-panel-editor/AnchorContextMenu'
import TopBar                 from '../../components/teacher/lesson-panel-editor/TopBar'
import FloatActions           from '../../components/teacher/lesson-panel-editor/FloatActions'
import AddPanelMenu           from '../../components/teacher/lesson-panel-editor/AddPanelMenu'
import PanelStrip             from '../../components/teacher/lesson-panel-editor/PanelStrip'
import DeleteDialog           from '../../components/teacher/lesson-panel-editor/DeleteDialog'
import EditDrawer             from '../../components/teacher/lesson-panel-editor/EditDrawer'
import PlacementHint          from '../../components/teacher/lesson-panel-editor/PlacementHint'
import '../css/teacher/LessonPanelEditor.css'

export default function LessonPanelEditor() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { state } = useLocation()

  const backPath    = state?.backPath ?? '/teacher/builder'
  const classroomId = state?.classroomId ?? null

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

  const [draggedAnchorPos, setDraggedAnchorPos] = useState(null)
  const [showHtml,         setShowHtml]         = useState(false)
  const [rawHtml,          setRawHtml]          = useState('')
  const [drawerWidth,      setDrawerWidth]      = useState(380)

  // Editor lives here so it persists across drawer open/close
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editable: false,
    editorProps: {
      attributes: { class: 'lpe-text-body lpe-text-body--editable' },
    },
  })

  // Load content when the active panel changes; also exit HTML mode
  useEffect(() => {
    if (!editor || !panel) return
    setShowHtml(false)
    editor.commands.setContent(
      panel.type === 'text' ? (panel.text_content?.body ?? '<p></p>') : '',
      false
    )
  }, [panel?.id, editor])

  // Enable editing only while the drawer is open on a text panel and not in HTML mode
  useEffect(() => {
    if (!editor || !panel) return
    editor.setEditable(drawerOpen && panel.type === 'text' && !showHtml)
  }, [drawerOpen, panel?.type, editor, showHtml])

  const handleToggleHtml = () => {
    if (!showHtml) {
      setRawHtml(editor?.getHTML() ?? '')
      setShowHtml(true)
    } else {
      editor?.commands.setContent(rawHtml, false)
      setShowHtml(false)
    }
  }

  const handleCloseDrawer = () => {
    // Exit HTML mode and discard changes
    if (showHtml) setShowHtml(false)
    setDrawerOpen(false)
    if (editor && panel?.type === 'text') {
      editor.commands.setContent(panel.text_content?.body ?? '<p></p>', false)
    }
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
          <button className="lpe-state-btn" onClick={() => navigate(backPath)}>Back to Builder</button>
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
          editor={editor}
          editMode={drawerOpen}
          showHtml={showHtml}
          rawHtml={rawHtml}
          onRawHtmlChange={setRawHtml}
          drawerWidth={drawerOpen ? drawerWidth : 0}
          placementMode={placementMode}
          onSceneClick={handleSceneClick}
          pendingPlacement={newAnchorPlacement}
          pendingPolyPoints={polyPoints}
          activePolyPoints={activePolyPoints}
          activeTextAnchor={activeTextAnchor}
          onAnchorClick={setActiveTextAnchor}
          onEditModeAnchorClick={(anchor, anchorType, x, y) => setAnchorMenu({ anchor, anchorType, x, y })}
          onCloseAnchorPanel={() => setActiveTextAnchor(null)}
          onAnchorDrag={(x, y, z) => setDraggedAnchorPos({ x, y, z, ts: Date.now() })}
        />
      )}

      <TopBar
        lessonTitle={lesson?.title}
        lessonId={id}
        panelCount={panels.length}
        panelIdx={panelIdx}
        onChangePanelIdx={setPanelIdx}
        onBack={() => navigate(backPath)}
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
          editor={editor}
          showHtml={showHtml}
          rawHtml={rawHtml}
          onRawHtmlChange={setRawHtml}
          onToggleHtml={handleToggleHtml}
          onDrawerWidthChange={setDrawerWidth}
          onSave={handleSavePanel}
          onClose={handleCloseDrawer}
          saving={saving}
          lessonId={id}
          classroomId={classroomId}
          panels={panels}
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
          draggedAnchorPos={draggedAnchorPos}
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
