import { useState, useEffect, useRef, useMemo } from 'react'
import {
  listTextAnchors,
  createTextAnchor,
  updateTextAnchor,
  deleteTextAnchor,
  createNavigatorAnchor,
  updateNavigatorAnchor,
  deleteNavigatorAnchor,
  createPolygonAnchor,
  updatePolygonAnchor,
  deletePolygonAnchor,
  createPolygonPoint,
  updatePolygonPoint,
  deletePolygonPoint,
} from '../../../api/lessons'
import { IconEdit, IconTrash, IconPlus, IconPin, IconCompass, IconPolygon, IconCrosshair, IconChevronUp, IconChevronDown } from './LPEIcons'
import InlineStyleEditor from './InlineStyleEditor'

function IconChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}
function IconArrowLeft() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  )
}

/* ── Anchor description rich-text editor ───────────────────────────────── */
const DESC_TAG_LABELS = {
  h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3',
  p: 'Paragraph', strong: 'Bold', b: 'Bold',
  em: 'Italic', i: 'Italic',
  ul: 'Bullet List', ol: 'Numbered List', li: 'List Item',
  a: 'Link', img: 'Image', video: 'Video', hr: 'Divider',
  span: 'Span', div: 'Block',
}

const DESC_TAGS = [
  { label: 'H1',    cmd: 'formatBlock', arg: 'h1',              desc: 'Large heading' },
  { label: 'H2',    cmd: 'formatBlock', arg: 'h2',              desc: 'Section heading' },
  { label: 'H3',    cmd: 'formatBlock', arg: 'h3',              desc: 'Sub-heading' },
  { label: 'P',     cmd: 'formatBlock', arg: 'p',               desc: 'Paragraph' },
  { label: 'B',     cmd: 'bold',                                 desc: 'Bold' },
  { label: 'I',     cmd: 'italic',                               desc: 'Italic' },
  { label: 'UL',    cmd: 'insertUnorderedList',                  desc: 'Bullet list' },
  { label: 'HR',    cmd: 'insertHorizontalRule',                 desc: 'Divider' },
  { label: 'IMG',   img:   true,                                 desc: 'Image' },
  { label: 'VIDEO', video: true,                                 desc: 'Video' },
]

