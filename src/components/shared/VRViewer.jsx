/**
 * VRViewer — reusable 360° equirectangular panorama renderer.
 *
 * Props:
 *   src             {string}   URL of the equirectangular panorama image.
 *
 *   hotspots        {Array}    HTML overlays anchored to lon/lat points on the sphere.
 *                              Each item: { id, lon, lat, label?, image?, onClick?, render?, className? }
 *
 *   polygonAnchors  {Array}    3-D polygon overlays rendered as Three.js meshes on the
 *                              sphere surface. Each item:
 *                              { id, points: [{x,y,z,order}], title, content, onClick? }
 *                              Clicking the filled polygon area calls onClick(anchor).
 *
 *   onSceneReady    {Function} Called once after scene setup. Receives { scene, camera, renderer }.
 *                              Return a cleanup function; it runs on unmount.
 *
 * How the sphere works:
 *   SphereGeometry(500) + MeshBasicMaterial(BackSide) → camera at (0,0,0).
 *   Polygon meshes sit at radius 496 (inside the sphere) with depthTest:false so
 *   they always render over the panorama texture.
 */

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import '../../components/css/shared/VRViewer.css'

const FOV               = 75
const LAT_MAX           = 85
const AUTO_ROTATE_SPEED = 0.03
const POLY_RADIUS       = 496   // slightly inside the 500-unit sphere
const POLY_OPACITY      = 0.22
const POLY_OPACITY_HOV  = 0.50
const POLY_COLOR        = 0x0bbda4  // teal

// Reusable scratch objects
const _vec    = new THREE.Vector3()
const _camDir = new THREE.Vector3()

