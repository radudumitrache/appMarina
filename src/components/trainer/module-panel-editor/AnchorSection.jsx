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
  createAnchorDocument,
  deleteAnchorDocument,
  createPolygonAnchorDocument,
  deletePolygonAnchorDocument,
} from '../../../api/modules'
import { IconEdit, IconTrash, IconPlus, IconPin, IconCompass, IconPolygon, IconCrosshair, IconChevronUp, IconChevronDown } from './LPEIcons'
import RichTextEditor from '../../shared/RichTextEditor'
import ColorPicker from '../../shared/ColorPicker'
import DocumentSection from './DocumentSection'
import { useAuth } from '../../../auth/AuthContext'
import VRViewer from '../../shared/VRViewer'
import { resolveSceneUrl } from '../../shared/VRSceneRenderer'

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


function NavLookPicker({ targetPanel, targetLon, targetLat, onPick, onClear }) {
  const sceneSrc = resolveSceneUrl(targetPanel?.vr_tour?.scene_url)
  const hasDir   = targetLon !== '' && targetLat !== ''

  const refHotspots = useMemo(() => {
    const tour = targetPanel?.vr_tour
    if (!tour) return []
    const out = []
    for (const ta of tour.text_anchors ?? []) {
      const { lon, lat } = posToLonLat(ta.pos_x, ta.pos_y, ta.pos_z)
      out.push({ id: `ref-ta-${ta.id}`, lon, lat, label: ta.title, show_title: false, className: 'vr-hotspot--anchor lpe-ref-hotspot', onClick: null })
    }
    for (const na of tour.navigator_anchors ?? []) {
      const { lon, lat } = posToLonLat(na.pos_x, na.pos_y, na.pos_z)
      out.push({ id: `ref-na-${na.id}`, lon, lat, label: na.title || '->', show_title: false, className: 'vr-hotspot--anchor vr-hotspot--nav lpe-ref-hotspot', onClick: null })
    }
    if (hasDir) {
      out.push({
        id: '__dir__',
        lon: parseFloat(targetLon),
        lat: parseFloat(targetLat),
        label: '',
        show_title: false,
        className: 'lpe-look-dir-hotspot',
        onClick: null,
        render: () => (
          <div className="lpe-look-dir-marker">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
        ),
      })
    }
    return out
  }, [targetPanel, targetLon, targetLat, hasDir])

  return (
    <div className="lpe-field">
      <div className="lpe-nav-look-header">
        <label className="lpe-label">Look direction on arrival <span className="lpe-label-opt">(optional)</span></label>
        {hasDir && (
          <button type="button" className="lpe-nav-look-clear" onClick={onClear} title="Clear direction">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
      <div className="lpe-nav-look-picker">
        <VRViewer
          src={sceneSrc}
          hotspots={refHotspots}
          polygonAnchors={[]}
          onSceneClick={(lon, lat) => onPick(lon, lat)}
        />
        <div className="lpe-nav-look-hint">
          {hasDir
            ? `Lon ${targetLon}° · Lat ${targetLat}° -- click to reposition`
            : 'Click anywhere to set look direction'}
        </div>
      </div>
    </div>
  )
}

function PanelPicker({ value, onChange, panels }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const selected = panels.find(p => String(p.id) === String(value))

  return (
    <div className={`lpe-panel-picker${open ? ' lpe-panel-picker--open' : ''}`} ref={ref}>
      <button
        type="button"
        className="lpe-panel-picker-trigger"
        onClick={() => setOpen(o => !o)}
      >
        <span className={`lpe-panel-picker-label${!selected ? ' lpe-panel-picker-label--placeholder' : ''}`}>
          {selected ? selected.title : '-- select a panel --'}
        </span>
        <svg className="lpe-panel-picker-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="lpe-panel-picker-list">
          {panels.map(p => {
            const isActive = String(p.id) === String(value)
            const badge = p.type === 'vr_tour' ? '360°' : 'Text'
            return (
              <div
                key={p.id}
                className={`lpe-panel-picker-option${isActive ? ' lpe-panel-picker-option--active' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); onChange(String(p.id)); setOpen(false) }}
              >
                <span className="lpe-panel-picker-option-name">{p.title}</span>
                <span className="lpe-panel-picker-option-badge">{badge}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TitleDisplayControls({ showTitle, setShowTitle, titleSize, setTitleSize, titleTextColor, setTitleTextColor }) {
  return (
    <div className="lpe-title-display">
      <div className="lpe-title-display-header">Title Display</div>

      <div className="lpe-title-toggle-row">
        <span className="lpe-label">Show Title</span>
        <button
          type="button"
          className={`lpe-toggle ${showTitle ? 'lpe-toggle--on' : ''}`}
          onClick={() => setShowTitle(v => !v)}
          aria-pressed={showTitle}
        >
          <span className="lpe-toggle-thumb" />
        </button>
      </div>

      {showTitle && (
        <>
          <div className="lpe-field">
            <label className="lpe-label">Title Size</label>
            <div className="lpe-size-tabs">
              {['small', 'medium', 'big'].map(s => (
                <button
                  key={s}
                  type="button"
                  className={`lpe-size-tab ${titleSize === s ? 'lpe-size-tab--active' : ''}`}
                  onClick={() => setTitleSize(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="lpe-field">
            <label className="lpe-label">Title Color</label>
            <div className="lpe-color-row">
              <ColorPicker value={titleTextColor} onChange={setTitleTextColor} />
              <input
                className="lpe-input lpe-input--mono"
                value={titleTextColor}
                onChange={e => setTitleTextColor(e.target.value)}
                placeholder="#000000"
                maxLength={7}
              />
            </div>
          </div>
        </>
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

export default function AnchorSection({
  moduleId,
  panelId,
  departmentId,
  panels = [],
  initialTextAnchors,
  initialNavAnchors,
  initialPolyAnchors,
  onAnchorsChange,
  focusAnchor,
  onEnterPlacement,
  newAnchorPlacement,
  onNewAnchorSaved,
  newPolyPlacement,
  onNewPolySaved,
  newPolyPoint,
  onNewPolyPointSaved,
  onActivePolyPointsChange,
  onAnchorEditingChange,
  draggedAnchorPos,
  getViewerCameraDir,
}) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [textAnchors, setTextAnchors] = useState(initialTextAnchors ?? [])
  const [navAnchors,  setNavAnchors]  = useState(initialNavAnchors  ?? [])
  const [polyAnchors, setPolyAnchors] = useState(initialPolyAnchors ?? [])

  const [anchorDocs,     setAnchorDocs]     = useState([])
  const [docUploading,   setDocUploading]   = useState(false)

  const [polyDocs,       setPolyDocs]       = useState([])
  const [polyDocUploading, setPolyDocUploading] = useState(false)

  const targetPanels = useMemo(() =>
    panels.filter(p => p.id !== panelId)
  , [panels, panelId])

  const panelIdToTitle = useMemo(() => {
    const map = {}
    for (const p of panels) map[p.id] = p.title
    return map
  }, [panels])

  useEffect(() => {
    listTextAnchors(moduleId, panelId)
      .then(res => setTextAnchors(res.data))
      .catch(() => {})
  }, [moduleId, panelId])

  const formRef              = useRef(null)
  const polyFormRef          = useRef(null)
  const pendingPolyPointsRef = useRef([])
  const [formFocused, setFormFocused] = useState(false)
  const [openSections, setOpenSections] = useState({ text: false, nav: false, poly: false })

  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return }
    onAnchorsChange?.(textAnchors, navAnchors, polyAnchors)
  }, [textAnchors, navAnchors, polyAnchors])

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

  useEffect(() => {
    if (!newAnchorPlacement) return
    setForm({ type: newAnchorPlacement.type, anchor: null })
    setPosX(String(newAnchorPlacement.x ?? 0))
    setPosY(String(newAnchorPlacement.y ?? 0))
    setPosZ(String(newAnchorPlacement.z ?? -1))
    setATitle('')
    setADesc('')
    setTargetTour('')
    setShowTitle(true)
    setTitleSize('medium')
    setTitleTextColor('#000000')
    setAnchorError(null)
    setFormFocused(true)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 40)
    setTimeout(() => setFormFocused(false), 1000)
  }, [newAnchorPlacement])

  useEffect(() => {
    if (!newPolyPlacement) return
    const pts = newPolyPlacement.points
    setPolyTitle('')
    setPolyContent('')
    setShowTitle(true)
    setTitleSize('medium')
    setTitleTextColor('#000000')
    setPolyError(null)
    pendingPolyPointsRef.current = pts.map((p, i) => ({ x: p.x, y: p.y, z: p.z, order: i }))
    setPolyForm({ anchor: null })
    setForm(null)
    setFormFocused(true)
    setTimeout(() => polyFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 40)
    setTimeout(() => setFormFocused(false), 1000)
  }, [newPolyPlacement])

  const [form,    setForm]          = useState(null)
  const [saving,  setAnchorSaving]  = useState(false)
  const [error,   setAnchorError]   = useState(null)

  const [posX,       setPosX]       = useState('')
  const [posY,       setPosY]       = useState('')
  const [posZ,       setPosZ]       = useState('')
  const [aTitle,     setATitle]     = useState('')
  const [aDesc,      setADesc]      = useState('')
  const [targetTour, setTargetTour] = useState('')

  const [showTitle,      setShowTitle]      = useState(true)
  const [titleSize,      setTitleSize]      = useState('medium')
  const [titleTextColor, setTitleTextColor] = useState('#000000')
  const [targetLon,      setTargetLon]      = useState('')
  const [targetLat,      setTargetLat]      = useState('')

  const targetPanelObj = useMemo(() =>
    panels.find(p => String(p.id) === String(targetTour)) ?? null
  , [panels, targetTour])

  const targetIsVR = targetPanelObj?.type === 'vr_tour'

  function openForm(type, anchor = null) {
    setPolyForm(null)
    setForm({ type, anchor })
    setPosX(String(anchor?.pos_x ?? 0))
    setPosY(String(anchor?.pos_y ?? 0))
    setPosZ(String(anchor?.pos_z ?? -1))
    setATitle(anchor?.title ?? '')
    setADesc(anchor?.description ?? '')
    setTargetTour(anchor?.target_panel ?? '')
    setTargetLon(anchor?.target_lon != null ? String(anchor.target_lon) : '')
    setTargetLat(anchor?.target_lat != null ? String(anchor.target_lat) : '')
    setShowTitle(anchor?.show_title ?? true)
    setTitleSize(anchor?.title_size ?? 'medium')
    setTitleTextColor(anchor?.title_text_color ?? '#000000')
    setAnchorError(null)
  }

  function closeForm() {
    setForm(null)
    setAnchorError(null)
    setAnchorDocs([])
    setTextAnchors(prev => prev.filter(a => a.id !== '__preview__'))
    setNavAnchors(prev => prev.filter(a => a.id !== '__preview__'))
  }

  useEffect(() => {
    if (form?.type === 'text' && form.anchor) {
      setAnchorDocs(form.anchor.documents ?? [])
    }
  }, [form?.anchor?.id, form?.type])

  const handleAnchorDocUpload = async (fileData) => {
    if (!form?.anchor) return
    setDocUploading(true)
    try {
      const res = await createAnchorDocument(moduleId, panelId, form.anchor.id, fileData)
      setAnchorDocs(prev => [...prev, res.data])
    } finally {
      setDocUploading(false)
    }
  }

  const handleAnchorDocDelete = async (docId) => {
    if (!form?.anchor) return
    await deleteAnchorDocument(moduleId, panelId, form.anchor.id, docId)
    setAnchorDocs(prev => prev.filter(d => d.id !== docId))
  }

  useEffect(() => {
    if (!draggedAnchorPos || !form) return
    setPosX(draggedAnchorPos.x.toFixed(4))
    setPosY(draggedAnchorPos.y.toFixed(4))
    setPosZ(draggedAnchorPos.z.toFixed(4))
  }, [draggedAnchorPos])

  async function handleSave() {
    setAnchorSaving(true)
    setAnchorError(null)
    const pos = {
      pos_x: parseFloat(posX)  || 0,
      pos_y: parseFloat(posY)  || 0,
      pos_z: parseFloat(posZ)  || 0,
    }
    try {
      const titleDisplay = { show_title: showTitle, title_size: titleSize, title_text_color: titleTextColor }
      if (form.type === 'text') {
        const data = { ...pos, title: aTitle, description: aDesc, ...titleDisplay }
        if (form.anchor) {
          const res = await updateTextAnchor(moduleId, panelId, form.anchor.id, data)
          setTextAnchors(prev => prev.map(a =>
            a.id === form.anchor.id ? { ...a, ...res.data, title: aTitle, description: aDesc, ...pos, ...titleDisplay } : a
          ))
        } else {
          const res = await createTextAnchor(moduleId, panelId, data)
          setTextAnchors(prev => [
            ...prev.filter(a => a.id !== '__preview__'),
            { ...res.data, title: aTitle, description: aDesc, ...pos, ...titleDisplay },
          ])
          onNewAnchorSaved?.()
        }
      } else {
        const tvt = parseInt(targetTour, 10)
        if (Number.isNaN(tvt)) {
          setAnchorError('Please select a target panel.')
          setAnchorSaving(false)
          return
        }
        const data = {
          ...pos, target_panel: tvt, title: aTitle.trim(), description: aDesc.trim(), ...titleDisplay,
          target_lon: targetLon !== '' ? parseFloat(targetLon) : null,
          target_lat: targetLat !== '' ? parseFloat(targetLat) : null,
        }
        if (form.anchor) {
          const res = await updateNavigatorAnchor(moduleId, panelId, form.anchor.id, data)
          setNavAnchors(prev => prev.map(a => a.id === form.anchor.id ? res.data : a))
        } else {
          const res = await createNavigatorAnchor(moduleId, panelId, data)
          setNavAnchors(prev => [
            ...prev.filter(a => a.id !== '__preview__'),
            res.data,
          ])
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
        await deleteTextAnchor(moduleId, panelId, anchorId)
        setTextAnchors(prev => prev.filter(a => a.id !== anchorId))
      } else {
        await deleteNavigatorAnchor(moduleId, panelId, anchorId)
        setNavAnchors(prev => prev.filter(a => a.id !== anchorId))
      }
    } catch {
      setAnchorError('Could not delete anchor.')
    } finally {
      setAnchorSaving(false)
    }
  }

  useEffect(() => {
    if (!form) return
    const x = parseFloat(posX), y = parseFloat(posY), z = parseFloat(posZ)
    if ([x, y, z].some(Number.isNaN)) return

    if (form.anchor) {
      if (form.type === 'text') {
        setTextAnchors(prev => prev.map(a =>
          a.id === form.anchor.id ? { ...a, pos_x: x, pos_y: y, pos_z: z } : a
        ))
      } else {
        setNavAnchors(prev => prev.map(a =>
          a.id === form.anchor.id ? { ...a, pos_x: x, pos_y: y, pos_z: z } : a
        ))
      }
    } else {
      const preview = { id: '__preview__', pos_x: x, pos_y: y, pos_z: z, title: '●' }
      if (form.type === 'text') {
        setTextAnchors(prev => [...prev.filter(a => a.id !== '__preview__'), preview])
      } else {
        setNavAnchors(prev => [...prev.filter(a => a.id !== '__preview__'), preview])
      }
    }
  }, [posX, posY, posZ])

  const formTitle = form
    ? (form.anchor
        ? (form.type === 'text' ? 'Edit Text Anchor' : 'Edit Navigator Anchor')
        : (form.type === 'text' ? 'New Text Anchor'  : 'New Navigator Anchor'))
    : ''

  const [polyForm,    setPolyForm]    = useState(null)

  useEffect(() => {
    onAnchorEditingChange?.(!!form || !!polyForm)
  }, [form, polyForm])
  const [polyTitle,   setPolyTitle]   = useState('')
  const [polyContent, setPolyContent] = useState('')
  const [polySaving,  setPolySaving]  = useState(false)
  const [polyError,   setPolyError]   = useState(null)

  useEffect(() => {
    if (!newPolyPoint) return
    const { x, y, z, polygonId, pointId } = newPolyPoint
    if (!polyForm?.anchor || polyForm.anchor.id !== polygonId) return
    const anchorId = polyForm.anchor.id

    if (pointId) {
      setPtActionIds(prev => new Set([...prev, pointId]))
      setPolyError(null)
      updatePolygonPoint(moduleId, panelId, anchorId, pointId, { x, y, z })
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
      const order = polyAnchors.find(pa => pa.id === anchorId)?.points?.length ?? 0
      setPtSaving(true)
      setPolyError(null)
      createPolygonPoint(moduleId, panelId, anchorId, { x, y, z, order })
        .then(res => {
          setPolyAnchors(prev => prev.map(pa =>
            pa.id === anchorId ? { ...pa, points: [...pa.points, res.data] } : pa
          ))
        })
        .catch(() => setPolyError('Could not add point.'))
        .finally(() => { setPtSaving(false); onNewPolyPointSaved?.() })
    }
  }, [newPolyPoint])

  const [editingPoint, setEditingPoint] = useState(null)
  const [editPtX,      setEditPtX]      = useState('')
  const [editPtY,      setEditPtY]      = useState('')
  const [editPtZ,      setEditPtZ]      = useState('')
  const [ptSaving,     setPtSaving]     = useState(false)
  const [ptActionIds,  setPtActionIds]  = useState(() => new Set())

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
    setShowTitle(anchor?.show_title ?? true)
    setTitleSize(anchor?.title_size ?? 'medium')
    setTitleTextColor(anchor?.title_text_color ?? '#000000')
    setPolyError(null)
    setEditingPoint(null)
    setForm(null)
  }

  function closePolyForm() {
    setPolyForm(null)
    setPolyError(null)
    setEditingPoint(null)
    setPolyDocs([])
  }

  useEffect(() => {
    if (polyForm?.anchor) {
      setPolyDocs(polyForm.anchor.documents ?? [])
    }
  }, [polyForm?.anchor?.id])

  const handlePolyDocUpload = async (fileData) => {
    if (!polyForm?.anchor) return
    setPolyDocUploading(true)
    try {
      const res = await createPolygonAnchorDocument(moduleId, panelId, polyForm.anchor.id, fileData)
      setPolyDocs(prev => [...prev, res.data])
    } finally {
      setPolyDocUploading(false)
    }
  }

  const handlePolyDocDelete = async (docId) => {
    if (!polyForm?.anchor) return
    await deletePolygonAnchorDocument(moduleId, panelId, polyForm.anchor.id, docId)
    setPolyDocs(prev => prev.filter(d => d.id !== docId))
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
      await updatePolygonPoint(moduleId, panelId, polyForm.anchor.id, pointId, { x, y, z })
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
        updatePolygonPoint(moduleId, panelId, polyForm.anchor.id, ptA.id, { order: orderA }),
        updatePolygonPoint(moduleId, panelId, polyForm.anchor.id, ptB.id, { order: orderB }),
      ])
    } catch {
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
    try {
      const data = { pos_x: 0, pos_y: 0, pos_z: 0, title: polyTitle, content: polyContent, show_title: showTitle, title_size: titleSize, title_text_color: titleTextColor }
      if (polyForm.anchor) {
        const res = await updatePolygonAnchor(moduleId, panelId, polyForm.anchor.id, data)
        const merged = { ...res.data, title: polyTitle, content: polyContent }
        setPolyAnchors(prev => prev.map(pa => pa.id === polyForm.anchor.id ? { ...pa, ...merged } : pa))
        setPolyForm(prev => ({ ...prev, anchor: { ...prev.anchor, ...merged } }))
      } else {
        const res = await createPolygonAnchor(moduleId, panelId, data)
        const newAnchor = { ...res.data, points: [] }

        const pending = pendingPolyPointsRef.current
        if (pending.length > 0) {
          const savedPoints = []
          for (const pt of pending) {
            const ptRes = await createPolygonPoint(moduleId, panelId, newAnchor.id, pt)
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
      await deletePolygonAnchor(moduleId, panelId, anchorId)
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
      const res = await createPolygonPoint(moduleId, panelId, anchorId, { x, y, z, order })
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
      await deletePolygonPoint(moduleId, panelId, anchorId, pointId)
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
          deletePolygonPoint(moduleId, panelId, anchorId, pt.id)
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

      {isEditing && (
        <>
          <button className="lpe-anchor-back-btn" onClick={form ? closeForm : closePolyForm}>
            <IconArrowLeft />
            Anchors
          </button>

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
                    <input className="lpe-input" value={aTitle} onChange={e => setATitle(e.target.value)} placeholder="Anchor title..." />
                  </div>
                  <div className="lpe-field">
                    <label className="lpe-label">Description</label>
                    <RichTextEditor
                      key={form.anchor?.id ?? 'new'}
                      value={aDesc}
                      onChange={setADesc}
                      departmentId={departmentId}
                      placeholder="Description..."
                    />
                  </div>
                  {form.anchor && (
                    <DocumentSection
                      documents={anchorDocs}
                      onUpload={handleAnchorDocUpload}
                      onDelete={handleAnchorDocDelete}
                      uploading={docUploading}
                      isAdmin={isAdmin}
                      departmentId={departmentId}
                    />
                  )}
                </>
              )}

              {form.type === 'nav' && (
                <>
                  <div className="lpe-field">
                    <label className="lpe-label">Navigate to Panel</label>
                    {targetPanels.length === 0 ? (
                      <p className="lpe-anchor-empty">No other panels in this module.</p>
                    ) : (
                      <PanelPicker
                        value={targetTour}
                        onChange={(v) => { setTargetTour(v); setTargetLon(''); setTargetLat('') }}
                        panels={targetPanels}
                      />
                    )}
                  </div>
                  <div className="lpe-field">
                    <label className="lpe-label">Label <span className="lpe-label-opt">(optional)</span></label>
                    <input className="lpe-input" value={aTitle} onChange={e => setATitle(e.target.value)} placeholder="e.g. Engine Room ->" />
                  </div>
                  <div className="lpe-field">
                    <label className="lpe-label">Description <span className="lpe-label-opt">(optional)</span></label>
                    <RichTextEditor
                      key={`nav-${form.anchor?.id ?? 'new'}`}
                      value={aDesc}
                      onChange={setADesc}
                      departmentId={departmentId}
                      placeholder="Description..."
                    />
                  </div>
                  {targetIsVR && targetPanelObj && (
                    <NavLookPicker
                      targetPanel={targetPanelObj}
                      targetLon={targetLon}
                      targetLat={targetLat}
                      onPick={(lon, lat) => { setTargetLon(String(lon)); setTargetLat(String(lat)) }}
                      onClear={() => { setTargetLon(''); setTargetLat('') }}
                    />
                  )}
                </>
              )}

              <TitleDisplayControls
                showTitle={showTitle} setShowTitle={setShowTitle}
                titleSize={titleSize} setTitleSize={setTitleSize}
                titleTextColor={titleTextColor} setTitleTextColor={setTitleTextColor}
              />

              {error && <p className="lpe-anchor-form-error">{error}</p>}

              <div className="lpe-anchor-form-footer">
                <button className="lpe-anchor-save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : form.anchor ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {polyForm && (
            <div ref={polyFormRef} className={`lpe-anchor-form lpe-anchor-form--poly${formFocused ? ' lpe-anchor-form--focused' : ''}`}>
              <div className="lpe-anchor-form-title">
                {polyForm.anchor ? 'Edit Polygon Anchor' : 'New Polygon Anchor'}
              </div>
              {!polyForm.anchor && pendingPolyPointsRef.current.length > 0 && (
                <p className="lpe-anchor-empty" style={{ color: 'var(--gold)', marginBottom: 4 }}>
                  {pendingPolyPointsRef.current.length} vertices ready -- add a title and save.
                </p>
              )}

              <div className="lpe-field">
                <label className="lpe-label">Title</label>
                <input className="lpe-input" value={polyTitle} onChange={e => setPolyTitle(e.target.value)} placeholder="Polygon region title..." />
              </div>

              <div className="lpe-field">
                <label className="lpe-label">Content</label>
                <RichTextEditor
                  key={polyForm.anchor?.id ?? 'new-poly'}
                  value={polyContent}
                  onChange={setPolyContent}
                  departmentId={departmentId}
                  placeholder="Polygon region content..."
                />
              </div>

              <TitleDisplayControls
                showTitle={showTitle} setShowTitle={setShowTitle}
                titleSize={titleSize} setTitleSize={setTitleSize}
                titleTextColor={titleTextColor} setTitleTextColor={setTitleTextColor}
              />

              {polyForm.anchor && (
                <DocumentSection
                  documents={polyDocs}
                  onUpload={handlePolyDocUpload}
                  onDelete={handlePolyDocDelete}
                  uploading={polyDocUploading}
                  isAdmin={isAdmin}
                  departmentId={departmentId}
                />
              )}

              {polyError && <p className="lpe-anchor-form-error">{polyError}</p>}

              <div className="lpe-anchor-form-footer">
                <button className="lpe-anchor-save-btn" onClick={handlePolySave} disabled={polySaving}>
                  {polySaving ? 'Saving...' : polyForm.anchor ? 'Update' : 'Create & Add Points'}
                </button>
              </div>

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
                              {ptActionIds.has(pt.id) ? 'Saving...' : 'Save'}
                            </button>
                            <button className="lpe-anchor-cancel-btn" onClick={() => setEditingPoint(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="lpe-poly-point-row">
                          <span className="lpe-poly-point-num">{i + 1}</span>
                          <span className="lpe-anchor-pos lpe-poly-point-coords">
                            {pt.x.toFixed(1)} &middot; {pt.y.toFixed(1)} &middot; {pt.z.toFixed(1)}
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

      {!isEditing && (
        <>
          <div className="lpe-anchor-heading">
            <span className="lpe-label">Anchors</span>
            <span className="lpe-anchor-total">
              {textAnchors.length + navAnchors.length + polyAnchors.length}
            </span>
          </div>

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
                disabled={saving || panels.length < 2}
                title={panels.length < 2 ? 'Add a second panel first' : undefined}
              >
                <IconPlus /> Add
              </button>
            </div>
            {openSections.nav && (
              <div className="lpe-anchor-list">
                {panels.length < 2 && <p className="lpe-anchor-empty">At least 2 panels required to add a navigator anchor.</p>}
                {panels.length >= 2 && navAnchors.length === 0 && <p className="lpe-anchor-empty">No navigator anchors yet.</p>}
                {navAnchors.map(a => (
                  <div key={a.id} className="lpe-anchor-item lpe-anchor-item--clickable" onClick={() => openForm('nav', a)}>
                    <span className="lpe-anchor-item-title">{'-> '}{a.title || (panelIdToTitle[a.target_panel] ?? `Panel #${a.target_panel}`)}</span>
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