function AnchorDescEditor({ initialHtml, onChange, editorKey }) {
  const editorRef      = useRef(null)
  const [showHtml,     setShowHtml]     = useState(false)
  const [rawHtml,      setRawHtml]      = useState('')
  const [activeTags,   setActiveTags]   = useState([])
  const [activeTagIdx, setActiveTagIdx] = useState(0)

  // Tracks the previous showHtml value so the sync-back effect only fires
  // when actually leaving HTML mode (true → false), not on mount or anchor switch.
  const prevShowHtmlRef = useRef(false)

  // Reset when anchor changes
  useEffect(() => {
    prevShowHtmlRef.current = false  // don't treat anchor switch as "leaving HTML mode"
    if (editorRef.current) editorRef.current.innerHTML = initialHtml || ''
    setShowHtml(false)
    setActiveTags([])
    setActiveTagIdx(0)
  // editorKey is the reset signal; intentionally not including initialHtml
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorKey])

  // Track cursor position → active element stack
  useEffect(() => {
    function onSelectionChange() {
      if (!editorRef.current) return
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) { setActiveTags([]); return }
      // Only track when focus is inside our editor
      if (!editorRef.current.contains(sel.getRangeAt(0).startContainer)) return
      let node = sel.getRangeAt(0).startContainer
      if (node.nodeType === 3) node = node.parentNode
      const tags = []
      while (node && node !== editorRef.current) {
        if (node.nodeType === 1) tags.unshift({ tagName: node.tagName, element: node })
        node = node.parentNode
      }
      setActiveTags(tags)
      setActiveTagIdx(0)
    }
    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [])

  function fireInput() {
    editorRef.current?.dispatchEvent(new Event('input', { bubbles: true }))
  }

  function applyTag(tag) {
    const el = editorRef.current
    if (!el) return
    el.focus()

    if (tag.img) {
      const src = window.prompt('Image URL:')
      if (!src) return
      const alt = window.prompt('Alt text (optional):') ?? ''
      document.execCommand('insertHTML', false, `<img src="${src}" alt="${alt}" style="max-width:100%">`)
      fireInput(); return
    }

    if (tag.video) {
      const src = window.prompt('Video URL:')
      if (!src) return
      document.execCommand('insertHTML', false,
        `<video src="${src}" controls style="max-width:100%;border-radius:6px"></video>`)
      fireInput(); return
    }

    const sel = window.getSelection()
    const hasSelection = sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed
    if (hasSelection && tag.cmd === 'formatBlock') {
      const range = sel.getRangeAt(0)
      const fragment = range.extractContents()
      const wrapper = document.createElement(tag.arg)
      wrapper.appendChild(fragment)
      range.insertNode(wrapper)
      sel.collapse(wrapper, wrapper.childNodes.length)
    } else {
      document.execCommand(tag.cmd, false, tag.arg ?? null)
    }
    fireInput()
  }

  function handleToggleHtml() {
    if (!showHtml) {
      setRawHtml(editorRef.current?.innerHTML ?? '')
      setShowHtml(true)
    } else {
      setShowHtml(false)
      // editorRef.current is null here because the div is unmounted while
      // the textarea is visible — the useEffect below syncs rawHtml in after remount
    }
  }

  // Sync rawHtml into the contenteditable after it remounts when leaving HTML view.
  // Guard with prevShowHtmlRef so this only fires on true→false transitions,
  // not on mount or when an anchor switch resets showHtml to false.
  const rawHtmlRef = useRef(rawHtml)
  rawHtmlRef.current = rawHtml
  useEffect(() => {
    if (prevShowHtmlRef.current && !showHtml && editorRef.current) {
      editorRef.current.innerHTML = rawHtmlRef.current
      onChange(rawHtmlRef.current)
    }
    prevShowHtmlRef.current = showHtml
  // showHtml is the only trigger; rawHtmlRef/prevShowHtmlRef are refs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHtml])

  function removeTag(element) {
    const parent = element.parentNode
    if (!parent) return
    while (element.firstChild) parent.insertBefore(element.firstChild, element)
    parent.removeChild(element)
    fireInput()
    setActiveTags([])
  }

  return (
    <div className="lpe-anchor-desc-editor">
      {/* Tag toolbar + HTML toggle */}
      <div className="lpe-anchor-desc-toolbar">
        <div className="lpe-tag-list lpe-tag-list--compact">
          {DESC_TAGS.map(tag => (
            <button
              key={tag.label}
              className="lpe-tag-item"
              onMouseDown={e => e.preventDefault()}
              onClick={() => applyTag(tag)}
              disabled={showHtml}
              title={tag.desc}
            >
              <span className="lpe-tag-item-label">{tag.label}</span>
              <span className="lpe-tag-item-desc">{tag.desc}</span>
            </button>
          ))}
        </div>
        <button
          className={`lpe-html-toggle${showHtml ? ' lpe-html-toggle--active' : ''}`}
          onClick={handleToggleHtml}
          title={showHtml ? 'Back to visual' : 'Edit raw HTML'}
        >{'</>'}</button>
      </div>

      {/* Active element inspector */}
      {activeTags.length > 0 && !showHtml && (
        <div className="lpe-anchor-desc-inspector">
          <div className="lpe-active-tag-chips">
            {activeTags.map((t, i) => (
              <button
                key={i}
                className={`lpe-active-tag-chip${activeTagIdx === i ? ' lpe-active-tag-chip--on' : ''}`}
                onClick={() => setActiveTagIdx(i)}
                onMouseDown={e => e.preventDefault()}
              >
                <span className="lpe-active-tag-chip-name">
                  {DESC_TAG_LABELS[t.tagName.toLowerCase()] ?? t.tagName}
                </span>
                <span
                  className="lpe-active-tag-chip-remove"
                  role="button"
                  tabIndex={-1}
                  onMouseDown={e => { e.stopPropagation(); e.preventDefault() }}
                  onClick={e => { e.stopPropagation(); removeTag(t.element) }}
                >×</span>
              </button>
            ))}
          </div>
          {activeTags[activeTagIdx] && (
            <InlineStyleEditor
              key={`${activeTagIdx}-${activeTags[activeTagIdx]?.tagName}`}
              element={activeTags[activeTagIdx].element}
              editorEl={editorRef.current}
            />
          )}
        </div>
      )}

      {/* Content area */}
      {showHtml ? (
        <textarea
          className="lpe-textarea lpe-anchor-desc-html"
          value={rawHtml}
          onChange={e => { setRawHtml(e.target.value); onChange(e.target.value) }}
        />
      ) : (
        <div
          ref={editorRef}
          className="lpe-anchor-desc-content"
          contentEditable
          suppressContentEditableWarning
          onInput={e => onChange(e.currentTarget.innerHTML)}
          data-placeholder="Description…"
        />
      )}
    </div>
  )
}

function posToLonLat(x, y, z) {
  const r = Math.sqrt(x * x + y * y + z * z)
  if (r === 0) return { lon: 0, lat: 0 }
  return {
    lat: Math.asin(y / r) * (180 / Math.PI),
    lon: Math.atan2(z, x) * (180 / Math.PI),
  }
}

/* ── AnchorSection ──────────────────────────────────────────────────────────
 * Manages text, navigator, and polygon anchors for a single VR panel.
 * Rendered inside EditDrawer when the panel type is 'vr_tour'.
 *
 * Props:
 *   lessonId            {string}
 *   panelId             {number}
 *   initialTextAnchors  {Array}
 *   initialNavAnchors   {Array}
 *   initialPolyAnchors  {Array}
 *   onAnchorsChange     {Function}  called with (textAnchors, navAnchors, polyAnchors)
 */
export default function AnchorSection({
  lessonId,
  panelId,
  initialTextAnchors,
  initialNavAnchors,
  initialPolyAnchors,
  onAnchorsChange,
  focusAnchor,         // { anchor, type, ts } — opens edit form for an existing anchor
  onEnterPlacement,    // (type) → void — called when Add is clicked; parent enters placement mode
  newAnchorPlacement,  // { type, x, y, z, ts } — on scene click; opens new-anchor form pre-filled
  onNewAnchorSaved,    // () → void — called after a new anchor is created; clears the preview dot
  newPolyPlacement,    // { points: [{x,y,z,order},...], ts } — finished polygon vertices from scene
  onNewPolySaved,      // () → void — called after new polygon + all points are saved
  newPolyPoint,              // { x,y,z, polygonId, pointId?, ts } — single scene-placed point
  onNewPolyPointSaved,       // () → void
  onActivePolyPointsChange,  // (hotspots | null) → void — scene hotspots for editing polygon points
  onAnchorEditingChange,     // (boolean) → void — true when an anchor edit form is open
}) {
  const [textAnchors, setTextAnchors] = useState(initialTextAnchors ?? [])
  const [navAnchors,  setNavAnchors]  = useState(initialNavAnchors  ?? [])
  const [polyAnchors, setPolyAnchors] = useState(initialPolyAnchors ?? [])

  // Fetch fresh text anchor data on mount so the description field is always populated
  // (the panel list endpoint may omit description; the dedicated endpoint includes it)
  useEffect(() => {
    listTextAnchors(lessonId, panelId)
      .then(res => setTextAnchors(res.data))
      .catch(() => {})
  }, [lessonId, panelId])

  const formRef              = useRef(null)
  const polyFormRef          = useRef(null)
  const pendingPolyPointsRef = useRef([])
  const [formFocused, setFormFocused] = useState(false)
  const [openSections, setOpenSections] = useState({ text: false, nav: false, poly: false })

  // Notify parent whenever anchor arrays change (skip initial mount)
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    onAnchorsChange?.(textAnchors, navAnchors, polyAnchors)
  }, [textAnchors, navAnchors, polyAnchors])

  // Auto-open form + scroll + highlight when triggered from the context menu (existing anchor)
  useEffect(() => {
    if (!focusAnchor) return
    if (focusAnchor.type === 'poly') {
      openPolyForm(focusAnchor.anchor)
      setFormFocused(true)
      setTimeout(() => polyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 40)
    } else {
      openForm(focusAnchor.type, focusAnchor.anchor)
      setFormFocused(true)
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 40)
    }
    setTimeout(() => setFormFocused(false), 1000)
  }, [focusAnchor])

  // Open new-anchor form pre-filled with clicked panorama coordinates
  useEffect(() => {
    if (!newAnchorPlacement) return
    setForm({ type: newAnchorPlacement.type, anchor: null })
    setPosX(String(newAnchorPlacement.x))
    setPosY(String(newAnchorPlacement.y))
    setPosZ(String(newAnchorPlacement.z))
    setATitle('')
    setADesc('')
    setTargetTour('')
    setAnchorError(null)
    setFormFocused(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 40)
    setTimeout(() => setFormFocused(false), 1000)
  }, [newAnchorPlacement])

  // Open polygon form pre-filled with centroid of clicked vertices
  useEffect(() => {
    if (!newPolyPlacement) return
    const pts = newPolyPlacement.points
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length
    const cz = pts.reduce((s, p) => s + p.z, 0) / pts.length
    setPolyPosX(String(parseFloat(cx.toFixed(2))))
    setPolyPosY(String(parseFloat(cy.toFixed(2))))
    setPolyPosZ(String(parseFloat(cz.toFixed(2))))
    setPolyTitle('')
    setPolyContent('')
    setPolyError(null)
    pendingPolyPointsRef.current = pts.map((p, i) => ({ x: p.x, y: p.y, z: p.z, order: i }))
    setPolyForm({ anchor: null })
    setForm(null)
    setFormFocused(true)
    setTimeout(() => polyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 40)
    setTimeout(() => setFormFocused(false), 1000)
  }, [newPolyPlacement])

  // ── Text / Navigator form state ──────────────────────────────────────────
  const [form,    setForm]          = useState(null)  // { type:'text'|'nav', anchor: obj|null }
  const [saving,  setAnchorSaving]  = useState(false)
  const [error,   setAnchorError]   = useState(null)

  const [posX,       setPosX]       = useState('')
  const [posY,       setPosY]       = useState('')
  const [posZ,       setPosZ]       = useState('')
  const [aTitle,     setATitle]     = useState('')
  const [aDesc,      setADesc]      = useState('')
  const [targetTour, setTargetTour] = useState('')

  function openForm(type, anchor = null) {
    setForm({ type, anchor })
    setPosX(anchor?.pos_x ?? '')
    setPosY(anchor?.pos_y ?? '')
    setPosZ(anchor?.pos_z ?? '')
    setATitle(anchor?.title ?? '')
    setADesc(anchor?.description ?? '')
    setTargetTour(anchor?.target_vr_tour ?? '')
    setAnchorError(null)
  }

  function closeForm() {
    setForm(null)
    setAnchorError(null)
  }

  async function handleSave() {
    setAnchorSaving(true)
    setAnchorError(null)
    const pos = {
      pos_x: parseFloat(posX)  || 0,
      pos_y: parseFloat(posY)  || 0,
      pos_z: parseFloat(posZ)  || 0,
    }
    try {
      if (form.type === 'text') {
        const data = { ...pos, title: aTitle, description: aDesc }
        if (form.anchor) {
          const res = await updateTextAnchor(lessonId, panelId, form.anchor.id, data)
          setTextAnchors(prev => prev.map(a =>
            a.id === form.anchor.id ? { ...a, ...res.data, title: aTitle, description: aDesc, ...pos } : a
          ))
        } else {
          const res = await createTextAnchor(lessonId, panelId, data)
          setTextAnchors(prev => [...prev, { ...res.data, title: aTitle, description: aDesc, ...pos }])
          onNewAnchorSaved?.()
        }
      } else {
        const tvt = parseInt(targetTour, 10)
        if (Number.isNaN(tvt)) {
          setAnchorError('Target VR Tour must be a valid ID.')
          setAnchorSaving(false)
          return
        }
        const data = { ...pos, target_vr_tour: tvt }
        if (form.anchor) {
          const res = await updateNavigatorAnchor(lessonId, panelId, form.anchor.id, data)
          setNavAnchors(prev => prev.map(a => a.id === form.anchor.id ? res.data : a))
        } else {
          const res = await createNavigatorAnchor(lessonId, panelId, data)
          setNavAnchors(prev => [...prev, res.data])
          onNewAnchorSaved?.()
        }
      }
      closeForm()
    } catch {
      setAnchorError('Could not save anchor.')
    } finally {
      setAnchorSaving(false)
    }
  }

  async function handleDelete(type, anchorId) {
    setAnchorSaving(true)
    try {
      if (type === 'text') {
        await deleteTextAnchor(lessonId, panelId, anchorId)
        setTextAnchors(prev => prev.filter(a => a.id !== anchorId))
      } else {
        await deleteNavigatorAnchor(lessonId, panelId, anchorId)
        setNavAnchors(prev => prev.filter(a => a.id !== anchorId))
      }
    } catch {
      setAnchorError('Could not delete anchor.')
    } finally {
      setAnchorSaving(false)
    }
  }

  // Real-time hotspot preview: sync live pos values into anchor arrays
  useEffect(() => {
    if (!form?.anchor) return
    const x = parseFloat(posX), y = parseFloat(posY), z = parseFloat(posZ)
    if ([x, y, z].some(Number.isNaN)) return
    if (form.type === 'text') {
      setTextAnchors(prev => prev.map(a =>
        a.id === form.anchor.id ? { ...a, pos_x: x, pos_y: y, pos_z: z } : a
      ))
    } else {
      setNavAnchors(prev => prev.map(a =>
        a.id === form.anchor.id ? { ...a, pos_x: x, pos_y: y, pos_z: z } : a
      ))
    }
  }, [posX, posY, posZ])

  const formTitle = form
    ? (form.anchor
        ? (form.type === 'text' ? 'Edit Text Anchor' : 'Edit Navigator Anchor')
        : (form.type === 'text' ? 'New Text Anchor'  : 'New Navigator Anchor'))
    : ''

  // ── Polygon state ────────────────────────────────────────────────────────
  const [polyForm,    setPolyForm]    = useState(null)

  // Notify parent when anchor edit mode changes (must be after form + polyForm declarations)
  useEffect(() => {
    onAnchorEditingChange?.(!!form || !!polyForm)
  }, [form, polyForm])
  const [polyTitle,   setPolyTitle]   = useState('')
  const [polyContent, setPolyContent] = useState('')
  const [polyPosX,    setPolyPosX]    = useState('')
  const [polyPosY,    setPolyPosY]    = useState('')
  const [polyPosZ,    setPolyPosZ]    = useState('')
  const [polySaving,  setPolySaving]  = useState(false)
  const [polyError,   setPolyError]   = useState(null)

  // Real-time polygon hotspot preview (must be after polyPosX/Y/Z declarations)
  useEffect(() => {
    if (!polyForm?.anchor) return
    const x = parseFloat(polyPosX), y = parseFloat(polyPosY), z = parseFloat(polyPosZ)
    if ([x, y, z].some(Number.isNaN)) return
    setPolyAnchors(prev => prev.map(a =>
      a.id === polyForm.anchor.id ? { ...a, pos_x: x, pos_y: y, pos_z: z } : a
    ))
  }, [polyPosX, polyPosY, polyPosZ])

  // Scene-placed single point: add to existing polygon or reposition
  useEffect(() => {
    if (!newPolyPoint) return
    const { x, y, z, polygonId, pointId } = newPolyPoint
    if (!polyForm?.anchor || polyForm.anchor.id !== polygonId) return
    const anchorId = polyForm.anchor.id

    if (pointId) {
      // Reposition existing point
      setPtActionIds(prev => new Set([...prev, pointId]))
      setPolyError(null)
      updatePolygonPoint(lessonId, panelId, anchorId, pointId, { x, y, z })
        .then(() => {
          setPolyAnchors(prev => prev.map(pa =>
            pa.id === anchorId
              ? { ...pa, points: pa.points.map(p => p.id === pointId ? { ...p, x, y, z } : p) }
              : pa
          ))
          if (editingPoint?.id === pointId) {
            setEditPtX(String(x)); setEditPtY(String(y)); setEditPtZ(String(z))
          }
        })
        .catch(() => setPolyError('Could not reposition point.'))
        .finally(() => {
          setPtActionIds(prev => { const s = new Set(prev); s.delete(pointId); return s })
          onNewPolyPointSaved?.()
        })
    } else {
      // Add new point
      const order = polyAnchors.find(pa => pa.id === anchorId)?.points?.length ?? 0
      setPtSaving(true)
      setPolyError(null)
      createPolygonPoint(lessonId, panelId, anchorId, { x, y, z, order })
        .then(res => {
          setPolyAnchors(prev => prev.map(pa =>
            pa.id === anchorId ? { ...pa, points: [...pa.points, res.data] } : pa
          ))
        })
        .catch(() => setPolyError('Could not add point.'))
        .finally(() => { setPtSaving(false); onNewPolyPointSaved?.() })
    }
  }, [newPolyPoint])

  // ── Polygon point editing state ──────────────────────────────────────────
  const [editingPoint, setEditingPoint] = useState(null)  // point being edited in-place
  const [editPtX,      setEditPtX]      = useState('')
  const [editPtY,      setEditPtY]      = useState('')
  const [editPtZ,      setEditPtZ]      = useState('')
  const [ptSaving,     setPtSaving]     = useState(false)
  const [ptActionIds,  setPtActionIds]  = useState(() => new Set())

  // Real-time point position preview while dragging sliders (must be after editPtX/Y/Z declarations)
  useEffect(() => {
    if (!editingPoint || !polyForm?.anchor) return
    const x = parseFloat(editPtX), y = parseFloat(editPtY), z = parseFloat(editPtZ)
    if ([x, y, z].some(Number.isNaN)) return
    setPolyAnchors(prev => prev.map(pa =>
      pa.id === polyForm.anchor.id
        ? { ...pa, points: pa.points.map(p => p.id === editingPoint.id ? { ...p, x, y, z } : p) }
        : pa
    ))
  }, [editPtX, editPtY, editPtZ])

  function openPolyForm(anchor = null) {
    setPolyForm({ anchor })
    setPolyTitle(anchor?.title ?? '')
    setPolyContent(anchor?.content ?? '')
    setPolyPosX(anchor?.pos_x ?? '')
    setPolyPosY(anchor?.pos_y ?? '')
    setPolyPosZ(anchor?.pos_z ?? '')
    setPolyError(null)
    setEditingPoint(null)
    setForm(null)
  }

  function closePolyForm() {
    setPolyForm(null)
    setPolyError(null)
    setEditingPoint(null)
  }

  function openEditPoint(pt) {
    setEditingPoint(pt)
    setEditPtX(String(pt.x))
    setEditPtY(String(pt.y))
    setEditPtZ(String(pt.z))
  }

  async function handleSavePoint(pointId) {
    const x = parseFloat(editPtX), y = parseFloat(editPtY), z = parseFloat(editPtZ)
    if ([x, y, z].some(Number.isNaN)) { setPolyError('Invalid coordinates.'); return }
    setPtActionIds(prev => new Set([...prev, pointId]))
    setPolyError(null)
    try {
      await updatePolygonPoint(lessonId, panelId, polyForm.anchor.id, pointId, { x, y, z })
      setPolyAnchors(prev => prev.map(pa =>
        pa.id === polyForm.anchor.id
          ? { ...pa, points: pa.points.map(p => p.id === pointId ? { ...p, x, y, z } : p) }
          : pa
      ))
      setEditingPoint(null)
    } catch {
      setPolyError('Could not save point.')
    } finally {
      setPtActionIds(prev => { const s = new Set(prev); s.delete(pointId); return s })
    }
  }

  async function handleReorderPoint(ptId, direction) {
    const pts = [...editingPolyPoints]
    const idx = pts.findIndex(p => p.id === ptId)
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= pts.length) return
    const ptA = pts[idx], ptB = pts[targetIdx]
    const orderA = ptB.order, orderB = ptA.order
    // Optimistic update
    setPolyAnchors(prev => prev.map(pa =>
      pa.id === polyForm.anchor.id
        ? { ...pa, points: pa.points.map(p => {
            if (p.id === ptA.id) return { ...p, order: orderA }
            if (p.id === ptB.id) return { ...p, order: orderB }
            return p
          })}
        : pa
    ))
    try {
      await Promise.all([
        updatePolygonPoint(lessonId, panelId, polyForm.anchor.id, ptA.id, { order: orderA }),
        updatePolygonPoint(lessonId, panelId, polyForm.anchor.id, ptB.id, { order: orderB }),
      ])
    } catch {
      // Revert on failure
      setPolyAnchors(prev => prev.map(pa =>
        pa.id === polyForm.anchor.id
          ? { ...pa, points: pa.points.map(p => {
              if (p.id === ptA.id) return { ...p, order: ptA.order }
              if (p.id === ptB.id) return { ...p, order: ptB.order }
              return p
            })}
          : pa
      ))
      setPolyError('Could not reorder point.')
    }
  }

  async function handlePolySave() {
    setPolySaving(true)
    setPolyError(null)
    const pos = {
      pos_x: parseFloat(polyPosX) || 0,
      pos_y: parseFloat(polyPosY) || 0,
      pos_z: parseFloat(polyPosZ) || 0,
    }
    try {
      const data = { ...pos, title: polyTitle, content: polyContent }
      if (polyForm.anchor) {
        const res = await updatePolygonAnchor(lessonId, panelId, polyForm.anchor.id, data)
        const merged = { ...res.data, title: polyTitle, content: polyContent, ...pos }
        setPolyAnchors(prev => prev.map(pa => pa.id === polyForm.anchor.id ? { ...pa, ...merged } : pa))
        setPolyForm(prev => ({ ...prev, anchor: { ...prev.anchor, ...merged } }))
      } else {
        const res = await createPolygonAnchor(lessonId, panelId, data)
        const newAnchor = { ...res.data, points: [] }

        // Batch-save all vertices that were placed on the scene
        const pending = pendingPolyPointsRef.current
        if (pending.length > 0) {
          const savedPoints = []
          for (const pt of pending) {
            const ptRes = await createPolygonPoint(lessonId, panelId, newAnchor.id, pt)
            savedPoints.push(ptRes.data)
          }
          newAnchor.points = savedPoints
          pendingPolyPointsRef.current = []
        }

        setPolyAnchors(prev => [...prev, newAnchor])
        setPolyForm({ anchor: newAnchor })
        onNewPolySaved?.()
      }
    } catch {
      setPolyError('Could not save polygon anchor.')
    } finally {
      setPolySaving(false)
    }
  }

  async function handlePolyDelete(anchorId) {
    setPolySaving(true)
    try {
      await deletePolygonAnchor(lessonId, panelId, anchorId)
      setPolyAnchors(prev => prev.filter(pa => pa.id !== anchorId))
      if (polyForm?.anchor?.id === anchorId) closePolyForm()
    } catch {
      setPolyError('Could not delete polygon anchor.')
    } finally {
      setPolySaving(false)
    }
  }

  async function handleAddPoint() {
    const anchorId = polyForm.anchor.id
    const x = parseFloat(ptX), y = parseFloat(ptY), z = parseFloat(ptZ)
    const order = parseInt(ptOrder, 10)
    if ([x, y, z].some(Number.isNaN) || Number.isNaN(order)) {
      setPolyError('All point fields must be valid numbers.')
      return
    }
    setPtSaving(true)
    setPolyError(null)
    try {
      const res = await createPolygonPoint(lessonId, panelId, anchorId, { x, y, z, order })
      setPolyAnchors(prev => prev.map(pa =>
        pa.id === anchorId ? { ...pa, points: [...pa.points, res.data] } : pa
      ))
      setPointForm(false)
      setPtX(''); setPtY(''); setPtZ(''); setPtOrder('')
    } catch {
      setPolyError('Could not add point.')
    } finally {
      setPtSaving(false)
    }
  }

  async function handleDeletePoint(pointId) {
    const anchorId = polyForm.anchor.id
    setPtSaving(true)
    setPolyError(null)
    try {
      await deletePolygonPoint(lessonId, panelId, anchorId, pointId)
      setPolyAnchors(prev => prev.map(pa =>
        pa.id === anchorId ? { ...pa, points: pa.points.filter(p => p.id !== pointId) } : pa
      ))
    } catch {
      setPolyError('Could not delete point.')
    } finally {
      setPtSaving(false)
    }
  }

  const editingPolyPoints = useMemo(() => {
    if (!polyForm?.anchor) return []
    return (polyAnchors.find(pa => pa.id === polyForm.anchor.id)?.points ?? [])
      .slice().sort((a, b) => a.order - b.order)
  }, [polyAnchors, polyForm?.anchor?.id])

  // Emit scene hotspots for the currently-open polygon so the parent can highlight them
  useEffect(() => {
    if (!polyForm?.anchor) {
      onActivePolyPointsChange?.(null)
      return
    }
    const anchorId = polyForm.anchor.id
    const hotspots = editingPolyPoints.map((pt, i) => {
      const { lon, lat } = posToLonLat(pt.x, pt.y, pt.z)
      return {
        id:        `__polyedit_${pt.id}__`,
        lon, lat,
        label:     String(i + 1),
        className: 'vr-hotspot--poly-edit-pt',
        onClick:   () => {
          deletePolygonPoint(lessonId, panelId, anchorId, pt.id)
            .then(() => setPolyAnchors(prev => prev.map(pa =>
              pa.id === anchorId ? { ...pa, points: pa.points.filter(p => p.id !== pt.id) } : pa
            )))
            .catch(() => setPolyError('Could not delete point.'))
        },
      }
    })
    onActivePolyPointsChange?.(hotspots)
  }, [editingPolyPoints, polyForm?.anchor?.id])

  const isEditing = !!form || !!polyForm

  return (
    <div className="lpe-anchor-section">
      <div className="lpe-anchor-divider" />

      {/* ── Edit view: focused single-anchor form ────────────────────────── */}
      {isEditing && (
        <>
          <button className="lpe-anchor-back-btn" onClick={form ? closeForm : closePolyForm}>
            <IconArrowLeft />
            Anchors
          </button>

          {/* Text / Navigator form */}
          {form && (
            <div ref={formRef} className={`lpe-anchor-form${formFocused ? ' lpe-anchor-form--focused' : ''}`}>
              <div className="lpe-anchor-form-title">{formTitle}</div>

              <div className="lpe-pos-sliders">
                {[['X', posX, setPosX], ['Y', posY, setPosY], ['Z', posZ, setPosZ]].map(([label, val, set]) => (
                  <div key={label} className="lpe-pos-slider-row">
                    <div className="lpe-pos-slider-head">
                      <span className="lpe-anchor-pos-label">{label}</span>
                      <input
                        className="lpe-pos-value-input"
                        type="number"
                        step="0.01"
                        value={val}
                        onChange={e => set(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <input
                      type="range"
                      className="lpe-pos-slider"
                      min="-500"
                      max="500"
                      step="0.01"
                      value={parseFloat(val) || 0}
                      onChange={e => set(e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {form.type === 'text' && (
                <>
                  <div className="lpe-field">
                    <label className="lpe-label">Title</label>
                    <input className="lpe-input" value={aTitle} onChange={e => setATitle(e.target.value)} placeholder="Anchor title…" />
                  </div>
                  <div className="lpe-field">
                    <label className="lpe-label">Description</label>
                    <AnchorDescEditor
                      editorKey={form.anchor?.id ?? 'new'}
                      initialHtml={aDesc}
                      onChange={setADesc}
                    />
                  </div>
                </>
              )}

              {form.type === 'nav' && (
                <div className="lpe-field">
                  <label className="lpe-label">Target VR Tour ID</label>
                  <input className="lpe-input lpe-input--mono" type="number" step="1" value={targetTour} onChange={e => setTargetTour(e.target.value)} placeholder="e.g. 7" />
                </div>
              )}

              {error && <p className="lpe-anchor-form-error">{error}</p>}

              <div className="lpe-anchor-form-footer">
                <button className="lpe-anchor-save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : form.anchor ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {/* Polygon form */}
          {polyForm && (
            <div ref={polyFormRef} className={`lpe-anchor-form lpe-anchor-form--poly${formFocused ? ' lpe-anchor-form--focused' : ''}`}>
              <div className="lpe-anchor-form-title">
                {polyForm.anchor ? 'Edit Polygon Anchor' : 'New Polygon Anchor'}
              </div>
              {!polyForm.anchor && pendingPolyPointsRef.current.length > 0 && (
                <p className="lpe-anchor-empty" style={{ color: 'var(--gold)', marginBottom: 4 }}>
                  {pendingPolyPointsRef.current.length} vertices ready — add a title and save.
                </p>
              )}

              <div className="lpe-pos-sliders">
                {[['X', polyPosX, setPolyPosX], ['Y', polyPosY, setPolyPosY], ['Z', polyPosZ, setPolyPosZ]].map(([label, val, set]) => (
                  <div key={label} className="lpe-pos-slider-row">
                    <div className="lpe-pos-slider-head">
                      <span className="lpe-anchor-pos-label">{label}</span>
                      <input
                        className="lpe-pos-value-input"
                        type="number"
                        step="0.01"
                        value={val}
                        onChange={e => set(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <input
                      type="range"
                      className="lpe-pos-slider"
                      min="-500"
                      max="500"
                      step="0.01"
                      value={parseFloat(val) || 0}
                      onChange={e => set(e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="lpe-field">
                <label className="lpe-label">Title</label>
                <input className="lpe-input" value={polyTitle} onChange={e => setPolyTitle(e.target.value)} placeholder="Polygon region title…" />
              </div>

              <div className="lpe-field">
                <label className="lpe-label">Content</label>
                <AnchorDescEditor
                  editorKey={polyForm.anchor?.id ?? 'new-poly'}
                  initialHtml={polyContent}
                  onChange={setPolyContent}
                />
              </div>

              {polyError && <p className="lpe-anchor-form-error">{polyError}</p>}

              <div className="lpe-anchor-form-footer">
                <button className="lpe-anchor-save-btn" onClick={handlePolySave} disabled={polySaving}>
                  {polySaving ? 'Saving…' : polyForm.anchor ? 'Update' : 'Create & Add Points'}
                </button>
              </div>

              {/* Points sub-section — only shown after the polygon exists in the backend */}
              {polyForm.anchor && (
                <div className="lpe-poly-points">
                  <div className="lpe-anchor-group-header" style={{ marginTop: 4 }}>
                    <span className="lpe-anchor-group-label">Points ({editingPolyPoints.length})</span>
                    <button
                      className="lpe-anchor-add-btn"
                      onClick={() => onEnterPlacement?.('poly_pt', { polygonId: polyForm.anchor.id })}
                      disabled={ptSaving}
                    >
                      <IconPlus /> Add on scene
                    </button>
                  </div>

                  {editingPolyPoints.length < 3 && (
                    <p className="lpe-anchor-empty" style={{ color: 'var(--gold, #d4a017)' }}>
                      Add at least 3 points to form a polygon.
                    </p>
                  )}

                  {editingPolyPoints.map((pt, i) => (
                    <div key={pt.id} className="lpe-poly-point-item">
                      {editingPoint?.id === pt.id ? (
                        <div className="lpe-poly-point-edit">
                          <div className="lpe-poly-point-edit-header">
                            <span className="lpe-anchor-item-title--mono">Point {i + 1}</span>
                            <button
                              className="lpe-placement-undo"
                              onClick={() => onEnterPlacement?.('poly_pt_move', { polygonId: polyForm.anchor.id, pointId: pt.id })}
                              title="Click on scene to set new position"
                            >
                              <IconCrosshair /> Reposition
                            </button>
                          </div>

                          <div className="lpe-pos-sliders">
                            {[['X', editPtX, setEditPtX], ['Y', editPtY, setEditPtY], ['Z', editPtZ, setEditPtZ]].map(([label, val, set]) => (
                              <div key={label} className="lpe-pos-slider-row">
                                <div className="lpe-pos-slider-head">
                                  <span className="lpe-anchor-pos-label">{label}</span>
                                  <input className="lpe-pos-value-input" type="number" step="0.01" value={val} onChange={e => set(e.target.value)} placeholder="0.00" />
                                </div>
                                <input type="range" className="lpe-pos-slider" min="-500" max="500" step="0.01" value={parseFloat(val) || 0} onChange={e => set(e.target.value)} />
                              </div>
                            ))}
                          </div>

                          <div className="lpe-anchor-form-footer" style={{ marginTop: 8 }}>
                            <button className="lpe-anchor-save-btn" onClick={() => handleSavePoint(pt.id)} disabled={ptActionIds.has(pt.id)}>
                              {ptActionIds.has(pt.id) ? 'Saving…' : 'Save'}
                            </button>
                            <button className="lpe-anchor-cancel-btn" onClick={() => setEditingPoint(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="lpe-poly-point-row">
                          <span className="lpe-poly-point-num">{i + 1}</span>
                          <span className="lpe-anchor-pos lpe-poly-point-coords">
                            {pt.x.toFixed(1)} · {pt.y.toFixed(1)} · {pt.z.toFixed(1)}
                          </span>
                          <div className="lpe-poly-point-actions">
                            <button className="lpe-anchor-icon-btn" title="Edit position" onClick={() => openEditPoint(pt)} disabled={!!editingPoint || ptSaving}>
                              <IconEdit />
                            </button>
                            <button className="lpe-anchor-icon-btn" title="Move up" onClick={() => handleReorderPoint(pt.id, -1)} disabled={i === 0 || ptSaving}>
                              <IconChevronUp />
                            </button>
                            <button className="lpe-anchor-icon-btn" title="Move down" onClick={() => handleReorderPoint(pt.id, 1)} disabled={i === editingPolyPoints.length - 1 || ptSaving}>
                              <IconChevronDown />
                            </button>
                            <button className="lpe-anchor-icon-btn lpe-anchor-icon-btn--delete" title="Delete point" onClick={() => handleDeletePoint(pt.id)} disabled={ptActionIds.has(pt.id) || ptSaving}>
                              <IconTrash />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── List view: collapsible section dropdowns ─────────────────────── */}
      {!isEditing && (
        <>
          <div className="lpe-anchor-heading">
            <span className="lpe-label">Anchors</span>
            <span className="lpe-anchor-total">
              {textAnchors.length + navAnchors.length + polyAnchors.length}
            </span>
          </div>

          {/* Text section */}
          <div className="lpe-anchor-group">
            <div className="lpe-anchor-group-header">
              <button
                className="lpe-anchor-section-toggle"
                onClick={() => setOpenSections(prev => ({ ...prev, text: !prev.text }))}
              >
                <span className="lpe-anchor-group-label"><IconPin /> Text</span>
                <span className="lpe-anchor-count-badge">{textAnchors.length}</span>
                <span className={`lpe-anchor-chevron${openSections.text ? ' lpe-anchor-chevron--open' : ''}`}>
                  <IconChevronRight />
                </span>
              </button>
              <button
                className="lpe-anchor-add-btn"
                onClick={e => { e.stopPropagation(); onEnterPlacement?.('text') ?? openForm('text') }}
                disabled={saving}
              >
                <IconPlus /> Add
              </button>
            </div>
            {openSections.text && (
              <div className="lpe-anchor-list">
                {textAnchors.length === 0 && <p className="lpe-anchor-empty">No text anchors yet.</p>}
                {textAnchors.map(a => (
                  <div key={a.id} className="lpe-anchor-item lpe-anchor-item--clickable" onClick={() => openForm('text', a)}>
                    <span className="lpe-anchor-item-title">{a.title || <em>Untitled</em>}</span>
                    <div className="lpe-anchor-item-actions">
                      <button className="lpe-anchor-icon-btn lpe-anchor-icon-btn--delete" title="Delete" onClick={e => { e.stopPropagation(); handleDelete('text', a.id) }} disabled={saving}>
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigator section */}
          <div className="lpe-anchor-group">
            <div className="lpe-anchor-group-header">
              <button
                className="lpe-anchor-section-toggle"
                onClick={() => setOpenSections(prev => ({ ...prev, nav: !prev.nav }))}
              >
                <span className="lpe-anchor-group-label"><IconCompass /> Navigator</span>
                <span className="lpe-anchor-count-badge">{navAnchors.length}</span>
                <span className={`lpe-anchor-chevron${openSections.nav ? ' lpe-anchor-chevron--open' : ''}`}>
                  <IconChevronRight />
                </span>
              </button>
              <button
                className="lpe-anchor-add-btn"
                onClick={e => { e.stopPropagation(); onEnterPlacement?.('nav') ?? openForm('nav') }}
                disabled={saving}
              >
                <IconPlus /> Add
              </button>
            </div>
            {openSections.nav && (
              <div className="lpe-anchor-list">
                {navAnchors.length === 0 && <p className="lpe-anchor-empty">No navigator anchors yet.</p>}
                {navAnchors.map(a => (
                  <div key={a.id} className="lpe-anchor-item lpe-anchor-item--clickable" onClick={() => openForm('nav', a)}>
                    <span className="lpe-anchor-item-title">→ Tour #{a.target_vr_tour}</span>
                    <div className="lpe-anchor-item-actions">
                      <button className="lpe-anchor-icon-btn lpe-anchor-icon-btn--delete" title="Delete" onClick={e => { e.stopPropagation(); handleDelete('nav', a.id) }} disabled={saving}>
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="lpe-anchor-form-error" style={{ marginTop: 4 }}>{error}</p>}

          {/* Polygon section */}
          <div className="lpe-anchor-group">
            <div className="lpe-anchor-group-header">
              <button
                className="lpe-anchor-section-toggle"
                onClick={() => setOpenSections(prev => ({ ...prev, poly: !prev.poly }))}
              >
                <span className="lpe-anchor-group-label"><IconPolygon /> Polygon</span>
                <span className="lpe-anchor-count-badge">{polyAnchors.length}</span>
                <span className={`lpe-anchor-chevron${openSections.poly ? ' lpe-anchor-chevron--open' : ''}`}>
                  <IconChevronRight />
                </span>
              </button>
              <button
                className="lpe-anchor-add-btn"
                onClick={e => { e.stopPropagation(); onEnterPlacement?.('poly') }}
                disabled={polySaving}
              >
                <IconPlus /> Add
              </button>
            </div>
            {openSections.poly && (
              <div className="lpe-anchor-list">
                {polyAnchors.length === 0 && <p className="lpe-anchor-empty">No polygon anchors yet.</p>}
                {polyAnchors.map(pa => (
                  <div key={pa.id} className="lpe-anchor-item lpe-anchor-item--clickable" onClick={() => { setForm(null); openPolyForm(pa) }}>
                    <span className="lpe-anchor-item-title">{pa.title || <em>Untitled</em>}</span>
                    <div className="lpe-anchor-item-actions">
                      <button className="lpe-anchor-icon-btn lpe-anchor-icon-btn--delete" title="Delete" onClick={e => { e.stopPropagation(); handlePolyDelete(pa.id) }} disabled={polySaving}>
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {polyError && <p className="lpe-anchor-form-error" style={{ marginTop: 4 }}>{polyError}</p>}
        </>
      )}
    </div>
  )
}
