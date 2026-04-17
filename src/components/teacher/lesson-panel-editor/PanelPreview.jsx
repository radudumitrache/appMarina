import { useMemo } from 'react'
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

/* ── PanelPreview ───────────────────────────────────────────────────────────
 * Renders the main content area for the active panel:
 *   - VR panels → VRViewer with derived hotspots + VRAnchorPanel side-sheet
 *   - Text panels → heading + body
 *
 * Props:
 *   panel               {object}
 *   activeTextAnchor    {object|null}
 *   onAnchorClick       {Function}  called with anchor detail object
 *   onCloseAnchorPanel  {Function}
 */
export default function PanelPreview({ panel, editMode, placementMode, onSceneClick, pendingPlacement, pendingPolyPoints, activePolyPoints, activeTextAnchor, onAnchorClick, onEditModeAnchorClick, onCloseAnchorPanel }) {
  const sceneSrc = useMemo(() => {
    if (!panel?.vr_tour?.scene_url) return null
    return resolveSceneUrl(panel.vr_tour.scene_url)
  }, [panel])

  const hotspots = useMemo(() => {
    if (!panel?.vr_tour) return []
    const text = (panel.vr_tour.text_anchors ?? []).map(a => {
      const { lon, lat } = posToLonLat(a.pos_x, a.pos_y, a.pos_z)
      return {
        id:        `text-${a.id}`,
        lon, lat,
        label:     a.title,
        className: 'vr-hotspot--anchor',
        onClick:   editMode
          ? (e) => onEditModeAnchorClick(a, 'text', e.clientX, e.clientY)
          : ()  => onAnchorClick({ type: 'waypoint', label: a.title, description: a.description, status: 'active', category: 'Text Anchor' }),
      }
    })
    const nav = (panel.vr_tour.navigator_anchors ?? []).map(a => {
      const { lon, lat } = posToLonLat(a.pos_x, a.pos_y, a.pos_z)
      return {
        id:        `nav-${a.id}`,
        lon, lat,
        label:     `→ Tour #${a.target_vr_tour}`,
        className: 'vr-hotspot--anchor',
        onClick:   editMode
          ? (e) => onEditModeAnchorClick(a, 'nav', e.clientX, e.clientY)
          : null,
      }
    })
    const pending = pendingPlacement
      ? [{
          id:        '__pending__',
          lon:       pendingPlacement.lon,
          lat:       pendingPlacement.lat,
          label:     '',
          className: 'vr-hotspot--pending',
          onClick:   null,
        }]
      : []

    const polyPts = (pendingPolyPoints ?? []).map((pt, i) => ({
      id:        `__poly_pt_${i}__`,
      lon:       pt.lon,
      lat:       pt.lat,
      label:     String(i + 1),
      className: 'vr-hotspot--poly-pt',
      onClick:   null,
    }))

    return [...text, ...nav, ...pending, ...polyPts, ...(activePolyPoints ?? [])]
  }, [panel, editMode, onAnchorClick, onEditModeAnchorClick, pendingPlacement, pendingPolyPoints, activePolyPoints])

  if (!panel) return null

  const polygonAnchors = useMemo(() =>
    (panel?.vr_tour?.polygon_anchors ?? []).map(pa => ({
      ...pa,
      onClick: editMode
        ? (e) => onEditModeAnchorClick(pa, 'poly', e?.clientX ?? 0, e?.clientY ?? 0)
        : () => onAnchorClick({ type: 'waypoint', label: pa.title, description: pa.content, status: 'active', category: 'Polygon Region' }),
    }))
  , [panel, editMode, onAnchorClick, onEditModeAnchorClick])

  if (panel.type === 'vr_tour') {
    return (
      <div className="lpe-vr-wrap">
        <VRViewer src={sceneSrc} hotspots={hotspots} polygonAnchors={polygonAnchors} editMode={editMode} onSceneClick={placementMode ? onSceneClick : undefined} />
        <div className="lpe-vr-label">
          <span className="lpe-vr-tag">360°</span>
          {panel.title}
        </div>
        <div className="lpe-vr-hint">Drag to look around · Scroll to zoom</div>
        <VRAnchorPanel anchor={activeTextAnchor} onClose={onCloseAnchorPanel} />
      </div>
    )
  }

  return (
    <div className="lpe-text-wrap">
      <main className="lpe-text-main">
        <h1 className="lpe-text-heading">{panel.title}</h1>
        <div className="lpe-text-body">{panel.text_content?.body ?? ''}</div>
      </main>
    </div>
  )
}
