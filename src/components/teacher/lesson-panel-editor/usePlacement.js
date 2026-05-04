import { useState } from 'react'

export function usePlacement(setDrawerOpen) {
  const [anchorMenu,         setAnchorMenu]         = useState(null)
  const [focusAnchor,        setFocusAnchor]        = useState(null)
  const [placementMode,      setPlacementMode]      = useState(null)
  const [placementContext,   setPlacementContext]   = useState(null)
  const [newAnchorPlacement, setNewAnchorPlacement] = useState(null)
  const [polyPoints,         setPolyPoints]         = useState([])
  const [newPolyPlacement,   setNewPolyPlacement]   = useState(null)
  const [newPolyPoint,       setNewPolyPoint]       = useState(null)
  const [activePolyPoints,   setActivePolyPoints]   = useState(null)

  function handleSceneClick(lon, lat) {
    if (!placementMode) return
    const lonR = lon * Math.PI / 180
    const latR = lat * Math.PI / 180
    const r = 500
    const x = parseFloat((r * Math.cos(latR) * Math.cos(lonR)).toFixed(2))
    const y = parseFloat((r * Math.sin(latR)).toFixed(2))
    const z = parseFloat((r * Math.cos(latR) * Math.sin(lonR)).toFixed(2))

    if (placementMode === 'poly') {
      setPolyPoints(prev => [...prev, { lon, lat, x, y, z, order: prev.length }])
      return
    }

    if (placementMode === 'poly_pt' || placementMode === 'poly_pt_move') {
      setNewPolyPoint({ lon, lat, x, y, z, ...placementContext, ts: Date.now() })
      setPlacementMode(null)
      setPlacementContext(null)
      return
    }

    setNewAnchorPlacement({ type: placementMode, lon, lat, x, y, z, ts: Date.now() })
    setPlacementMode(null)
  }

  function handleEnterPlacement(type, context = null) {
    setPlacementMode(type)
    setPlacementContext(context)
  }

  function handleFinishPolygon() {
    if (polyPoints.length < 3) return
    setDrawerOpen(true)
    setNewPolyPlacement({ points: polyPoints, ts: Date.now() })
    setPolyPoints([])
    setPlacementMode(null)
  }

  function handleCancelPolyPlacement() {
    setPolyPoints([])
    setPlacementMode(null)
    setPlacementContext(null)
  }

  function handleCancelPlacement() {
    setPlacementMode(null)
    setPlacementContext(null)
  }

  function handleAnchorEdit() {
    const { anchor, anchorType } = anchorMenu
    setAnchorMenu(null)
    setDrawerOpen(true)
    setFocusAnchor({ anchor, type: anchorType, ts: Date.now() })
  }

  return {
    anchorMenu, setAnchorMenu,
    focusAnchor,
    placementMode,
    newAnchorPlacement, setNewAnchorPlacement,
    polyPoints, setPolyPoints,
    newPolyPlacement, setNewPolyPlacement,
    newPolyPoint, setNewPolyPoint,
    activePolyPoints, setActivePolyPoints,
    handleSceneClick,
    handleEnterPlacement,
    handleFinishPolygon,
    handleCancelPolyPlacement,
    handleCancelPlacement,
    handleAnchorEdit,
  }
}
