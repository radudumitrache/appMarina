import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import '../../css/student/test-taker/VRSceneViewer.css'

const SPHERE_R   = 500
const SPRITE_DIM = 30    // world-space units (smaller than before)
const CANVAS_RES = 120   // actual canvas pixels — 4× overdraw for crispness

function getAnswerKey(anchor) {
  const map = { mcq: 'vr_mcq', tf: 'vr_tf', short: 'vr_short', word: 'vr_word' }
  const prefix = map[anchor._type]
  return prefix ? `${prefix}_${anchor.id}` : null
}

function isAnsweredVal(anchor, answers) {
  const key = getAnswerKey(anchor)
  if (!key) return false
  const val = answers[key]
  if (val === undefined || val === null) return false
  if (typeof val === 'boolean') return true
  return val !== ''
}

function makeMarkerCanvas(type, answered, color) {
  const d  = CANVAS_RES
  const cx = d / 2, cy = d / 2, r = d / 2 - 4

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = d
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, d, d)

  // Background circle
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = answered
    ? 'rgba(0, 200, 120, 0.95)'
    : `rgba(${color.r},${color.g},${color.b},0.95)`
  ctx.fill()

  // White border ring
  ctx.strokeStyle = 'rgba(255,255,255,0.88)'
  ctx.lineWidth   = 6
  ctx.stroke()

  // All icons in dark teal — legible on any fill colour
  const ink = 'rgba(10, 40, 45, 0.90)'
  ctx.fillStyle   = ink
  ctx.strokeStyle = ink
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'

  if (type === 'mcq') {
    // 3-row bullet list
    const rows  = 3, iH = d * 0.38, iW = d * 0.40
    const x0    = cx - iW / 2, y0 = cy - iH / 2, rowH = iH / rows
    const dotR  = d * 0.046, lx = x0 + dotR * 3.2, lLen = iW - dotR * 3.8
    ctx.lineWidth = d * 0.068
    for (let i = 0; i < rows; i++) {
      const y = y0 + rowH * i + rowH / 2
      ctx.beginPath(); ctx.arc(x0 + dotR, y, dotR, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + lLen, y); ctx.stroke()
    }

  } else if (type === 'tf') {
    // ✓ on the left, ✗ on the right, faint centre divider
    const sz = d * 0.13
    ctx.lineWidth = d * 0.092

    // checkmark
    ctx.beginPath()
    ctx.moveTo(cx - sz * 2.0, cy + sz * 0.05)
    ctx.lineTo(cx - sz * 1.2, cy + sz * 0.95)
    ctx.lineTo(cx - sz * 0.15, cy - sz * 0.75)
    ctx.stroke()

    // divider
    ctx.strokeStyle = 'rgba(10,40,45,0.18)'
    ctx.lineWidth   = d * 0.035
    ctx.beginPath(); ctx.moveTo(cx, cy - sz * 1.2); ctx.lineTo(cx, cy + sz * 1.2); ctx.stroke()
    ctx.strokeStyle = ink

    // cross
    ctx.lineWidth = d * 0.092
    ctx.beginPath()
    ctx.moveTo(cx + sz * 0.3,  cy - sz * 0.75)
    ctx.lineTo(cx + sz * 1.65, cy + sz * 0.75)
    ctx.moveTo(cx + sz * 1.65, cy - sz * 0.75)
    ctx.lineTo(cx + sz * 0.3,  cy + sz * 0.75)
    ctx.stroke()

  } else if (type === 'short') {
    // 3 paragraph-style lines with varied widths
    const widths = [1.0, 0.78, 0.54]
    const iW = d * 0.42, iH = d * 0.32
    const x0 = cx - iW / 2, y0 = cy - iH / 2
    ctx.lineWidth = d * 0.082
    for (let i = 0; i < widths.length; i++) {
      const y = y0 + (iH / (widths.length - 1)) * i
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + iW * widths[i], y); ctx.stroke()
    }

  } else if (type === 'word') {
    // Two underline segments (fill-in-the-blank)
    const iW = d * 0.44, bY = cy + d * 0.10
    const x0 = cx - iW / 2, gap = iW * 0.20
    ctx.lineWidth = d * 0.082

    // faint hint text line above
    ctx.globalAlpha = 0.40
    ctx.beginPath(); ctx.moveTo(x0 + iW * 0.08, bY - d * 0.20); ctx.lineTo(x0 + iW * 0.52, bY - d * 0.20); ctx.stroke()
    ctx.globalAlpha = 1

    // two blank underlines
    ctx.beginPath()
    ctx.moveTo(x0, bY); ctx.lineTo(x0 + (iW - gap) / 2, bY)
    ctx.moveTo(x0 + (iW - gap) / 2 + gap, bY); ctx.lineTo(x0 + iW, bY)
    ctx.stroke()

  } else if (type === 'navigator') {
    // Diamond outline with a forward arrow inside — distinct from all exercise types
    const half = d * 0.30
    // Diamond outline
    ctx.lineWidth = d * 0.072
    ctx.beginPath()
    ctx.moveTo(cx,          cy - half)  // top
    ctx.lineTo(cx + half,   cy)         // right
    ctx.lineTo(cx,          cy + half)  // bottom
    ctx.lineTo(cx - half,   cy)         // left
    ctx.closePath()
    ctx.stroke()
    // Arrow pointing up (north) inside the diamond
    const aw = d * 0.14
    ctx.lineWidth = d * 0.092
    ctx.beginPath()
    ctx.moveTo(cx, cy + aw * 0.9)
    ctx.lineTo(cx, cy - aw * 0.7)
    ctx.moveTo(cx, cy - aw * 0.7)
    ctx.lineTo(cx - aw * 0.6, cy - aw * 0.1)
    ctx.moveTo(cx, cy - aw * 0.7)
    ctx.lineTo(cx + aw * 0.6, cy - aw * 0.1)
    ctx.stroke()
  }

  return canvas
}


