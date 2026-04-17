import { useState, useMemo } from 'react'
import VRViewer from '../components/shared/VRViewer'
import VRAnchorPanel from '../components/shared/VRAnchorPanel'
import VRAnchorEditor from '../components/shared/VRAnchorEditor'
import './css/VRDemo.css'

import bridge       from '../../vrScenes/Bridge entrance.jpg'
import centerAOOW   from '../../vrScenes/Center AOOW.jpg'
import centerOOW    from '../../vrScenes/Center OOW.jpg'
import centerBehind from '../../vrScenes/Center behind.jpg'
import centerFwd    from '../../vrScenes/Center forward.jpg'
import safetyCenter from '../../vrScenes/Safety center.jpg'
import starboard    from '../../vrScenes/Starboard wing.jpg'

/* ── Lon/lat → XYZ on sphere (mirrors VRViewer's lonLatToVec3) ───────────
 * Used to convert polygon drawing points before passing to VRViewer.
 */
function lonLatToXYZ(lon, lat, r = 500) {
  const phi   = (Math.PI / 180) * (90 - lat)
  const theta = (Math.PI / 180) * lon
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta),
  }
}

/* ── Available images for the anchor editor image-picker ─────────────────
 * Keep in sync with the imports above.
 */
const SCENE_IMAGES = [
  { label: 'Bridge Entrance',  src: bridge       },
  { label: 'Center — AOOW',    src: centerAOOW   },
  { label: 'Center — OOW',     src: centerOOW    },
  { label: 'Center Behind',    src: centerBehind },
  { label: 'Center Forward',   src: centerFwd    },
  { label: 'Safety Center',    src: safetyCenter },
  { label: 'Starboard Wing',   src: starboard    },
]

/* ── In-scene marker for type='info' ────────────────────────────────────── */
function InfoMarker({ icon, label }) {
  return (
    <>
      <div className="vr-hotspot-icon-wrap">{icon}</div>
      <span className="vr-hotspot-label">{label}</span>
    </>
  )
}

/* ── Anchor type picker (appears at click position) ─────────────────────
 * screenX / screenY are clientX/Y from the click event.
 */
function AnchorTypePicker({ screenX, screenY, onPick, onDismiss }) {
  // Clamp so the picker stays inside the viewport
  const left = Math.min(Math.max(screenX - 90, 12), window.innerWidth  - 196)
  const top  = Math.min(Math.max(screenY - 140, 12), window.innerHeight - 250)

  const types = [
    { id: 'waypoint', icon: '⬤', label: 'Waypoint',     sub: 'Navigation point' },
    { id: 'image',    icon: '⬜', label: 'Image Pin',    sub: 'Scene reference'  },
    { id: 'info',     icon: 'ℹ',  label: 'Info Note',    sub: 'Technical detail' },
    { id: 'polygon',  icon: '⬡', label: 'Polygon Area', sub: 'Multi-point zone' },
  ]

  return (
    <>
      {/* Backdrop — clicking outside dismisses */}
      <div className="vr-picker-backdrop" onClick={onDismiss} />

      <div className="vr-picker" style={{ left, top }}>
        <p className="vr-picker-title">Add anchor</p>
        {types.map(t => (
          <button key={t.id} className="vr-picker-item" onClick={() => onPick(t.id)}>
            <span className="vr-picker-icon">{t.icon}</span>
            <span className="vr-picker-text">
              <span className="vr-picker-label">{t.label}</span>
              <span className="vr-picker-sub">{t.sub}</span>
            </span>
          </button>
        ))}
        <button className="vr-picker-cancel" onClick={onDismiss}>Cancel</button>
      </div>
    </>
  )
}

/* ─── Scene data ─────────────────────────────────────────────────────────
 * onClick / render / className are injected at render time — not stored here.
 */
