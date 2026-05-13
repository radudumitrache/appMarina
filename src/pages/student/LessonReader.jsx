import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getLesson, getPanels, completeLesson, uncompleteLesson } from '../../api/lessons'
import LessonTopBar from '../../components/student/lesson-reader/LessonTopBar'
import VRPanel from '../../components/student/lesson-reader/VRPanel'
import TextPanel from '../../components/student/lesson-reader/TextPanel'
import '../css/student/LessonReader.css'

/**
 * Convert backend anchor world-space coordinates (pos_x, pos_y, pos_z)
 * to panorama spherical coordinates (lon, lat degrees) for VRViewer.
 *
 * The VRViewer sphere convention (from VRViewer.jsx):
 *   x = r · sin(phi) · cos(theta)
 *   y = r · cos(phi)              ← y is the up axis
 *   z = r · sin(phi) · sin(theta)
 * where phi = 90° − lat, theta = lon
 *
 * Inverting: lat = 90° − acos(ny), lon = atan2(nz, nx)
 */
function vec3ToLonLat(px, py, pz) {
  const r  = Math.sqrt(px * px + py * py + pz * pz) || 1
  const ny = py / r
  const nx = px / r
  const nz = pz / r
  const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, ny))) * 180 / Math.PI)
  const lon = Math.atan2(nz, nx) * 180 / Math.PI
  return { lon, lat }
}

export default function LessonReader() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { state } = useLocation()

  const [lesson,   setLesson]   = useState(state?.lesson ?? null)
  const [panels,   setPanels]   = useState([])
  const [panelIdx, setPanelIdx] = useState(0)
  const [anchor,     setAnchor]     = useState(null)
  const [tourId,     setTourId]     = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [navConfirm,  setNavConfirm]  = useState(null) // { idx, label }
  const [completed,   setCompleted]   = useState(false)
  const [completing,  setCompleting]  = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([getLesson(id), getPanels(id)])
      .then(([lessonRes, panelsRes]) => {
        setLesson(lessonRes.data)
        setCompleted(lessonRes.data.completed ?? false)
        const sorted = [...panelsRes.data].sort((a, b) => a.order - b.order)
        setPanels(sorted)
      })
      .catch(err => {
        if (err?.response?.status === 403) {
          setError('You are not enrolled in a class that includes this lesson.')
        } else {
          setError('Could not load lesson content.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const panel = panels[panelIdx] ?? null

  useEffect(() => {
    setAnchor(null)
    setTourId(panel?.vr_tour?.id ?? null)
  }, [panelIdx, panel])

  const activeTour = useMemo(() => {
    if (!panel?.vr_tour) return null
    if (tourId === panel.vr_tour.id || tourId == null) return panel.vr_tour
    // Navigator anchor switched to a different tour — find it in any panel
    for (const p of panels) {
      if (p.vr_tour?.id === tourId) return p.vr_tour
    }
    return panel.vr_tour
  }, [tourId, panel, panels])

  const hotspots = useMemo(() => {
    if (!activeTour) return []
    const out = []
    for (const ta of activeTour.text_anchors ?? []) {
      const { lon, lat } = vec3ToLonLat(ta.pos_x, ta.pos_y, ta.pos_z)
      out.push({ id: `ta-${ta.id}`, lon, lat, label: ta.title, className: 'vr-hotspot--anchor', onClick: () => setAnchor(ta) })
    }
    for (const na of activeTour.navigator_anchors ?? []) {
      const { lon, lat } = vec3ToLonLat(na.pos_x, na.pos_y, na.pos_z)
      out.push({ id: `na-${na.id}`, lon, lat, label: na.title || 'Go →', className: 'vr-hotspot--anchor vr-hotspot--nav', onClick: () => {
        const idx = panels.findIndex(p => p.id === na.target_panel)
        if (idx !== -1) {
          const targetPanel = panels[idx]
          setNavConfirm({ idx, label: targetPanel?.title || na.title || 'next panel' })
        }
      } })
    }
    return out
  }, [activeTour])

  const polygonAnchors = useMemo(() => {
    if (!activeTour) return []
    return (activeTour.polygon_anchors ?? []).map(pa => ({ ...pa, onClick: (clicked) => setAnchor(clicked) }))
  }, [activeTour])

  if (loading) {
    return (
      <div className="lr-page">
        <div className="lr-loading"><div className="lr-spinner" /></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lr-page">
        <div className="lr-state">
          <span>{error}</span>
          <button className="lr-state-btn" onClick={() => navigate('/student/lessons')}>Back to Lessons</button>
        </div>
      </div>
    )
  }

  const handleToggleComplete = async () => {
    const wasComplete = completed
    setCompleted(!wasComplete)
    setCompleting(true)
    try {
      if (wasComplete) await uncompleteLesson(id)
      else await completeLesson(id)
    } catch {
      setCompleted(wasComplete)
    } finally {
      setCompleting(false)
    }
  }

  const confirmNav = () => {
    if (!navConfirm) return
    setAnchor(null)
    setPanelIdx(navConfirm.idx)
    setNavConfirm(null)
  }

  return (
    <div className="lr-page">
      {navConfirm && (
        <div className="lr-nav-backdrop">
          <div className="lr-nav-dialog">
            <div className="lr-nav-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
            <h4 className="lr-nav-title">Navigate to next panel?</h4>
            <p className="lr-nav-body">
              You are about to leave the current scene and go to <strong>{navConfirm.label}</strong>. Make sure you have reviewed everything before continuing.
            </p>
            <div className="lr-nav-actions">
              <button className="lr-nav-btn lr-nav-btn--cancel" onClick={() => setNavConfirm(null)}>Stay here</button>
              <button className="lr-nav-btn lr-nav-btn--confirm" onClick={confirmNav}>Continue</button>
            </div>
          </div>
        </div>
      )}
      <LessonTopBar
        lessonTitle={lesson?.title ?? `Lesson ${id}`}
        panelIdx={panelIdx}
        panelCount={panels.length}
        completed={completed}
        completing={completing}
        onBack={() => navigate('/student/lessons')}
        onPrev={() => setPanelIdx(i => i - 1)}
        onNext={() => setPanelIdx(i => i + 1)}
        onToggleComplete={handleToggleComplete}
      />

      {panels.length === 0 ? (
        <div className="lr-state">
          <span>This lesson has no content yet.</span>
        </div>

      ) : panel?.type === 'vr_tour' ? (
        <VRPanel
          activeTour={activeTour}
          hotspots={hotspots}
          polygonAnchors={polygonAnchors}
          panel={panel}
          panels={panels}
          panelIdx={panelIdx}
          onPanelChange={setPanelIdx}
          anchor={anchor}
          onAnchorClose={() => setAnchor(null)}
        />
      ) : (
        <TextPanel
          panel={panel}
          panels={panels}
          panelIdx={panelIdx}
          onPanelChange={setPanelIdx}
        />
      )}
    </div>
  )
}