export function lonLatToVec3(lon, lat, r = 500, out = new THREE.Vector3()) {
  const phi   = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lon)
  return out.set(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

/** Build a BufferGeometry from sorted polygon points projected onto POLY_RADIUS sphere. */
function buildPolyGeometry(points) {
  const sorted = [...points].sort((a, b) => a.order - b.order)
  if (sorted.length < 3) return null

  const verts = sorted.map(p => {
    const r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) || 1
    return [p.x / r * POLY_RADIUS, p.y / r * POLY_RADIUS, p.z / r * POLY_RADIUS]
  })

  // Fan triangulation from vertex 0 — works correctly for convex polygons
  const pos = []
  for (let i = 1; i < verts.length - 1; i++) {
    pos.push(...verts[0], ...verts[i], ...verts[i + 1])
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  return geo
}

export default function VRViewer({ src, hotspots = [], polygonAnchors = [], onSceneReady, editMode = false, onSceneClick }) {
  const containerRef    = useRef(null)
  const stateRef        = useRef({})
  const hotspotElsRef   = useRef({})
  const hotspotsRef     = useRef(hotspots)
  const onReadyRef      = useRef(onSceneReady)
  const polyMeshesRef   = useRef({})        // id → THREE.Mesh
  const polyAnchorsRef  = useRef(polygonAnchors)
  const editModeRef     = useRef(editMode)
  const onSceneClickRef = useRef(onSceneClick)
  const pickSphereRef   = useRef(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { hotspotsRef.current    = hotspots        }, [hotspots])
  useEffect(() => { onReadyRef.current     = onSceneReady    }, [onSceneReady])
  useEffect(() => { polyAnchorsRef.current = polygonAnchors  }, [polygonAnchors])
  useEffect(() => { editModeRef.current    = editMode        }, [editMode])
  useEffect(() => { onSceneClickRef.current = onSceneClick   }, [onSceneClick])

  // Toggle edit-mode CSS class and freeze auto-rotate when entering edit mode
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.classList.toggle('vr-viewer--edit', editMode)
    // Immediately stop auto-rotate so the scene freezes the moment edit is toggled on
    if (editMode && stateRef.current.setAutoRotate) {
      stateRef.current.setAutoRotate(false)
    }
  }, [editMode])

  /* ── Scene setup — runs once on mount ──────────────────────────────────── */
  useEffect(() => {
    const container = containerRef.current
    const { clientWidth: w, clientHeight: h } = container

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    container.appendChild(renderer.domElement)

    // Scene + camera
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(FOV, w / h, 1, 1100)
    camera.position.set(0, 0, 0)

    // Panorama sphere
    const geometry = new THREE.SphereGeometry(500, 60, 40)
    const material = new THREE.MeshBasicMaterial({ side: THREE.BackSide })
    scene.add(new THREE.Mesh(geometry, material))

    // Invisible pick sphere for edit-mode click-to-place raycasting
    const pickGeo = new THREE.SphereGeometry(498, 32, 24)
    const pickMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
    const pickSphere = new THREE.Mesh(pickGeo, pickMat)
    scene.add(pickSphere)
    pickSphereRef.current = pickSphere

    // Raycaster for polygon interaction
    const raycaster = new THREE.Raycaster()
    const mouse2d   = new THREE.Vector2()

    const getNDC = (clientX, clientY) => {
      const rect = container.getBoundingClientRect()
      mouse2d.x =  ((clientX - rect.left) / rect.width)  * 2 - 1
      mouse2d.y = -((clientY - rect.top)  / rect.height) * 2 + 1
    }

    const hitPolygon = (clientX, clientY) => {
      const meshes = Object.values(polyMeshesRef.current)
      if (!meshes.length) return null
      getNDC(clientX, clientY)
      raycaster.setFromCamera(mouse2d, camera)
      const hits = raycaster.intersectObjects(meshes)
      return hits.length > 0 ? hits[0].object.userData.polyId : null
    }

    // Drag state
    let lon = 0, lat = 0
    let isDragging = false, lastX = 0, lastY = 0
    let mouseDownX = 0, mouseDownY = 0
    let autoRotate = true
    let autoRotateTimeout = null

    // Expose autoRotate control so the editMode effect can freeze it
    stateRef.current.setAutoRotate = (v) => { autoRotate = v }

    const scheduleAutoRotate = () => {
      clearTimeout(autoRotateTimeout)
      autoRotateTimeout = setTimeout(() => { autoRotate = true }, 3000)
    }

    // Mouse
    const onMouseDown = (e) => {
      mouseDownX = e.clientX
      mouseDownY = e.clientY
      if (editModeRef.current) return   // no drag in edit mode
      if (e.target.closest('.vr-hotspot')) return
      isDragging = true
      autoRotate = false
      lastX = e.clientX
      lastY = e.clientY
    }

    const onMouseMove = (e) => {
      if (isDragging) {
        lon -= (e.clientX - lastX) * 0.25
        lat += (e.clientY - lastY) * 0.25
        lastX = e.clientX
        lastY = e.clientY
        return
      }
      // Hover: update polygon highlight
      const hovId = hitPolygon(e.clientX, e.clientY)
      for (const mesh of Object.values(polyMeshesRef.current)) {
        mesh.material.opacity = mesh.userData.polyId === hovId ? POLY_OPACITY_HOV : POLY_OPACITY
      }
      container.style.cursor = hovId ? 'pointer' : ''
    }

    const onMouseUp = (e) => {
      const dx = e.clientX - mouseDownX
      const dy = e.clientY - mouseDownY
      const wasDrag = Math.sqrt(dx * dx + dy * dy) > 5
      isDragging = false
      if (!editModeRef.current) scheduleAutoRotate()

      if (!wasDrag && !e.target.closest('.vr-hotspot')) {
        if (editModeRef.current && onSceneClickRef.current) {
          // Compute lon/lat from sphere intersection for click-to-place
          getNDC(e.clientX, e.clientY)
          raycaster.setFromCamera(mouse2d, camera)
          const sphere = pickSphereRef.current
          if (sphere) {
            const hits = raycaster.intersectObject(sphere)
            if (hits.length > 0) {
              const p = hits[0].point
              const lon = THREE.MathUtils.radToDeg(Math.atan2(p.z, p.x))
              const lat = 90 - THREE.MathUtils.radToDeg(
                Math.acos(THREE.MathUtils.clamp(p.y / 498, -1, 1))
              )
              onSceneClickRef.current(Math.round(lon), Math.round(lat), e.clientX, e.clientY)
            }
          }
        } else {
          const hovId = hitPolygon(e.clientX, e.clientY)
          if (hovId != null) {
            const pa = polyAnchorsRef.current.find(p => p.id === hovId)
            if (pa?.onClick) pa.onClick(pa)
          }
        }
      }
    }

    // Touch
    const onTouchStart = (e) => {
      if (editModeRef.current) return   // no drag in edit mode
      if (e.touches.length !== 1) return
      isDragging = true
      autoRotate = false
      lastX = e.touches[0].clientX
      lastY = e.touches[0].clientY
      mouseDownX = lastX
      mouseDownY = lastY
    }
    const onTouchMove = (e) => {
      if (editModeRef.current) return   // no drag in edit mode
      if (!isDragging || e.touches.length !== 1) return
      lon -= (e.touches[0].clientX - lastX) * 0.25
      lat += (e.touches[0].clientY - lastY) * 0.25
      lastX = e.touches[0].clientX
      lastY = e.touches[0].clientY
    }
    const onTouchEnd = (e) => {
      const t = e.changedTouches[0]
      const dx = t.clientX - mouseDownX
      const dy = t.clientY - mouseDownY
      const wasDrag = Math.sqrt(dx * dx + dy * dy) > 10
      isDragging = false
      if (!editModeRef.current) scheduleAutoRotate()

      if (!wasDrag && !e.target.closest('.vr-hotspot')) {
        if (editModeRef.current && onSceneClickRef.current) {
          getNDC(t.clientX, t.clientY)
          raycaster.setFromCamera(mouse2d, camera)
          const sphere = pickSphereRef.current
          if (sphere) {
            const hits = raycaster.intersectObject(sphere)
            if (hits.length > 0) {
              const p = hits[0].point
              const tLon = THREE.MathUtils.radToDeg(Math.atan2(p.z, p.x))
              const tLat = 90 - THREE.MathUtils.radToDeg(
                Math.acos(THREE.MathUtils.clamp(p.y / 498, -1, 1))
              )
              onSceneClickRef.current(Math.round(tLon), Math.round(tLat), t.clientX, t.clientY)
            }
          }
        } else {
          const hovId = hitPolygon(t.clientX, t.clientY)
          if (hovId != null) {
            const pa = polyAnchorsRef.current.find(p => p.id === hovId)
            if (pa?.onClick) pa.onClick(pa)
          }
        }
      }
    }

    // Scroll zoom — disabled in edit mode
    const onWheel = (e) => {
      if (editModeRef.current) return
      camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.05, 30, 100)
      camera.updateProjectionMatrix()
    }

    container.addEventListener('mousedown',  onMouseDown)
    window.addEventListener('mousemove',     onMouseMove)
    window.addEventListener('mouseup',       onMouseUp)
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove',  onTouchMove,  { passive: true })
    container.addEventListener('touchend',   onTouchEnd)
    container.addEventListener('wheel',      onWheel, { passive: true })

    // Resize
    const onResize = () => {
      const { clientWidth: rw, clientHeight: rh } = container
      renderer.setSize(rw, rh)
      camera.aspect = rw / rh
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(container)

    // ── RAF loop ────────────────────────────────────────────────────────────
    let animId
    const tick = () => {
      animId = requestAnimationFrame(tick)

      if (autoRotate && !editModeRef.current) lon += AUTO_ROTATE_SPEED
      lat = Math.max(-LAT_MAX, Math.min(LAT_MAX, lat))

      const phi   = THREE.MathUtils.degToRad(90 - lat)
      const theta = THREE.MathUtils.degToRad(lon)
      camera.lookAt(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta),
      )

      // Project hotspots to screen
      const { clientWidth: cw, clientHeight: ch } = container
      camera.getWorldDirection(_camDir)

      for (const hs of hotspotsRef.current) {
        const el = hotspotElsRef.current[hs.id]
        if (!el) continue

        lonLatToVec3(hs.lon, hs.lat, 500, _vec)
        _vec.normalize()
        const visible = _camDir.dot(_vec) > 0.1

        if (!visible) {
          el.style.opacity       = '0'
          el.style.pointerEvents = 'none'
          continue
        }

        lonLatToVec3(hs.lon, hs.lat, 500, _vec)
        _vec.project(camera)

        const x = ( _vec.x + 1) / 2 * cw
        const y = (-_vec.y + 1) / 2 * ch

        el.style.transform     = `translate(-50%, -50%) translate(${x}px, ${y}px)`
        el.style.opacity       = '1'
        el.style.pointerEvents = 'auto'
      }

      renderer.render(scene, camera)
    }
    tick()

    stateRef.current = { material, renderer, scene, camera }

    let sceneCleanup
    if (typeof onReadyRef.current === 'function') {
      sceneCleanup = onReadyRef.current({ scene, camera, renderer })
    }

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(autoRotateTimeout)
      ro.disconnect()
      container.removeEventListener('mousedown',  onMouseDown)
      window.removeEventListener('mousemove',     onMouseMove)
      window.removeEventListener('mouseup',       onMouseUp)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove',  onTouchMove)
      container.removeEventListener('touchend',   onTouchEnd)
      container.removeEventListener('wheel',      onWheel)
      if (typeof sceneCleanup === 'function') sceneCleanup()
      renderer.dispose()
      material.dispose()
      geometry.dispose()
      pickGeo.dispose()
      pickMat.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [])

  /* ── Polygon mesh management — runs when polygonAnchors changes ─────────── */
  useEffect(() => {
    const { scene } = stateRef.current
    if (!scene) return

    // Dispose previous meshes
    for (const mesh of Object.values(polyMeshesRef.current)) {
      scene.remove(mesh)
      mesh.geometry.dispose()
      mesh.material.dispose()
    }
    polyMeshesRef.current = {}

    // Create new meshes
    for (const pa of polygonAnchors) {
      if (!pa.points || pa.points.length < 3) continue
      const geo = buildPolyGeometry(pa.points)
      if (!geo) continue

      const mat = new THREE.MeshBasicMaterial({
        color: POLY_COLOR,
        transparent: true,
        opacity: POLY_OPACITY,
        side: THREE.DoubleSide,
        depthTest: false,   // always visible over the sphere
        depthWrite: false,
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.renderOrder = 1
      mesh.userData.polyId = pa.id
      scene.add(mesh)
      polyMeshesRef.current[pa.id] = mesh
    }
  }, [polygonAnchors])

  /* ── Texture swap ───────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!src || !stateRef.current.material) return
    setLoading(true)
    const loader = new THREE.TextureLoader()
    loader.load(src, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      const { material } = stateRef.current
      const old = material.map
      material.map = texture
      material.needsUpdate = true
      if (old) old.dispose()
      setLoading(false)
    })
  }, [src])

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div ref={containerRef} className="vr-viewer">

      {loading && (
        <div className="vr-loader">
          <div className="vr-loader-ring" />
          <span className="vr-loader-label">Loading scene…</span>
        </div>
      )}

      <div className="vr-hotspots-layer">
        {hotspots.map((hs) => (
          <div
            key={hs.id}
            ref={(el) => {
              if (el) hotspotElsRef.current[hs.id] = el
              else    delete hotspotElsRef.current[hs.id]
            }}
            className={`vr-hotspot ${hs.className || ''}`}
            onClick={hs.onClick}
          >
            {hs.render
              ? hs.render(hs)
              : (
                <>
                  {hs.image && <img src={hs.image} className="vr-hotspot-img" alt={hs.label || ''} />}
                  <span className="vr-hotspot-label">{hs.label}</span>
                </>
              )
            }
          </div>
        ))}
      </div>
    </div>
  )
}
