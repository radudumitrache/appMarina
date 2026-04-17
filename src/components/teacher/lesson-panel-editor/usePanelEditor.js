import { useState, useEffect } from 'react'
import { VR_SCENES, buildSceneUrl } from '../../shared/VRSceneRenderer'
import {
  getLesson,
  getPanels,
  createPanel,
  updatePanel,
  deletePanel,
  deleteTextAnchor,
  deleteNavigatorAnchor,
} from '../../../api/lessons'

/* ── usePanelEditor ─────────────────────────────────────────────────────────
 * Encapsulates all state and CRUD logic for the LessonPanelEditor page.
 *
 * Parameters:
 *   lessonId       {string}       route param (:id)
 *   initialLesson  {object|null}  lesson object passed via router state (optional)
 *
 * Returns all state values, derived values, and handlers needed by the page
 * and its sub-components.
 */
export function usePanelEditor(lessonId, initialLesson) {
  const [lesson,           setLesson]           = useState(initialLesson ?? null)
  const [panels,           setPanels]           = useState([])
  const [panelIdx,         setPanelIdx]         = useState(0)
  const [loading,          setLoading]          = useState(true)
  const [saving,           setSaving]           = useState(false)
  const [error,            setError]            = useState(null)
  const [drawerOpen,       setDrawerOpen]       = useState(false)
  const [deleteTarget,     setDeleteTarget]     = useState(null)
  const [addMenuOpen,      setAddMenuOpen]      = useState(false)
  const [activeTextAnchor, setActiveTextAnchor] = useState(null)

  /* ── Fetch ──────────────────────────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true)
    const calls = lesson ? [getPanels(lessonId)] : [getLesson(lessonId), getPanels(lessonId)]
    Promise.all(calls)
      .then(results => {
        if (!lesson) {
          setLesson(results[0].data)
          setPanels([...results[1].data].sort((a, b) => a.order - b.order))
        } else {
          setPanels([...results[0].data].sort((a, b) => a.order - b.order))
        }
      })
      .catch(() => setError('Could not load lesson panels.'))
      .finally(() => setLoading(false))
  }, [lessonId])

  /* ── Close transient UI on panel change ────────────────────────────────── */
  useEffect(() => {
    setDrawerOpen(false)
    setAddMenuOpen(false)
  }, [panelIdx])

  /* ── Derived ────────────────────────────────────────────────────────────── */
  const panel = panels[panelIdx] ?? null

  /* ── Sync anchor changes back into panels state ─────────────────────────── */
  function handleAnchorsChange(textAnchors, navAnchors, polyAnchors) {
    setPanels(prev => prev.map(p =>
      p.id !== panel?.id ? p : {
        ...p,
        vr_tour: { ...p.vr_tour, text_anchors: textAnchors, navigator_anchors: navAnchors, polygon_anchors: polyAnchors },
      }
    ))
  }

  /* ── Panel CRUD ─────────────────────────────────────────────────────────── */
  async function handleAddPanel(type) {
    setAddMenuOpen(false)
    const isText  = type === 'text'
    const payload = {
      type,
      title: isText ? 'New Text Panel' : 'New VR Tour',
      order: panels.length,
      ...(isText ? { body: '' } : { scene_url: buildSceneUrl(VR_SCENES[0].filename) }),
    }
    setSaving(true)
    try {
      const res = await createPanel(lessonId, payload)
      setPanels(prev => {
        const next = [...prev, res.data]
        setPanelIdx(next.length - 1)
        return next
      })
      setDrawerOpen(true)
    } catch {
      setError('Could not add panel.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePanel(panelId, data) {
    setSaving(true)
    try {
      const res = await updatePanel(lessonId, panelId, data)
      setPanels(prev => prev.map(p => p.id === panelId ? res.data : p))
    } catch {
      setError('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeletePanel(panelId) {
    setSaving(true)
    setDrawerOpen(false)
    try {
      await deletePanel(lessonId, panelId)
      setPanels(prev => {
        const idx  = prev.findIndex(p => p.id === panelId)
        const next = prev.filter(p => p.id !== panelId)
        setPanelIdx(Math.min(idx, next.length - 1))
        return next
      })
    } catch {
      setError('Could not delete panel.')
    } finally {
      setSaving(false)
      setDeleteTarget(null)
    }
  }

  async function handleMove(direction) {
    const toIdx = panelIdx + direction
    if (toIdx < 0 || toIdx >= panels.length) return
    const next = [...panels]
    ;[next[panelIdx], next[toIdx]] = [next[toIdx], next[panelIdx]]
    const withOrder = next.map((p, i) => ({ ...p, order: i }))
    setPanels(withOrder)
    setPanelIdx(toIdx)
    try {
      await Promise.all([
        updatePanel(lessonId, withOrder[panelIdx].id, { order: withOrder[panelIdx].order }),
        updatePanel(lessonId, withOrder[toIdx].id,    { order: withOrder[toIdx].order    }),
      ])
    } catch {
      setPanels(panels)
      setPanelIdx(panelIdx)
    }
  }

  async function handleQuickDeleteAnchor(anchorType, anchorId) {
    try {
      if (anchorType === 'text') {
        await deleteTextAnchor(lessonId, panel.id, anchorId)
        setPanels(prev => prev.map(p =>
          p.id !== panel?.id ? p : {
            ...p,
            vr_tour: { ...p.vr_tour, text_anchors: p.vr_tour.text_anchors.filter(a => a.id !== anchorId) },
          }
        ))
      } else {
        await deleteNavigatorAnchor(lessonId, panel.id, anchorId)
        setPanels(prev => prev.map(p =>
          p.id !== panel?.id ? p : {
            ...p,
            vr_tour: { ...p.vr_tour, navigator_anchors: p.vr_tour.navigator_anchors.filter(a => a.id !== anchorId) },
          }
        ))
      }
    } catch {
      setError('Could not delete anchor.')
    }
  }

  return {
    // state
    lesson, panels, panelIdx, setPanelIdx,
    loading, saving,
    error, setError,
    drawerOpen, setDrawerOpen,
    deleteTarget, setDeleteTarget,
    addMenuOpen, setAddMenuOpen,
    activeTextAnchor, setActiveTextAnchor,
    // derived
    panel,
    // handlers
    handleAnchorsChange,
    handleAddPanel,
    handleSavePanel,
    handleDeletePanel,
    handleMove,
    handleQuickDeleteAnchor,
  }
}
