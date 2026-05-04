import { useMemo, useEffect } from 'react'
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

// ── Tag detection ─────────────────────────────────────────────────────────────

const DETECT_TAGS = new Set(['H1', 'H2', 'H3', 'STRONG', 'EM', 'UL', 'OL', 'LI'])

export function getActiveTags(editorEl) {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return []
  const range = sel.getRangeAt(0)
  if (!editorEl.contains(range.commonAncestorContainer)) return []

  let node = range.commonAncestorContainer
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement

  const tags = []
  while (node && node !== editorEl) {
    if (node.nodeType === Node.ELEMENT_NODE && DETECT_TAGS.has(node.tagName)) {
      tags.push({ tagName: node.tagName.toLowerCase(), element: node })
    }
    node = node.parentElement
  }
  return tags
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PanelPreview({
  panel, editMode, showHtml, liveBody, editorRef, onBodyChange, onTagsChange,
  placementMode, onSceneClick, pendingPlacement, pendingPolyPoints,
  activePolyPoints, activeTextAnchor, onAnchorClick, onEditModeAnchorClick, onCloseAnchorPanel,
}) {
  const sceneSrc = useMemo(() => {
    if (!panel?.vr_tour?.scene_url) return null
    return resolveSceneUrl(panel.vr_tour.scene_url)
  }, [panel])

  const hotspots = useMemo(() => {
    if (!panel?.vr_tour) return []
    const text = (panel.vr_tour.text_anchors ?? []).map(a => {
      const { lon, lat } = posToLonLat(a.pos_x, a.pos_y, a.pos_z)
      return {
        id: `text-${a.id}`, lon, lat, label: a.title,
        className: 'vr-hotspot--anchor',
        onClick: editMode
          ? (e) => onEditModeAnchorClick(a, 'text', e.clientX, e.clientY)
          : () => onAnchorClick({ type: 'text', label: a.title, description: a.description }),
      }
    })
    const nav = (panel.vr_tour.navigator_anchors ?? []).map(a => {
      const { lon, lat } = posToLonLat(a.pos_x, a.pos_y, a.pos_z)
      return {
        id: `nav-${a.id}`, lon, lat, label: `→ Tour #${a.target_vr_tour}`,
        className: 'vr-hotspot--anchor',
        onClick: editMode ? (e) => onEditModeAnchorClick(a, 'nav', e.clientX, e.clientY) : null,
      }
    })
    const pending = pendingPlacement ? [{
      id: '__pending__', lon: pendingPlacement.lon, lat: pendingPlacement.lat,
      label: '', className: 'vr-hotspot--pending', onClick: null,
    }] : []
    const polyPts = (pendingPolyPoints ?? []).map((pt, i) => ({
      id: `__poly_pt_${i}__`, lon: pt.lon, lat: pt.lat,
      label: String(i + 1), className: 'vr-hotspot--poly-pt', onClick: null,
    }))
    return [...text, ...nav, ...pending, ...polyPts, ...(activePolyPoints ?? [])]
  }, [panel, editMode, onAnchorClick, onEditModeAnchorClick, pendingPlacement, pendingPolyPoints, activePolyPoints])

  // Reset editable content when the panel changes or edit mode opens
  useEffect(() => {
    if (editorRef?.current && editMode && panel?.type === 'text') {
      editorRef.current.innerHTML = panel.text_content?.body ?? ''
    }
  }, [panel?.id, editMode])

  // Report active tags to parent (drawer displays them)
  useEffect(() => {
    if (!editMode || showHtml) { onTagsChange?.([]); return }

    const handle = () => {
      if (!editorRef.current) return
      onTagsChange?.(getActiveTags(editorRef.current))
    }

    document.addEventListener('selectionchange', handle)
    return () => { document.removeEventListener('selectionchange', handle); onTagsChange?.([]) }
  }, [editMode, showHtml])

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

  const savedBody = panel.text_content?.body ?? ''

  return (
    <div className="lpe-text-wrap">
      <main className="lpe-text-main">
        <h1 className="lpe-text-heading">{panel.title}</h1>

        {editMode ? (<>
          {showHtml && (
            <textarea
              className="lpe-html-code-view"
              value={liveBody ?? savedBody}
              onChange={e => onBodyChange?.(e.target.value)}
              spellCheck={false}
            />
          )}
          <div
            ref={editorRef}
            className={`lpe-text-body lpe-text-body--editable${showHtml ? ' lpe-text-body--hidden' : ''}`}
            contentEditable={!showHtml}
            suppressContentEditableWarning
            onInput={e => onBodyChange?.(e.currentTarget.innerHTML)}
          />
        </>) : (
          <div
            className="lpe-text-body"
            dangerouslySetInnerHTML={{ __html: savedBody }}
          />
        )}
      </main>
    </div>
  )
}
