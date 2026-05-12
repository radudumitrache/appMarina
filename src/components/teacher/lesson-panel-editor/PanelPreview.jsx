import { useMemo } from 'react'
import { EditorContent } from '@tiptap/react'
import VRViewer from '../../shared/VRViewer'
import VRAnchorPanel from '../../shared/VRAnchorPanel'
import { resolveSceneUrl } from '../../shared/VRSceneRenderer'

function posToLonLat(x, y, z) {
  const r = Math.sqrt(x * x + y * y + z * z)
  if (r === 0) return { lon: 0, lat: 0 }
  return {
    lat: Math.asin(y / r) * (180 / Math.PI),
    lon: Math.atan2(z, x) * (180 / Math.PI),
  }
}

export default function PanelPreview({
  panel, editor, editMode,
  showHtml, rawHtml, onRawHtmlChange, drawerWidth,
  placementMode, onSceneClick, pendingPlacement, pendingPolyPoints,
  activePolyPoints, activeTextAnchor, onAnchorClick, onEditModeAnchorClick, onCloseAnchorPanel,
  onAnchorDrag,
}) {
  const sceneSrc = useMemo(() => {
    if (!panel?.vr_tour?.scene_url) return null
    return resolveSceneUrl(panel.vr_tour.scene_url)
  }, [panel])

  const hotspots = useMemo(() => {
    if (!panel?.vr_tour) return []
    const drag = editMode && onAnchorDrag ? (x, y, z) => onAnchorDrag(x, y, z) : undefined
    const text = (panel.vr_tour.text_anchors ?? []).map(a => {
      const { lon, lat } = posToLonLat(a.pos_x, a.pos_y, a.pos_z)
      return {
        id: `text-${a.id}`, lon, lat, label: a.title,
        className: 'vr-hotspot--anchor',
        onClick: editMode
          ? (e) => onEditModeAnchorClick(a, 'text', e.clientX, e.clientY)
          : () => onAnchorClick({ type: 'text', label: a.title, description: a.description }),
        onDrag: drag,
      }
    })
    const nav = (panel.vr_tour.navigator_anchors ?? []).map(a => {
      const { lon, lat } = posToLonLat(a.pos_x, a.pos_y, a.pos_z)
      return {
        id: `nav-${a.id}`, lon, lat, label: a.title || `→ Panel #${a.target_panel}`,
        className: 'vr-hotspot--anchor',
        onClick: editMode ? (e) => onEditModeAnchorClick(a, 'nav', e.clientX, e.clientY) : null,
        onDrag: drag,
      }
    })
    const pending = pendingPlacement ? [{
      id: '__pending__', lon: pendingPlacement.lon, lat: pendingPlacement.lat,
      label: '', className: 'vr-hotspot--pending', onClick: null, onDrag: drag,
    }] : []
    const polyPts = (pendingPolyPoints ?? []).map((pt, i) => ({
      id: `__poly_pt_${i}__`, lon: pt.lon, lat: pt.lat,
      label: String(i + 1), className: 'vr-hotspot--poly-pt', onClick: null,
    }))
    return [...text, ...nav, ...pending, ...polyPts, ...(activePolyPoints ?? [])]
  }, [panel, editMode, onAnchorClick, onEditModeAnchorClick, pendingPlacement, pendingPolyPoints, activePolyPoints])

  if (!panel) return null

  const polygonAnchors = useMemo(() =>
    (panel?.vr_tour?.polygon_anchors ?? []).map(pa => ({
      ...pa,
      onClick: editMode
        ? (_pa, clientX, clientY) => onEditModeAnchorClick(pa, 'poly', clientX ?? 0, clientY ?? 0)
        : () => onAnchorClick({ type: 'waypoint', label: pa.title, description: pa.content, status: 'active', category: 'Polygon Region' }),
    }))
  , [panel, editMode, onAnchorClick, onEditModeAnchorClick])

  if (panel.type === 'vr_tour') {
    return (
      <div className="lpe-vr-wrap">
        <VRViewer src={sceneSrc} hotspots={hotspots} polygonAnchors={polygonAnchors} editMode={editMode} onSceneClick={placementMode ? onSceneClick : undefined} />
        <div className="lpe-vr-label"><span className="lpe-vr-tag">360°</span>{panel.title}</div>
        <div className="lpe-vr-hint">Drag to look around · Scroll to zoom</div>
        <VRAnchorPanel anchor={activeTextAnchor} onClose={onCloseAnchorPanel} />
      </div>
    )
  }

  if (showHtml) {
    return (
      <div className="lpe-text-wrap lpe-text-wrap--html" style={{ right: drawerWidth || 0 }}>
        <textarea
          className="lpe-html-code-view"
          value={rawHtml}
          onChange={e => onRawHtmlChange(e.target.value)}
          spellCheck={false}
          autoFocus
        />
      </div>
    )
  }

  return (
    <div className={`lpe-text-wrap${editMode ? ' lpe-text-wrap--editing' : ''}`}>
      <main className="lpe-text-main">
        <h1 className="lpe-text-heading">{panel.title}</h1>
        {editor
          ? <EditorContent editor={editor} />
          : <div className="lpe-text-body" dangerouslySetInnerHTML={{ __html: panel.text_content?.body ?? '' }} />
        }
      </main>
    </div>
  )
}
