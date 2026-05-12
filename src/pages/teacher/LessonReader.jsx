import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getLesson, getPanels } from '../../api/lessons'
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

  const [lesson,   setLesson]   = useState(state?.lesson ?? null)
  const [panels,   setPanels]   = useState([])
  const [panelIdx, setPanelIdx] = useState(0)
  const [anchor,   setAnchor]   = useState(null)
  const [tourId,   setTourId]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([getLesson(id), getPanels(id)])
      .then(([lessonRes, panelsRes]) => {
        setLesson(lessonRes.data)
        const sorted = [...panelsRes.data].sort((a, b) => a.order - b.order)
        setPanels(sorted)
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

  const hotspots = useMemo(() => {
    if (!activeTour) return []
    const out = []
    for (const ta of activeTour.text_anchors ?? []) {
      const { lon, lat } = vec3ToLonLat(ta.pos_x, ta.pos_y, ta.pos_z)
      out.push({ id: `ta-${ta.id}`, lon, lat, label: ta.title, className: 'vr-hotspot--anchor', onClick: () => setAnchor(ta) })
    }
    for (const na of activeTour.navigator_anchors ?? []) {
      const { lon, lat } = vec3ToLonLat(na.pos_x, na.pos_y, na.pos_z)
      const idx = panels.findIndex(p => p.id === na.target_panel)
      out.push({ id: `na-${na.id}`, lon, lat, label: na.title || 'Go →', className: 'vr-hotspot--anchor vr-hotspot--nav', onClick: () => {
        if (idx !== -1) { setAnchor(null); setPanelIdx(idx) }
      } })
    }
    return out
  }, [activeTour, panels])

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
          <button className="lr-state-btn" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="lr-page">
      <LessonTopBar
        lessonTitle={lesson?.title ?? `Lesson ${id}`}
        panelIdx={panelIdx}
        panelCount={panels.length}
        onBack={() => navigate(-1)}
        onPrev={() => setPanelIdx(i => i - 1)}
        onNext={() => setPanelIdx(i => i + 1)}
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
