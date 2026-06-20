import { useState, useEffect } from 'react'
import {
  getModule,
  getPanels,
  createPanel,
  updatePanel,
  deletePanel,
  deleteTextAnchor,
  deleteNavigatorAnchor,
} from '../../../api/modules'

/* â”€â”€ usePanelEditor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Encapsulates all state and CRUD logic for the ModulePanelEditor page.
 *
 * Parameters:
 *   moduleId       {string}       route param (:id)
 *   initialModule  {object|null}  module object passed via router state (optional)
 *
 * Returns all state values, derived values, and handlers needed by the page
 * and its sub-components.
 */
export function usePanelEditor(moduleId, initialModule) {
  const [module,           setModule]           = useState(initialModule ?? null)
  const [panels,           setPanels]           = useState([])
  const [panelIdx,         setPanelIdx]         = useState(0)
  const [loading,          setLoading]          = useState(true)
  const [saving,           setSaving]           = useState(false)
  const [error,            setError]            = useState(null)
  const [drawerOpen,       setDrawerOpen]       = useState(false)
  const [deleteTarget,     setDeleteTarget]     = useState(null)
  const [addMenuOpen,      setAddMenuOpen]      = useState(false)
  const [activeTextAnchor, setActiveTextAnchor] = useState(null)

  /* â”€â”€ Fetch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useEffect(() => {
    setLoading(true)
    const calls = module ? [getPanels(moduleId)] : [getModule(moduleId), getPanels(moduleId)]
    Promise.all(calls)
      .then(results => {
        if (!module) {
          setModule(results[0].data)
          setPanels([...results[1].data].sort((a, b) => a.order - b.order))
        } else {
          setPanels([...results[0].data].sort((a, b) => a.order - b.order))
        }
      })
      .catch(() => setError('Could not load module panels.'))
      .finally(() => setLoading(false))
  }, [moduleId])

  /* â”€â”€ Close transient UI on panel change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  useEffect(() => {
    setAddMenuOpen(false)
  }, [panelIdx])

  /* â”€â”€ Derived â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const panel = panels[panelIdx] ?? null

  /* â”€â”€ Sync anchor changes back into panels state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function handleAnchorsChange(textAnchors, navAnchors, polyAnchors) {
    setPanels(prev => prev.map(p =>
      p.id !== panel?.id ? p : {
        ...p,
        vr_tour: { ...p.vr_tour, text_anchors: textAnchors, navigator_anchors: navAnchors, polygon_anchors: polyAnchors },
      }
    ))
  }

  /* â”€â”€ Panel CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  async function handleAddPanel(type) {
    setAddMenuOpen(false)
    const isText  = type === 'text'
    const payload = {
      type,
      title: isText ? 'New Text Panel' : 'New VR Tour',
      order: panels.length,
      ...(isText ? { body: '<p></p>' } : {}),
    }
    setSaving(true)
    try {
      const res = await createPanel(moduleId, payload)
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
      const res = await updatePanel(moduleId, panelId, data)
      setPanels(prev => prev.map(p => {
        if (p.id !== panelId) return p
        // Keep local anchor data (preserves descriptions not returned by update endpoint)
        // but always take scene_url / media_file from the server response.
        return {
          ...res.data,
          vr_tour: p.vr_tour
            ? {
                ...p.vr_tour,
                scene_url:  res.data.vr_tour?.scene_url,
                media_file: res.data.vr_tour?.media_file,
              }
            : res.data.vr_tour,
        }
      }))
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
      await deletePanel(moduleId, panelId)
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
        updatePanel(moduleId, withOrder[panelIdx].id, { order: withOrder[panelIdx].order }),
        updatePanel(moduleId, withOrder[toIdx].id,    { order: withOrder[toIdx].order    }),
      ])
    } catch {
      setPanels(panels)
      setPanelIdx(panelIdx)
    }
  }

  async function handleQuickDeleteAnchor(anchorType, anchorId) {
    try {
      if (anchorType === 'text') {
        await deleteTextAnchor(moduleId, panel.id, anchorId)
        setPanels(prev => prev.map(p =>
          p.id !== panel?.id ? p : {
            ...p,
            vr_tour: { ...p.vr_tour, text_anchors: p.vr_tour.text_anchors.filter(a => a.id !== anchorId) },
          }
        ))
      } else {
        await deleteNavigatorAnchor(moduleId, panel.id, anchorId)
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
    module, panels, panelIdx, setPanelIdx,
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