function buildSprite(anchor, answered) {
  const color   = { r: anchor.color_r ?? 0, g: anchor.color_g ?? 180, b: anchor.color_b ?? 200 }
  const canvas  = makeMarkerCanvas(anchor._type, answered, color)
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  const mat    = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true })
  const sprite = new THREE.Sprite(mat)
  const dim    = SPRITE_DIM * Math.max(1, anchor.size || 1)
  sprite.scale.set(dim, dim, 1)
  return sprite
}


function anchorPos(anchor) {
  const v = new THREE.Vector3(anchor.pos_x ?? 0, anchor.pos_y ?? 0, anchor.pos_z ?? 1)
  if (v.length() < 0.001) v.set(0, 0, 1)
  return v.normalize().multiplyScalar(SPHERE_R * 0.95)
}

function makeLocMarkerCanvas() {
  const dim = 36
  const canvas = document.createElement('canvas')
  canvas.width = dim
  canvas.height = dim
  const ctx = canvas.getContext('2d')
  const cx = dim / 2, cy = dim / 2
  ctx.clearRect(0, 0, dim, dim)
  ctx.beginPath()
  ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.85)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, cy, 6, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0, 220, 130, 1)'
  ctx.fill()
  return canvas
}

function parseLocAnswer(val) {
  if (!val || typeof val !== 'string') return null
  const parts = val.split(',')
  if (parts.length !== 3) return null
  const [x, y, z] = parts.map(Number)
  if (isNaN(x) || isNaN(y) || isNaN(z)) return null
  return new THREE.Vector3(x, y, z)
}

// ─────────────────────────────────────────────────────────────────────────────

