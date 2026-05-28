import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getLesson, getPanels, getAnchorInteractions, recordAnchorInteraction } from '../../api/lessons'
import LessonTopBar from '../../components/student/lesson-reader/LessonTopBar'
import VRPanel from '../../components/student/lesson-reader/VRPanel'
import TextPanel from '../../components/student/lesson-reader/TextPanel'
import '../css/student/LessonReader.css'

function vec3ToLonLat(px, py, pz) {
  const r  = Math.sqrt(px * px + py * py + pz * pz) || 1
  const ny = py / r
  const nx = px / r
  const nz = pz / r
  const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, ny))) * 180 / Math.PI)
  const lon = Math.atan2(nz, nx) * 180 / Math.PI
  return { lon, lat }
}

export default function TeacherLessonReader() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { state } = useLocation()

  const [lesson,       setLesson]       = useState(state?.lesson ?? null)
  const [panels,       setPanels]       = useState([])
  const [panelIdx,     setPanelIdx]     = useState(0)
  const [anchor,       setAnchor]       = useState(null)
  const [tourId,       setTourId]       = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [interactions, setInteractions] = useState(new Set())
  const [lookDir,      setLookDir]      = useState({ lon: 0, lat: 0 })
  const [navConfirm,   setNavConfirm]   = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([getLesson(id), getPanels(id), getAnchorInteractions(id)])
      .then(([lessonRes, panelsRes, intRes]) => {
        setLesson(lessonRes.data)
        const sorted = [...panelsRes.data].sort((a, b) => a.order - b.order)
        setPanels(sorted)
        setInteractions(new Set(
          (intRes.data ?? []).map(i => `${i.panel_id}:${i.anchor_type}:${i.anchor_id}`)
        ))
      })
      .catch(() => setError('Could not load lesson content.'))
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
    for (const p of panels) {
      if (p.vr_tour?.id === tourId) return p.vr_tour
    }
    return panel.vr_tour
  }, [tourId, panel, panels])

  const currentPanelId = useMemo(
    () => panels.find(p => p.vr_tour?.id === activeTour?.id)?.id ?? null,
    [panels, activeTour],
  )

  function recordInteraction(panelId, anchorType, anchorId) {
    if (!panelId) return
    const key = `${panelId}:${anchorType}:${anchorId}`
    setInteractions(prev => {
      if (prev.has(key)) return prev
      recordAnchorInteraction(id, { panel_id: panelId, anchor_type: anchorType, anchor_id: anchorId })
        .catch(() => {})
      return new Set([...prev, key])
    })
  }

  const hotspots = useMemo(() => {
    if (!activeTour) return []
    const out = []
    for (const ta of activeTour.text_anchors ?? []) {
      const { lon, lat } = vec3ToLonLat(ta.pos_x, ta.pos_y, ta.pos_z)
      out.push({
        id: `ta-${ta.id}`, lon, lat, label: ta.title,
        show_title: ta.show_title, title_size: ta.title_size, title_text_color: ta.title_text_color,
        className: 'vr-hotspot--anchor',
        visited: interactions.has(`${currentPanelId}:text:${ta.id}`),
        onClick: () => { recordInteraction(currentPanelId, 'text', ta.id); setAnchor(ta) },
      })
    }
    for (const na of activeTour.navigator_anchors ?? []) {
      const { lon, lat } = vec3ToLonLat(na.pos_x, na.pos_y, na.pos_z)
      const idx = panels.findIndex(p => p.id === na.target_panel)
      out.push({
        id: `na-${na.id}`, lon, lat, label: na.title || 'Go →',
        show_title: na.show_title, title_size: na.title_size, title_text_color: na.title_text_color,
        className: 'vr-hotspot--anchor vr-hotspot--nav',
        visited: interactions.has(`${currentPanelId}:navigator:${na.id}`),
        onClick: () => {
          recordInteraction(currentPanelId, 'navigator', na.id)
          if (idx !== -1) {
            const targetPanel = panels[idx]
            setNavConfirm({
              idx,
              label: targetPanel?.title || na.title || 'next panel',
              description: na.description ?? null,
              targetLon: na.target_lon ?? 0,
              targetLat: na.target_lat ?? 0,
            })
          }
        },
      })
    }
    return out
  }, [activeTour, panels, interactions, currentPanelId])

  const polygonAnchors = useMemo(() => {
    if (!activeTour) return []
    return (activeTour.polygon_anchors ?? []).map(pa => ({
      ...pa,
      visited: interactions.has(`${currentPanelId}:polygon:${pa.id}`),
      onClick: (clicked) => { recordInteraction(currentPanelId, 'polygon', clicked.id); setAnchor(clicked) },
    }))
  }, [activeTour, interactions, currentPanelId])

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
          <button className="lr-state-btn" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    )
  }

  const confirmNav = () => {
    if (!navConfirm) return
    setLookDir({ lon: navConfirm.targetLon, lat: navConfirm.targetLat })
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
              You are about to leave the current scene and go to <strong>{navConfirm.label}</strong>.
            </p>
            {navConfirm.description && (
              <div
                className="lr-nav-body lr-prose"
                style={{ marginTop: -4, textAlign: 'left' }}
                dangerouslySetInnerHTML={{ __html: navConfirm.description }}
              />
            )}
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
        onBack={() => navigate(-1)}
        onPrev={() => { setLookDir({ lon: 0, lat: 0 }); setPanelIdx(i => i - 1) }}
        onNext={() => { setLookDir({ lon: 0, lat: 0 }); setPanelIdx(i => i + 1) }}
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
          visitedAnchors={hotspots.filter(h => h.visited).length + polygonAnchors.filter(p => p.visited).length}
          totalAnchors={(activeTour?.text_anchors?.length ?? 0) + (activeTour?.navigator_anchors?.length ?? 0) + (activeTour?.polygon_anchors?.length ?? 0)}
          initialLon={lookDir.lon}
          initialLat={lookDir.lat}
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
