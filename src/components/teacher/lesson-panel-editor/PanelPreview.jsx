import { useMemo, useEffect, useCallback, useRef } from 'react'
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

// ── HTML URL compression (GCS signed URLs are very long) ──────────────────────

function compressHtml(html) {
  if (!html) return html
  return html.replace(/src="(https?:\/\/storage\.googleapis\.com[^"]+)"/g, (_, url) => {
    const name = url.split('?')[0].split('/').pop()
    return `src="${name}"`
  })
}

function expandHtml(compressed, original) {
  if (!compressed || !original) return compressed
  const urlMap = {}
  const re = /src="(https?:\/\/storage\.googleapis\.com[^"]+)"/g
  let m
  while ((m = re.exec(original)) !== null) {
    const url = m[1]
    const name = url.split('?')[0].split('/').pop()
    urlMap[name] = url
  }
  return compressed.replace(/src="([^":/][^"]*?)"/g, (match, name) =>
    urlMap[name] ? `src="${urlMap[name]}"` : match
  )
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
        id: `nav-${a.id}`, lon, lat, label: a.title || `→ Panel #${a.target_panel}`,
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
      const body = panel.text_content?.body ?? ''
      editorRef.current.innerHTML = body || '<p></p>'

      // Auto-focus and place cursor when content is effectively empty
      const isEmpty = !body || body === '<p></p>' || body === '<p> </p>'
      if (isEmpty) {
        editorRef.current.focus()
        const p = editorRef.current.querySelector('p')
        const target = p ?? editorRef.current
        const range = document.createRange()
        const sel = window.getSelection()
        range.setStart(target, 0)
        range.collapse(true)
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    }
  }, [panel?.id, editMode])

  const imgSelectedRef = useRef(null)

  // Report active tags to parent (drawer displays them)
  useEffect(() => {
    if (!editMode || showHtml) {
      imgSelectedRef.current = null
      onTagsChange?.([])
      return
    }

    const handle = () => {
      if (!editorRef.current) return
      const tags = getActiveTags(editorRef.current)
      if (tags.length > 0) {
        imgSelectedRef.current = null
        onTagsChange?.(tags)
      } else if (!imgSelectedRef.current) {
        onTagsChange?.([])
      }
      // if imgSelectedRef is set and tags is empty: click was outside editor (e.g. drawer) — keep img selected
    }

    document.addEventListener('selectionchange', handle)
    return () => {
      document.removeEventListener('selectionchange', handle)
      imgSelectedRef.current = null
      onTagsChange?.([])
    }
  }, [editMode, showHtml])

  const handleEditorClick = useCallback(e => {
    const tag = e.target.tagName
    if (tag === 'IMG' || tag === 'VIDEO') {
      imgSelectedRef.current = e.target
      onTagsChange?.([{ tagName: tag.toLowerCase(), element: e.target }])
    } else {
      imgSelectedRef.current = null
      // selectionchange will handle updating text tags
    }
  }, [onTagsChange])

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
              value={compressHtml(liveBody ?? savedBody)}
              onChange={e => onBodyChange?.(expandHtml(e.target.value, liveBody ?? savedBody))}
              spellCheck={false}
            />
          )}
          <div
            ref={editorRef}
            className={`lpe-text-body lpe-text-body--editable${showHtml ? ' lpe-text-body--hidden' : ''}`}
            contentEditable={!showHtml}
            suppressContentEditableWarning
            onInput={e => onBodyChange?.(e.currentTarget.innerHTML)}
            onClick={handleEditorClick}
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