export default function VRSceneViewer({
  vr, panels, answers, onAnchorClick, onNavigate,
  localizingAnchor, onLocalizationPlace,
}) {
  const mountRef           = useRef(null)
  const rendRef            = useRef(null)
  const sceneRef           = useRef(null)
  const cameraRef          = useRef(null)
  const spritesRef         = useRef({})   // spriteKey → { sprite, anchor }
  const locMarkersRef      = useRef({})   // anchorId  → sprite (placed-point dot)
  const frameRef           = useRef(null)
  const answersRef         = useRef(answers)
  const locAnchorRef       = useRef(localizingAnchor)
  const onLocPlaceRef      = useRef(onLocalizationPlace)
  const lonRef             = useRef(0)
  const latRef             = useRef(0)
  const ptrRef             = useRef({ down: false, x: 0, y: 0, moved: false })
  const ptrsRef            = useRef(new Map())   // pointerId → {x, y}
  const prevPinchRef       = useRef(null)        // last pinch distance

  useEffect(() => { answersRef.current      = answers           }, [answers])
  useEffect(() => { locAnchorRef.current    = localizingAnchor  }, [localizingAnchor])
  useEffect(() => { onLocPlaceRef.current   = onLocalizationPlace }, [onLocalizationPlace])

  // Native pinch-to-zoom — pointer capture on iOS breaks React's synthetic
  // multi-touch, so attach directly to the DOM node with passive:false so we
  // can call preventDefault() and prevent the browser from zooming the page.
  useEffect(() => {
    const container = mountRef.current
    if (!container) return
    let prevDist = null

    const onTouchStart = (e) => {
      if (e.touches.length !== 2) return
      prevDist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY,
      )
    }

    const onTouchMove = (e) => {
      if (e.touches.length !== 2) { prevDist = null; return }
      e.preventDefault()
      const dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY,
      )
      if (prevDist !== null) {
        const camera = cameraRef.current
        if (camera) {
          camera.fov = THREE.MathUtils.clamp(camera.fov + (prevDist - dist) * 0.1, 30, 100)
          camera.updateProjectionMatrix()
        }
      }
      prevDist = dist
    }

    const onTouchEnd = () => { prevDist = null }

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove',  onTouchMove,  { passive: false })
    container.addEventListener('touchend',   onTouchEnd)
    container.addEventListener('touchcancel', onTouchEnd)
    return () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove',  onTouchMove)
      container.removeEventListener('touchend',   onTouchEnd)
      container.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [])

  // Localization anchors are intentionally excluded — no scene presence at all
  const exerciseAnchors = [
    ...(vr.mcq_anchors             ?? []).map(a => ({ ...a, _type: 'mcq'      })),
    ...(vr.tf_anchors              ?? []).map(a => ({ ...a, _type: 'tf'       })),
    ...(vr.short_anchors           ?? []).map(a => ({ ...a, _type: 'short'    })),
    ...(vr.word_completion_anchors ?? []).map(a => ({ ...a, _type: 'word'     })),
    ...(vr.navigator_anchors       ?? []).map(a => ({ ...a, _type: 'navigator' })),
  ]

  // ── Three.js init ──────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current
    if (!container || !vr.scene_url) return

    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 2000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })

    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace    = THREE.SRGBColorSpace
    renderer.toneMapping         = THREE.LinearToneMapping
    renderer.toneMappingExposure = 0.80
    container.appendChild(renderer.domElement)

    sceneRef.current  = scene
    cameraRef.current = camera
    rendRef.current   = renderer

    // 360° sphere — scale(-1,1,1) reverses UV winding so the texture reads
    // left-to-right from inside without mirroring (FrontSide renders correctly after the flip)
    const geo  = new THREE.SphereGeometry(SPHERE_R, 128, 64)
    geo.scale(-1, 1, 1)
    const tex  = new THREE.TextureLoader().load(vr.scene_url)
    tex.colorSpace      = THREE.SRGBColorSpace
    tex.anisotropy      = renderer.capabilities.getMaxAnisotropy()
    tex.generateMipmaps = true
    tex.minFilter       = THREE.LinearMipmapLinearFilter
    tex.magFilter       = THREE.LinearFilter
    const mat  = new THREE.MeshBasicMaterial({ map: tex })
    scene.add(new THREE.Mesh(geo, mat))

    // Exercise anchor sprites
    const sprites = {}
    for (const anchor of exerciseAnchors) {
      const key    = `${anchor._type}_${anchor.id}`
      const sprite = buildSprite(anchor, isAnsweredVal(anchor, answersRef.current))
      sprite.position.copy(anchorPos(anchor))
      scene.add(sprite)
      sprites[key] = { sprite, anchor }
    }
    spritesRef.current = sprites

    // Placed-point markers for localization answers (hidden until answered)
    const locMarkers = {}
    const locTexture = new THREE.CanvasTexture(makeLocMarkerCanvas())
    for (const anchor of vr.localization_anchors ?? []) {
      const mat    = new THREE.SpriteMaterial({ map: locTexture, depthTest: false, transparent: true })
      const sprite = new THREE.Sprite(mat)
      sprite.scale.set(36, 36, 1)
      sprite.visible = false
      scene.add(sprite)
      locMarkers[anchor.id] = sprite
    }
    locMarkersRef.current = locMarkers

    // Render loop
    function tick() {
      frameRef.current = requestAnimationFrame(tick)

      // Pulse unanswered exercise markers
      const t = Date.now() * 0.0018
      for (const { sprite, anchor } of Object.values(sprites)) {
        if (anchor._type === 'navigator') continue
        if (!isAnsweredVal(anchor, answersRef.current)) {
          const base  = SPRITE_DIM * Math.max(1, anchor.size || 1)
          const scale = base * (1 + 0.18 * Math.sin(t + anchor.id * 1.3))
          sprite.scale.set(scale, scale, 1)
        }
      }

      // Camera direction from lon/lat
      const lat   = Math.max(-85, Math.min(85, latRef.current))
      const phi   = THREE.MathUtils.degToRad(90 - lat)
      const theta = THREE.MathUtils.degToRad(lonRef.current)
      camera.lookAt(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta),
      )
      renderer.render(scene, camera)
    }
    tick()

    // Resize
    const ro = new ResizeObserver(() => {
      if (!container) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    })
    ro.observe(container)

    return () => {
      cancelAnimationFrame(frameRef.current)
      ro.disconnect()
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      scene.clear()
      spritesRef.current  = {}
      locMarkersRef.current = {}
    }
  }, [vr.id, vr.scene_url]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update sprite textures + localization placed markers when answers change ─
  useEffect(() => {
    for (const { sprite, anchor } of Object.values(spritesRef.current)) {
      const answered = isAnsweredVal(anchor, answers)
      const color    = { r: anchor.color_r ?? 0, g: anchor.color_g ?? 180, b: anchor.color_b ?? 200 }
      const canvas   = makeMarkerCanvas(anchor._type, answered, color)
      sprite.material.map.image       = canvas
      sprite.material.map.needsUpdate = true
      if (answered) {
        const base = SPRITE_DIM * Math.max(1, anchor.size || 1)
        sprite.scale.set(base, base, 1)
      }
    }

    for (const [id, marker] of Object.entries(locMarkersRef.current)) {
      const pt = parseLocAnswer(answers[`vr_loc_${id}`])
      if (pt) {
        marker.position.copy(pt.clone().normalize().multiplyScalar(SPHERE_R * 0.95))
        marker.visible = true
      } else {
        marker.visible = false
      }
    }
  }, [answers]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pointer handlers ───────────────────────────────────────────────────────
  const onWheel = useCallback(e => {
    const camera = cameraRef.current
    if (!camera) return
    camera.fov = THREE.MathUtils.clamp(camera.fov + e.deltaY * 0.05, 30, 100)
    camera.updateProjectionMatrix()
  }, [])

  const onDown = useCallback(e => {
    ptrsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    ptrRef.current = { down: true, x: e.clientX, y: e.clientY, moved: false }
  }, [])

  const onMove = useCallback(e => {
    ptrsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (ptrsRef.current.size === 2) {
      const [p1, p2] = [...ptrsRef.current.values()]
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      if (prevPinchRef.current !== null) {
        const delta  = prevPinchRef.current - dist
        const camera = cameraRef.current
        if (camera) {
          camera.fov = THREE.MathUtils.clamp(camera.fov + delta * 0.1, 30, 100)
          camera.updateProjectionMatrix()
        }
      }
      prevPinchRef.current = dist
      return
    }

    prevPinchRef.current = null
    const p = ptrRef.current
    if (!p.down) return
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) p.moved = true
    lonRef.current -= dx * 0.15
    latRef.current += dy * 0.15
    p.x = e.clientX
    p.y = e.clientY
  }, [])

  const onUp = useCallback(e => {
    ptrsRef.current.delete(e.pointerId)
    prevPinchRef.current = null
    const p = ptrRef.current
    if (!p.down) return
    p.down = false
    if (p.moved) return

    const container = mountRef.current
    const camera    = cameraRef.current
    const scene     = sceneRef.current
    if (!container || !camera || !scene) return

    const rect  = container.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  *  2 - 1,
      -((e.clientY - rect.top) / rect.height) *  2 + 1,
    )
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, camera)

    // ── Localization mode: record point on sphere ──────────────────────────
    if (locAnchorRef.current) {
      // Camera is at origin; sphere point = ray direction * SPHERE_R
      const pt = raycaster.ray.direction.clone().multiplyScalar(SPHERE_R)
      onLocPlaceRef.current?.(pt.x, pt.y, pt.z)
      return
    }

    // ── Normal mode: hit-test exercise sprites ─────────────────────────────
    const spriteList = Object.values(spritesRef.current).map(s => s.sprite)
    const hits       = raycaster.intersectObjects(spriteList)
    if (!hits.length) return

    const hit   = hits[0].object
    const entry = Object.values(spritesRef.current).find(s => s.sprite === hit)
    if (!entry) return

    const { anchor } = entry
    if (anchor._type === 'navigator') {
      const idx = (panels ?? []).findIndex(p => p.id === anchor.target_panel)
      if (idx !== -1) onNavigate(idx)
    } else {
      onAnchorClick(anchor)
    }
  }, [panels, onNavigate, onAnchorClick])

  return (
    <div
      className={`vr-viewer${localizingAnchor ? ' vr-viewer--locating' : ''}`}
      ref={mountRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onWheel={onWheel}
    >
      {!vr.scene_url && (
        <div className="vr-viewer__no-scene">No 360° scene available for this panel.</div>
      )}
      {!localizingAnchor && (
        <div className="vr-viewer__hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Drag to look around · Scroll / pinch to zoom · Click markers to answer
        </div>
      )}
      {localizingAnchor && (
        <div className="vr-viewer__loc-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <line x1="12" y1="2" x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
          </svg>
          Click anywhere in the scene to place your answer
        </div>
      )}
    </div>
  )
}
