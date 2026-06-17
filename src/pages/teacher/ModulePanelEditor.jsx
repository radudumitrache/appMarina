import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEditor }          from '@tiptap/react'
import StarterKit              from '@tiptap/starter-kit'
import Image                   from '@tiptap/extension-image'
import Video                   from '../../components/teacher/module-panel-editor/VideoExtension'
import { usePanelEditor }     from '../../components/teacher/module-panel-editor/usePanelEditor'
import { usePlacement }       from '../../components/teacher/module-panel-editor/usePlacement'
import PanelPreview           from '../../components/teacher/module-panel-editor/PanelPreview'
import AnchorContextMenu      from '../../components/teacher/module-panel-editor/AnchorContextMenu'
import TopBar                 from '../../components/teacher/module-panel-editor/TopBar'
import FloatActions           from '../../components/teacher/module-panel-editor/FloatActions'
import AddPanelMenu           from '../../components/teacher/module-panel-editor/AddPanelMenu'
import PanelStrip             from '../../components/teacher/module-panel-editor/PanelStrip'
import DeleteDialog           from '../../components/teacher/module-panel-editor/DeleteDialog'
import EditDrawer             from '../../components/teacher/module-panel-editor/EditDrawer'
import PlacementHint          from '../../components/teacher/module-panel-editor/PlacementHint'
import '../css/teacher/ModulePanelEditor.css'

export default function ModulePanelEditor() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { state, pathname } = useLocation()

  const isAdminContext = pathname.startsWith('/admin')
  const backPath  = state?.backPath  ?? (isAdminContext ? '/admin/courses' : '/teacher/builder')
  const backLabel = state?.backLabel ?? (isAdminContext ? 'Courses' : 'Builder')

  const {
    module, panels, panelIdx, setPanelIdx,
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
  } = usePanelEditor(id, state?.module)

  // Prefer departmentId from router state; fall back to the module's own department_id
  // (covers navigation paths that don't pass departmentId in state, e.g. admin view)
  const departmentId    = state?.departmentId    ?? module?.department_id    ?? null
  const departmentName  = state?.departmentName  ?? module?.department_name  ?? null
  const departmentCode  = state?.departmentCode  ?? module?.department_code  ?? null
  const departmentLabel = departmentName
    ? (departmentCode ? `${departmentName} (${departmentCode})` : departmentName)
    : null

const [lookDir,          setLookDir]          = useState({ lon: 0, lat: 0 })
  const [draggedAnchorPos, setDraggedAnchorPos] = useState(null)
  const getCamDirRef = useRef(null)
  const [showHtml,         setShowHtml]         = useState(false)
  const [rawHtml,          setRawHtml]          = useState('')
  const [drawerWidth,      setDrawerWidth]      = useState(380)

  // Editor lives here so it persists across drawer open/close
  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: false, allowBase64: false }), Video],
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
          initialLon={lookDir.lon}
          initialLat={lookDir.lat}
          onViewerReady={(fn) => { getCamDirRef.current = fn }}
          onNavAnchorClick={(anchor) => {
            const idx = panels.findIndex(p => p.id === anchor.target_panel)
            if (idx !== -1) { setLookDir({ lon: anchor.target_lon ?? 0, lat: anchor.target_lat ?? 0 }); setPanelIdx(idx) }
          }}
        />
      )}

      <TopBar
        moduleTitle={module?.title}
        moduleId={id}
        panelCount={panels.length}
        panelIdx={panelIdx}
        onChangePanelIdx={(i) => { setLookDir({ lon: 0, lat: 0 }); setPanelIdx(i) }}
        onBack={() => navigate(backPath)}
        backLabel={backLabel}
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
        <PanelStrip panels={panels} panelIdx={panelIdx} onSelect={(i) => { setLookDir({ lon: 0, lat: 0 }); setPanelIdx(i) }} />
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
          moduleId={id}
          departmentId={departmentId}
          departmentLabel={departmentLabel}
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
          getViewerCameraDir={() => getCamDirRef.current?.()}
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