const SCENES_DATA = [
  {
    id: 1, label: 'Bridge Entrance', src: bridge,
    hotspots: [
      { id: 'a1-w1', type: 'waypoint', lon:  30, lat:  5,
        label: 'Entry Checkpoint',
        description: "Main entry to the navigation bridge. Watertight door must remain secured during sea passage as per ship's standing orders.",
        category: 'Navigation', status: 'active', bearing: 5 },
      { id: 'a1-w2', type: 'waypoint', lon: -45, lat: -8,
        label: 'Crew Station Alpha',
        description: 'Designated watchkeeping position during restricted visibility. Officer must maintain continuous radar watch from this station.',
        category: 'Watchkeeping', status: 'active', bearing: 315 },
      { id: 'a1-i1', type: 'image', lon:  65, lat: 12,
        image: safetyCenter, label: 'Safety Board',
        description: 'Emergency muster station locations, fire & flooding plan, and LSA equipment inventory. Mandatory review before departure.',
        ref: 'SOLAS III/11.1' },
      { id: 'a1-i2', type: 'image', lon: -70, lat:  3,
        image: centerOOW, label: 'OOW Console',
        description: 'Primary Officer of the Watch workstation. ECDIS, radar, and engine telegraph are operated from this position.',
        ref: 'STCW A-II/1' },
      { id: 'a1-n1', type: 'info', lon:  10, lat: -18,
        icon: '🚪', label: 'Bridge Door',
        body: 'Watertight — keep closed during drills and in heavy weather.',
        detail: 'Per SOLAS II-1/13.7, watertight doors must be kept closed at sea except when in use.',
        ref: 'SOLAS II-1/13.7' },
      { id: 'a1-n2', type: 'info', lon:  90, lat:  6,
        icon: '📋', label: 'Emergency Plan',
        body: 'Posted at all entry points. Contains muster list, fire control plan, and emergency signal codes.',
        detail: 'The emergency plan must be accessible at all times and reviewed at each muster drill.',
        ref: 'SOLAS III/19.3' },
    ],
  },
  {
    id: 2, label: 'Center — AOOW', src: centerAOOW,
    hotspots: [
      { id: 'a2-w1', type: 'waypoint', lon:  20, lat:  8,
        label: 'AOOW Position',
        description: 'Assistant Officer of the Watch station. Monitors ARPA targets and maintains traffic log.',
        category: 'Watchkeeping', status: 'active', bearing: 20 },
      { id: 'a2-w2', type: 'waypoint', lon: -55, lat: -5,
        label: 'Radar Station',
        description: 'Dedicated radar plotting station. Relative motion plots must be maintained for all targets within 12 nm.',
        category: 'Navigation', status: 'active', bearing: 305 },
      { id: 'a2-i1', type: 'image', lon:  50, lat: 10,
        image: bridge, label: 'Bridge Entrance',
        description: 'View forward through the main bridge entrance.',
        ref: 'Bridge Layout Plan' },
      { id: 'a2-i2', type: 'image', lon: -35, lat:  0,
        image: starboard, label: 'Starboard Wing',
        description: 'Wing station used for berthing operations and pilotage.',
        ref: 'ISM SMS §7.2' },
      { id: 'a2-n1', type: 'info', lon:  5, lat: -20,
        icon: '🧭', label: 'ARPA Display',
        body: 'Automatic Radar Plotting Aid — tracks up to 40 targets simultaneously at 12 nm range.',
        detail: 'Operated per IMO Resolution MSC.192(79). Targets should be acquired manually in congested waters.',
        ref: 'IMO MSC.192(79)' },
      { id: 'a2-n2', type: 'info', lon:  80, lat:  3,
        icon: '📡', label: 'VHF Radio',
        body: 'Channel 16 — international distress, safety, and calling frequency.',
        detail: 'A continuous watch on VHF Ch 16 is mandatory under SOLAS IV/7.',
        ref: 'SOLAS IV/7' },
    ],
  },
  {
    id: 3, label: 'Center — OOW', src: centerOOW,
    hotspots: [
      { id: 'a3-w1', type: 'waypoint', lon:  35, lat:  6,
        label: 'OOW Watchpost',
        description: 'Primary watchkeeping position for the Officer of the Watch.',
        category: 'Watchkeeping', status: 'active', bearing: 0 },
      { id: 'a3-w2', type: 'waypoint', lon: -25, lat: -10,
        label: 'Chart Table',
        description: 'Paper chart backup and voyage planning station.',
        category: 'Navigation', status: 'active', bearing: 335 },
      { id: 'a3-i1', type: 'image', lon:  60, lat: 15,
        image: centerAOOW, label: 'AOOW Area',
        description: 'Adjacent AOOW station visible from the OOW post.',
        ref: 'STCW A-VIII/2' },
      { id: 'a3-i2', type: 'image', lon: -65, lat:  5,
        image: centerFwd, label: 'Forward View',
        description: 'Forward visibility arc from the bridge — critical for collision avoidance.',
        ref: 'COLREGS Rule 5' },
      { id: 'a3-n1', type: 'info', lon:  15, lat: -15,
        icon: '🗺️', label: 'ECDIS',
        body: 'Electronic Chart Display and Information System — primary navigation system.',
        detail: 'ECDIS must be operated with a current ENC licence. Updates applied weekly.',
        ref: 'SOLAS V/19' },
      { id: 'a3-n2', type: 'info', lon:  75, lat:  8,
        icon: '⚙️', label: 'Engine Telegraph',
        body: 'Engine order telegraph — transmits speed and direction commands to engine room.',
        detail: 'All telegraph movements must be logged with time and RPM.',
        ref: 'ISM SMS §6.3' },
    ],
  },
  {
    id: 4, label: 'Center Behind', src: centerBehind,
    hotspots: [
      { id: 'a4-w1', type: 'waypoint', lon:  40, lat:  4,
        label: 'Aft Watch Point',
        description: 'Aft visibility monitoring station.',
        category: 'Watchkeeping', status: 'active', bearing: 180 },
      { id: 'a4-w2', type: 'waypoint', lon: -30, lat: -12,
        label: 'Companion Way',
        description: 'Access hatch to the bridge deck. Emergency escape route to boat deck.',
        category: 'Safety', status: 'active', bearing: 220 },
      { id: 'a4-i1', type: 'image', lon:  55, lat: 10,
        image: bridge, label: 'Bridge Entrance',
        description: 'Forward bridge entrance viewed from the aft station.',
        ref: 'Bridge Arrangement' },
      { id: 'a4-i2', type: 'image', lon: -60, lat:  2,
        image: safetyCenter, label: 'Safety Station',
        description: 'Nearest lifesaving appliance locker from the aft bridge position.',
        ref: 'SOLAS III/7.1' },
      { id: 'a4-n1', type: 'info', lon:  12, lat: -16,
        icon: '🪟', label: 'Aft Window',
        body: 'Maintains 135° all-round visibility arc to the stern — required by COLREGS.',
        detail: 'Windows must be kept clean and unobstructed at all times.',
        ref: 'COLREGS Rule 5' },
      { id: 'a4-n2', type: 'info', lon:  85, lat:  5,
        icon: '🔦', label: 'Aldis Lamp',
        body: 'Morse signalling lamp — effective range 5 nm in daylight, 10 nm at night.',
        detail: 'Signal lamp competency required under STCW A-II/1.',
        ref: 'STCW A-II/1' },
    ],
  },
  {
    id: 5, label: 'Center Forward', src: centerFwd,
    hotspots: [
      { id: 'a5-w1', type: 'waypoint', lon:  15, lat:  10,
        label: 'Forward Lookout',
        description: 'Primary lookout position for collision avoidance.',
        category: 'Collision Avoidance', status: 'active', bearing: 0 },
      { id: 'a5-w2', type: 'waypoint', lon: -50, lat: -6,
        label: 'Conning Position',
        description: 'Steering and speed control for coastal passages and pilotage.',
        category: 'Shiphandling', status: 'active', bearing: 310 },
      { id: 'a5-i1', type: 'image', lon:  70, lat: 14,
        image: starboard, label: 'Starboard Wing',
        description: 'Starboard wing station for berthing and undocking.',
        ref: 'Maneuvering Plan' },
      { id: 'a5-i2', type: 'image', lon: -40, lat:  0,
        image: centerBehind, label: 'Aft View',
        description: 'Aft bridge section visible from the forward conning position.',
        ref: 'Bridge Layout' },
      { id: 'a5-n1', type: 'info', lon:  8, lat: -20,
        icon: '⚓', label: 'Bow Anchor',
        body: 'Port & starboard — 3 shackles in water is standard holding scope for anchorage.',
        detail: 'Anchor watch must be maintained whenever anchored.',
        ref: 'ISM SMS §8.1' },
      { id: 'a5-n2', type: 'info', lon:  95, lat:  4,
        icon: '🌊', label: 'Sea State Gauge',
        body: 'Current sea state 4 — significant wave height 1.25–2.5 m. Moderate swell.',
        detail: 'At sea state 5 and above, speed reduction must be considered.',
        ref: 'SMS Weather Policy §4' },
    ],
  },
  {
    id: 6, label: 'Safety Center', src: safetyCenter,
    hotspots: [
      { id: 'a6-w1', type: 'waypoint', lon:  25, lat:  7,
        label: 'Muster Station',
        description: 'Assembly point for all crew during emergency drills.',
        category: 'Emergency', status: 'active', bearing: 25 },
      { id: 'a6-w2', type: 'waypoint', lon: -40, lat: -9,
        label: 'Life Raft Locker',
        description: 'Hydrostatic release unit fitted. Capacity 25 persons.',
        category: 'LSA', status: 'active', bearing: 320 },
      { id: 'a6-i1', type: 'image', lon:  55, lat: 12,
        image: centerOOW, label: 'OOW Console',
        description: 'Navigation bridge OOW console.',
        ref: 'Emergency Procedures §3' },
      { id: 'a6-i2', type: 'image', lon: -65, lat:  4,
        image: bridge, label: 'Bridge Entry',
        description: 'Bridge entry point from the safety center.',
        ref: 'Fire Plan' },
      { id: 'a6-n1', type: 'info', lon:  10, lat: -18,
        icon: '🧯', label: 'CO₂ System',
        body: 'Fixed CO₂ fire-fighting system covers the engine room and cargo pump room.',
        detail: 'Before discharge, all personnel must be evacuated from the protected space.',
        ref: 'SOLAS II-2/10' },
      { id: 'a6-n2', type: 'info', lon:  80, lat:  6,
        icon: '🦺', label: 'Immersion Suit',
        body: 'Total donning time: under 2 minutes. Thermal protection in 0°C water for 6 hours.',
        detail: 'Immersion suits must be donned and tested at each abandon-ship drill.',
        ref: 'SOLAS III/32' },
    ],
  },
  {
    id: 7, label: 'Starboard Wing', src: starboard,
    hotspots: [
      { id: 'a7-w1', type: 'waypoint', lon:  30, lat:  5,
        label: 'Wing Pelorus',
        description: 'Bearing instrument for taking compass bearings during pilotage.',
        category: 'Navigation', status: 'active', bearing: 90 },
      { id: 'a7-w2', type: 'waypoint', lon: -35, lat: -7,
        label: 'Manoeuvring Panel',
        description: 'Wing engine telegraph and bow thruster control for harbour manoeuvring.',
        category: 'Shiphandling', status: 'active', bearing: 55 },
      { id: 'a7-i1', type: 'image', lon:  60, lat: 11,
        image: centerFwd, label: 'Forward View',
        description: 'Forward aspect of the bridge from the starboard wing.',
        ref: 'Berth Approach Plan' },
      { id: 'a7-i2', type: 'image', lon: -55, lat:  2,
        image: centerAOOW, label: 'AOOW Panel',
        description: 'Starboard wing view of the AOOW station inboard.',
        ref: 'Mooring Operations §5' },
      { id: 'a7-n1', type: 'info', lon:  12, lat: -17,
        icon: '🔭', label: 'Binoculars',
        body: '7×50 standard — minimum magnification for bridge watchkeeping under STCW.',
        detail: 'Must not be the primary means of lookout while under radar plotting.',
        ref: 'STCW A-II/1' },
      { id: 'a7-n2', type: 'info', lon:  88, lat:  7,
        icon: '📻', label: 'Wing Intercom',
        body: 'Sound-powered telephone — direct line to engine room and mooring stations.',
        detail: 'Integrity must be verified before every berthing and unberthing operation.',
        ref: 'ISM SMS §7.4' },
    ],
  },
]

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function VRDemo() {
  // ── Hotspot anchor state ──────────────────────────────────────────────
  const [scenesData, setScenesData] = useState(() =>
    SCENES_DATA.map(s => ({ ...s, hotspots: s.hotspots.map(h => ({ ...h })) }))
  )
  // ── Polygon anchor state: keyed by sceneId ────────────────────────────
  const [polygonsByScene, setPolygonsByScene] = useState({})

  // ── UI state ──────────────────────────────────────────────────────────
  const [activeId, setActiveId]           = useState(SCENES_DATA[0].id)
  const [activeAnchor, setActiveAnchor]   = useState(null)    // view panel
  const [editMode, setEditMode]           = useState(false)
  const [editingAnchor, setEditingAnchor] = useState(null)    // {anchor, isNew, sceneId}
  const [pickerState, setPickerState]     = useState(null)    // {lon, lat, screenX, screenY}
  const [polygonDrawing, setPolygonDrawing] = useState(null)  // {sceneId, points:[{lon,lat}]}

  const activeScene = scenesData.find(s => s.id === activeId)

  // ── Hotspots with derived runtime fields ──────────────────────────────
  const hotspots = useMemo(() => {
    const derived = activeScene.hotspots.map(hs => {
      const h = { ...hs }

      if (hs.type === 'waypoint') h.className = 'vr-hotspot--anchor'
      if (hs.type === 'info') {
        h.className = 'vr-hotspot--info'
        h.render = (x) => <InfoMarker icon={x.icon} label={x.label} />
      }

      if (polygonDrawing) {
        // During polygon drawing, existing anchors are non-interactive
        h.onClick = null
      } else if (editMode) {
        h.className = (h.className || '') + ' vr-hotspot--editable'
        h.onClick = () => {
          setPickerState(null)
          setEditingAnchor({ anchor: { ...hs }, isNew: false, sceneId: activeScene.id })
        }
      } else {
        h.onClick = () => setActiveAnchor(hs)
      }

      return h
    })

    // Numbered point markers while drawing a polygon
    if (polygonDrawing) {
      polygonDrawing.points.forEach((pt, i) => {
        derived.push({
          id: `__poly-pt-${i}`,
          lon: pt.lon,
          lat: pt.lat,
          className: 'vr-hotspot--poly-pt',
          label: String(i + 1),
          onClick: null,
        })
      })
    }

    return derived
  }, [activeScene, editMode, polygonDrawing])

  // ── Polygon anchors for VRViewer (saved + live drawing preview) ───────
  const activePolygonAnchors = useMemo(() => {
    const saved = (polygonsByScene[activeId] || []).map(pa => ({
      ...pa,
      onClick: editMode
        ? () => {
            setPickerState(null)
            setEditingAnchor({ anchor: { ...pa }, isNew: false, sceneId: activeId })
          }
        : undefined,
    }))

    // Live preview: add the in-progress polygon once it has 3+ points
    if (polygonDrawing && polygonDrawing.points.length >= 3) {
      saved.push({
        id: '__drawing__',
        points: polygonDrawing.points.map((p, i) => ({ ...lonLatToXYZ(p.lon, p.lat), order: i })),
        title: '',
        content: '',
      })
    }

    return saved
  }, [activeId, polygonsByScene, editMode, polygonDrawing])

  // ── Scene click: show type picker OR add polygon point ────────────────
  const handleSceneClick = (lon, lat, screenX, screenY) => {
    if (polygonDrawing) {
      setPolygonDrawing(prev => ({
        ...prev,
        points: [...prev.points, { lon, lat }],
      }))
      return
    }
    setEditingAnchor(null)
    setPickerState({ lon, lat, screenX, screenY })
  }

  // ── Type picker selection ─────────────────────────────────────────────
  const handlePickType = (type) => {
    if (!pickerState) return
    const { lon, lat } = pickerState
    setPickerState(null)

    if (type === 'polygon') {
      setPolygonDrawing({ sceneId: activeId, points: [{ lon, lat }] })
      return
    }

    setEditingAnchor({
      anchor: {
        id: `anc-${Date.now()}`,
        type,
        lon,
        lat,
        label: 'New Anchor',
        description: '',
        ...(type === 'waypoint' ? { category: '', status: 'active' } : {}),
        ...(type === 'info'     ? { icon: '📌', body: '', detail: '' } : {}),
      },
      isNew: true,
      sceneId: activeId,
    })
  }

  // ── Finish polygon drawing ────────────────────────────────────────────
  const handleFinishPolygon = () => {
    if (!polygonDrawing || polygonDrawing.points.length < 3) return
    const points3d = polygonDrawing.points.map((p, i) => ({
      ...lonLatToXYZ(p.lon, p.lat),
      order: i,
    }))
    setEditingAnchor({
      anchor: {
        id: `poly-${Date.now()}`,
        type: 'polygon',
        points: points3d,
        label: 'New Area',
        description: '',
      },
      isNew: true,
      sceneId: polygonDrawing.sceneId,
    })
    setPolygonDrawing(null)
  }

  // ── Undo last polygon point ───────────────────────────────────────────
  const handleUndoPoint = () => {
    setPolygonDrawing(prev => {
      if (!prev || prev.points.length <= 1) return null   // cancel if only 1 point left
      return { ...prev, points: prev.points.slice(0, -1) }
    })
  }

  // ── Save anchor (hotspot or polygon) ─────────────────────────────────
  const handleSaveAnchor = (updated) => {
    if (updated.type === 'polygon') {
      setPolygonsByScene(prev => {
        const existing = prev[editingAnchor.sceneId] || []
        return {
          ...prev,
          [editingAnchor.sceneId]: editingAnchor.isNew
            ? [...existing, updated]
            : existing.map(pa => pa.id === updated.id ? updated : pa),
        }
      })
    } else {
      setScenesData(prev => prev.map(scene => {
        if (scene.id !== editingAnchor.sceneId) return scene
        return {
          ...scene,
          hotspots: editingAnchor.isNew
            ? [...scene.hotspots, updated]
            : scene.hotspots.map(hs => hs.id === updated.id ? updated : hs),
        }
      }))
    }
    setEditingAnchor(null)
  }

  // ── Delete anchor ─────────────────────────────────────────────────────
  const handleDeleteAnchor = (anchorId) => {
    const { anchor } = editingAnchor
    if (anchor.type === 'polygon') {
      setPolygonsByScene(prev => ({
        ...prev,
        [editingAnchor.sceneId]: (prev[editingAnchor.sceneId] || []).filter(pa => pa.id !== anchorId),
      }))
    } else {
      setScenesData(prev => prev.map(scene => {
        if (scene.id !== editingAnchor.sceneId) return scene
        return { ...scene, hotspots: scene.hotspots.filter(hs => hs.id !== anchorId) }
      }))
    }
    setEditingAnchor(null)
  }

  const handleSceneChange = (id) => {
    setActiveAnchor(null)
    setEditingAnchor(null)
    setPickerState(null)
    setPolygonDrawing(null)
    setActiveId(id)
  }

  const handleToggleEditMode = () => {
    setEditMode(prev => {
      if (!prev) {
        setActiveAnchor(null)
      } else {
        setEditingAnchor(null)
        setPickerState(null)
        setPolygonDrawing(null)
      }
      return !prev
    })
  }

  // ── Derived UI flags ──────────────────────────────────────────────────
  const isDrawing = !!polygonDrawing
  const canFinish = polygonDrawing && polygonDrawing.points.length >= 3

  return (
    <div className="vr-demo-page">

      {/* ── Fullscreen panorama viewer ────────────────────────────────── */}
      <VRViewer
        src={activeScene.src}
        hotspots={hotspots}
        polygonAnchors={activePolygonAnchors}
        editMode={editMode}
        onSceneClick={handleSceneClick}
      />

      {/* ── Scene label overlay (top-left) ───────────────────────────── */}
      <div className="vr-scene-label">
        <span className="vr-scene-label-tag">360°</span>
        {activeScene.label}
      </div>

      {/* ── Top-right controls ───────────────────────────────────────── */}
      <div className="vr-top-right">
        {!editMode && !activeAnchor && (
          <span className="vr-hint-inline">Drag to look around · Scroll to zoom</span>
        )}
        {editMode && !isDrawing && !editingAnchor && !pickerState && (
          <span className="vr-hint-inline vr-hint-inline--edit">Click scene to place anchor</span>
        )}
        <button
          className={`vr-edit-btn ${editMode ? 'vr-edit-btn--active' : ''}`}
          onClick={handleToggleEditMode}
        >
          {editMode ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Done
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Anchors
            </>
          )}
        </button>
      </div>

      {/* ── Polygon drawing toolbar (center bottom, above strip) ─────── */}
      {isDrawing && (
        <div className="vr-poly-bar">
          <span className="vr-poly-bar-count">
            {polygonDrawing.points.length} point{polygonDrawing.points.length !== 1 ? 's' : ''}
            {!canFinish && <span className="vr-poly-bar-hint"> · need {3 - polygonDrawing.points.length} more</span>}
          </span>
          <div className="vr-poly-bar-actions">
            <button
              className="vr-poly-btn vr-poly-btn--undo"
              onClick={handleUndoPoint}
            >
              Undo
            </button>
            <button
              className={`vr-poly-btn vr-poly-btn--finish ${!canFinish ? 'vr-poly-btn--disabled' : ''}`}
              onClick={handleFinishPolygon}
              disabled={!canFinish}
            >
              Finish Polygon
            </button>
            <button
              className="vr-poly-btn vr-poly-btn--cancel"
              onClick={() => setPolygonDrawing(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Anchor type picker ───────────────────────────────────────── */}
      {pickerState && (
        <AnchorTypePicker
          screenX={pickerState.screenX}
          screenY={pickerState.screenY}
          onPick={handlePickType}
          onDismiss={() => setPickerState(null)}
        />
      )}

      {/* ── Anchor detail panel (view mode) ──────────────────────────── */}
      {!editMode && (
        <VRAnchorPanel
          anchor={activeAnchor}
          onClose={() => setActiveAnchor(null)}
        />
      )}

      {/* ── Anchor editor panel (edit mode) ──────────────────────────── */}
      {editMode && editingAnchor && (
        <VRAnchorEditor
          anchor={editingAnchor.anchor}
          isNew={editingAnchor.isNew}
          onSave={handleSaveAnchor}
          onDelete={handleDeleteAnchor}
          onCancel={() => setEditingAnchor(null)}
          availableImages={SCENE_IMAGES}
        />
      )}

      {/* ── Scene selector strip (bottom) ────────────────────────────── */}
      <div className="vr-strip">
        {scenesData.map((scene, i) => (
          <button
            key={scene.id}
            className={`vr-thumb ${scene.id === activeId ? 'vr-thumb--active' : ''}`}
            style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            onClick={() => handleSceneChange(scene.id)}
          >
            <img src={scene.src} alt={scene.label} className="vr-thumb-img" />
            <span className="vr-thumb-label">{scene.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
