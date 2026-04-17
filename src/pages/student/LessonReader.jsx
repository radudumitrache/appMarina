import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import VRViewer from '../../components/shared/VRViewer'
import { getPanels } from '../../api/lessons'
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

/* ── Anchor info popup (floats over the VR viewer) ───────────────────────── */
/* Handles both text anchors (anchor.description) and polygon anchors (anchor.content) */
function AnchorPopup({ anchor, onClose }) {
  if (!anchor) return null
  const body = anchor.description ?? anchor.content ?? ''
  return (
    <aside className="lr-anchor-popup">
      <button className="lr-anchor-close" onClick={onClose} aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <h3 className="lr-anchor-title">{anchor.title}</h3>
      <div className="lr-anchor-divider" />
      <p className="lr-anchor-body">{body}</p>
    </aside>
  )
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function LessonReader() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { state }   = useLocation()

  // Lesson metadata comes from navigation state (passed by LessonCard click).
  // This avoids a GET /api/lessons/{pk}/ call that returns 404 when the detail
  // endpoint is not yet exposed, as documented in PANELS_AND_VR.md.
  const [lesson,   setLesson]   = useState(state?.lesson ?? null)
  const [panels,   setPanels]   = useState([])
  const [panelIdx, setPanelIdx] = useState(0)
  const [anchor,   setAnchor]   = useState(null)   // active text-anchor or polygon-anchor popup
  const [tourId,   setTourId]   = useState(null)   // active VRTour id (navigator anchors)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  /* ── Fetch panels only — lesson metadata arrives via navigation state ── */
  useEffect(() => {
    setLoading(true)
    getPanels(id)
      .then(res => {
        const sorted = [...res.data].sort((a, b) => a.order - b.order)
        setPanels(sorted)
      })
      .catch(err => {
        // 403 means the backend hasn't yet opened panel reads to students.
        // Show an actionable message rather than a generic error.
        if (err?.response?.status === 403) {
          setError('Panel content is not yet available for students. Ask your teacher to publish this lesson.')
        } else {
          setError('Could not load lesson content.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  /* ── Reset per-panel state when panel changes ────────────────────────── */
  const panel = panels[panelIdx] ?? null

  useEffect(() => {
    setAnchor(null)
    setTourId(panel?.vr_tour?.id ?? null)
  }, [panelIdx, panel])

  /* ── Resolve the currently-displayed VR tour ─────────────────────────── */
  const activeTour = useMemo(() => {
    if (!panel?.vr_tour) return null
    if (tourId === panel.vr_tour.id || tourId == null) return panel.vr_tour
    // Navigator anchor switched to a different tour — find it in any panel
    for (const p of panels) {
      if (p.vr_tour?.id === tourId) return p.vr_tour
    }
    return panel.vr_tour
  }, [tourId, panel, panels])

  /* ── Build VRViewer hotspots from the active tour's anchors ─────────── */
  const hotspots = useMemo(() => {
    if (!activeTour) return []
    const out = []

    for (const ta of activeTour.text_anchors ?? []) {
      const { lon, lat } = vec3ToLonLat(ta.pos_x, ta.pos_y, ta.pos_z)
      out.push({
        id: `ta-${ta.id}`,
        lon, lat,
        label: ta.title,
        className: 'vr-hotspot--anchor',
        onClick: () => setAnchor(ta),
      })
    }

    for (const na of activeTour.navigator_anchors ?? []) {
      const { lon, lat } = vec3ToLonLat(na.pos_x, na.pos_y, na.pos_z)
      out.push({
        id: `na-${na.id}`,
        lon, lat,
        label: 'Go →',
        className: 'vr-hotspot--anchor vr-hotspot--nav',
        onClick: () => {
          setAnchor(null)
          setTourId(na.target_vr_tour)
        },
      })
    }

    return out
  }, [activeTour])

  /* ── Build polygon anchors for VRViewer ──────────────────────────────── */
  const polygonAnchors = useMemo(() => {
    if (!activeTour) return []
    return (activeTour.polygon_anchors ?? []).map(pa => ({
      ...pa,
      onClick: (clicked) => setAnchor(clicked),
    }))
  }, [activeTour])

  /* ── Render ──────────────────────────────────────────────────────────── */
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

  return (
    <div className="lr-page">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="lr-topbar">
        <button className="lr-back-btn" onClick={() => navigate('/student/lessons')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Lessons
        </button>

        <div className="lr-topbar-center">
          <span className="lr-lesson-title">{lesson?.title ?? `Lesson ${id}`}</span>
        </div>

        <div className="lr-topbar-right">
          {panels.length > 0 && (
            <span className="lr-panel-counter">
              <span className="lr-panel-cur">{panelIdx + 1}</span>
              <span className="lr-panel-sep"> / </span>
              <span className="lr-panel-tot">{panels.length}</span>
            </span>
          )}
          <button
            className="lr-nav-btn"
            disabled={panelIdx === 0}
            onClick={() => setPanelIdx(i => i - 1)}
            title="Previous panel"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button
            className="lr-nav-btn"
            disabled={panelIdx === panels.length - 1}
            onClick={() => setPanelIdx(i => i + 1)}
            title="Next panel"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      {panels.length === 0 ? (
        <div className="lr-state">
          <span>This lesson has no content yet.</span>
        </div>

      ) : panel?.type === 'vr_tour' ? (
        /* ── VR panel ─────────────────────────────────────────────────── */
        <div className="lr-vr-wrap">

          <VRViewer src={activeTour?.scene_url} hotspots={hotspots} polygonAnchors={polygonAnchors} />

          {/* Scene label */}
          <div className="lr-vr-label">
            <span className="lr-vr-tag">360°</span>
            {panel.title}
          </div>

          {/* Drag hint */}
          {!anchor && (
            <div className="lr-vr-hint">Drag to look around · Scroll to zoom</div>
          )}

          {/* Text-anchor popup */}
          <AnchorPopup anchor={anchor} onClose={() => setAnchor(null)} />

          {/* Panel navigation strip at the bottom */}
          <div className="lr-vr-strip">
            {panels.map((p, i) => (
              <button
                key={p.id}
                className={`lr-strip-btn ${i === panelIdx ? 'lr-strip-btn--active' : ''}`}
                onClick={() => setPanelIdx(i)}
              >
                <span className="lr-strip-type">{p.type === 'vr_tour' ? '360°' : 'TXT'}</span>
                <span className="lr-strip-name">{p.title}</span>
              </button>
            ))}
          </div>
        </div>

      ) : (
        /* ── Text panel ───────────────────────────────────────────────── */
        <div className="lr-text-layout">

          <aside className="lr-text-sidebar">
            <div className="lr-sidebar-label">Panels</div>
            <nav className="lr-sidebar-nav">
              {panels.map((p, i) => (
                <button
                  key={p.id}
                  className={`lr-sidebar-btn ${i === panelIdx ? 'lr-sidebar-btn--active' : ''}`}
                  onClick={() => setPanelIdx(i)}
                >
                  <span className="lr-sidebar-num">{String(i + 1).padStart(2, '0')}</span>
                  <div className="lr-sidebar-meta">
                    <span className="lr-sidebar-name">{p.title}</span>
                    <span className="lr-sidebar-kind">
                      {p.type === 'vr_tour' ? '360° Tour' : 'Text'}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </aside>

          <main className="lr-text-main">
            <h1 className="lr-text-heading">{panel.title}</h1>
            <div className="lr-text-body">
              {panel.text_content?.body ?? ''}
            </div>
          </main>

        </div>
      )}

    </div>
  )
}
