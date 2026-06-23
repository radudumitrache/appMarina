import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import * as THREE from 'three'
import '../../css/admin/submission-overview/VRLocalizationReview.css'

const SPHERE_R  = 500
const MARKER_AT = SPHERE_R * 0.94

function parseVec(str) {
  if (!str) return null
  const parts = str.split(',').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return null
  return new THREE.Vector3(parts[0], parts[1], parts[2])
}

function makeCircleSprite(color) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, 64, 64)
  ctx.beginPath()
  ctx.arc(32, 32, 24, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 6
  ctx.stroke()
  const tex = new THREE.CanvasTexture(c)
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }))
  spr.scale.set(32, 32, 1)
  return { spr, tex }
}

export default function VRLocalizationReview({ sceneUrl, studentPosStr, polygonPoints = [], anchorPos }) {
  const wrapRef    = useRef(null)
  const mountRef   = useRef(null)
  const studentVec = useMemo(() => parseVec(studentPosStr), [studentPosStr])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [texLoaded, setTexLoaded]       = useState(false)

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!wrapRef.current) return
    if (document.fullscreenElement) document.exitFullscreen()
    else wrapRef.current.requestFullscreen()
  }, [])

  // Three.js scene
  useEffect(() => {
    setTexLoaded(false)
    const container = mountRef.current
    if (!container || !sceneUrl) return

    const w = container.clientWidth  || 560
    const h = container.clientHeight || 320

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, w / h, 1, 2000)
    camera.position.set(0, 0, 0.1)

    // Panorama sphere (flipped inward)
    const sphGeo = new THREE.SphereGeometry(SPHERE_R, 64, 32)
    sphGeo.scale(-1, 1, 1)
    const sphTex = new THREE.TextureLoader().load(sceneUrl, () => {
      renderer.render(scene, camera)
      setTexLoaded(true)
    })
    const sphMat = new THREE.MeshBasicMaterial({ map: sphTex })
    scene.add(new THREE.Mesh(sphGeo, sphMat))

    const dispose = [sphGeo, sphMat, sphTex]

    // Correct area polygon
    if (polygonPoints.length >= 2) {
      const sorted = [...polygonPoints].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const vecs   = sorted.map(p => new THREE.Vector3(p.x, p.y, p.z).normalize().multiplyScalar(MARKER_AT))

      // Outline loop
      const lineGeo = new THREE.BufferGeometry().setFromPoints([...vecs, vecs[0]])
      const lineMat = new THREE.LineBasicMaterial({ color: 0x2ec77a, linewidth: 3, depthTest: false })
      scene.add(new THREE.Line(lineGeo, lineMat))
      dispose.push(lineGeo, lineMat)

      // Fill — triangle fan from centroid
      const cent = new THREE.Vector3()
      vecs.forEach(v => cent.add(v))
      cent.divideScalar(vecs.length).normalize().multiplyScalar(MARKER_AT * 0.995)
      const fillPts = []
      for (let i = 0; i < vecs.length; i++)
        fillPts.push(cent.clone(), vecs[i].clone(), vecs[(i + 1) % vecs.length].clone())
      const fillGeo = new THREE.BufferGeometry().setFromPoints(fillPts)
      const fillMat = new THREE.MeshBasicMaterial({
        color: 0x2ec77a, transparent: true, opacity: 0.25,
        side: THREE.DoubleSide, depthTest: false,
      })
      scene.add(new THREE.Mesh(fillGeo, fillMat))
      dispose.push(fillGeo, fillMat)
    }

    // Anchor center — green dot
    if (anchorPos && (anchorPos.x || anchorPos.y || anchorPos.z)) {
      const { spr, tex } = makeCircleSprite('rgba(46,199,122,0.95)')
      spr.position.copy(new THREE.Vector3(anchorPos.x, anchorPos.y, anchorPos.z).normalize().multiplyScalar(MARKER_AT))
      scene.add(spr)
      dispose.push(tex, spr.material)
    }

    // Student marker — red dot
    if (studentVec) {
      const { spr, tex } = makeCircleSprite('rgba(224,82,82,0.95)')
      spr.position.copy(studentVec.clone().normalize().multiplyScalar(MARKER_AT))
      scene.add(spr)
      dispose.push(tex, spr.material)
    }

    // Initial camera orientation — face the anchor or student marker
    const lookTarget = (anchorPos && (anchorPos.x || anchorPos.y || anchorPos.z))
      ? new THREE.Vector3(anchorPos.x, anchorPos.y, anchorPos.z).normalize()
      : (studentVec ? studentVec.clone().normalize() : null)

    let lon = lookTarget ? Math.atan2(lookTarget.z, lookTarget.x) * 180 / Math.PI : 0
    let lat = lookTarget ? Math.asin(Math.max(-1, Math.min(1, lookTarget.y))) * 180 / Math.PI : 0

    function applyCamera() {
      const phi   = THREE.MathUtils.degToRad(90 - Math.max(-85, Math.min(85, lat)))
      const theta = THREE.MathUtils.degToRad(lon)
      camera.lookAt(
        SPHERE_R * Math.sin(phi) * Math.cos(theta),
        SPHERE_R * Math.cos(phi),
        SPHERE_R * Math.sin(phi) * Math.sin(theta),
      )
    }

    // Resize renderer when container size changes (handles fullscreen too)
    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth
      const nh = container.clientHeight
      if (!nw || !nh) return
      renderer.setSize(nw, nh)
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
      applyCamera()
      renderer.render(scene, camera)
    })
    ro.observe(container)

    // Pointer drag to look around
    let dragging = false, startX = 0, startY = 0, startLon = 0, startLat = 0
    const el = renderer.domElement

    function onDown(e) {
      dragging = true; startX = e.clientX; startY = e.clientY
      startLon = lon; startLat = lat
      el.setPointerCapture(e.pointerId)
    }
    function onMove(e) {
      if (!dragging) return
      lon = startLon - (e.clientX - startX) * 0.3
      lat = startLat + (e.clientY - startY) * 0.3
      applyCamera()
      renderer.render(scene, camera)
    }
    function onUp(e) { dragging = false; el.releasePointerCapture(e.pointerId) }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)

    applyCamera()
    renderer.render(scene, camera)

    return () => {
      ro.disconnect()
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      dispose.forEach(d => d?.dispose?.())
      renderer.dispose()
      scene.clear()
      if (container.contains(el)) container.removeChild(el)
    }
  }, [sceneUrl, polygonPoints, anchorPos, studentVec])

  return (
    <div className="vrloc-wrap" ref={wrapRef}>
      <div className="vrloc-topbar">
        <span className="vrloc-hint">Drag to look around</span>
        <button
          className="vrloc-fs-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
              <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V3h4"/><path d="M21 7V3h-4"/>
              <path d="M3 17v4h4"/><path d="M21 17v4h-4"/>
            </svg>
          )}
        </button>
      </div>
      <div
        className="vrloc-viewport"
        ref={mountRef}
        style={{ height: isFullscreen ? 'calc(100vh - 72px)' : '320px', position: 'relative' }}
      >
        {!texLoaded && (
          <div className="vrloc-loader">
            <span className="vrloc-spinner" />
          </div>
        )}
      </div>
      <div className="vrloc-legend">
        <span className="vrloc-legend-item">
          <span className="vrloc-dot vrloc-dot--correct" /> Correct area
        </span>
        {studentVec ? (
          <span className="vrloc-legend-item">
            <span className="vrloc-dot vrloc-dot--student" /> Student's answer
          </span>
        ) : (
          <span className="vrloc-legend-item vrloc-legend-item--none">No marker placed</span>
        )}
      </div>
    </div>
  )
}
