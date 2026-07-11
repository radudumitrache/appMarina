import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import '../css/shared/Video360Viewer.css'

const FOV     = 75
const LAT_MAX = 85

export default function Video360Viewer({ src, onClose }) {
  const containerRef = useRef(null)
  const stateRef     = useRef({})
  const videoRef     = useRef(null)

  const [playing,       setPlaying]       = useState(false)
  const [muted,         setMuted]         = useState(false)
  const [progress,      setProgress]      = useState(0)
  const [duration,      setDuration]      = useState(0)
  const [gyroAvailable, setGyroAvailable] = useState(false)
  const [gyroOn,        setGyroOn]        = useState(false)
  const gyroOnRef = useRef(false)

  useEffect(() => { gyroOnRef.current = gyroOn }, [gyroOn])

  useEffect(() => {
    if ('DeviceOrientationEvent' in window) setGyroAvailable(true)
  }, [])

  const toggleGyro = async () => {
    if (gyroOn) {
      stateRef.current.disableGyro?.()
      setGyroOn(false)
    } else {
      if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
        const perm = await DeviceOrientationEvent.requestPermission().catch(() => 'denied')
        if (perm !== 'granted') return
      }
      stateRef.current.enableGyro?.()
      setGyroOn(true)
    }
  }

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else          { v.pause(); setPlaying(false) }
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const seek = useCallback(e => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = ratio * v.duration
    setProgress(ratio)
  }, [])

  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  /* ── Three.js scene ───────────────────────────────────────────────────── */
  useEffect(() => {
    if (!src) return
    const container = containerRef.current
    const { clientWidth: w, clientHeight: h } = container

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(FOV, w / h, 1, 1100)

    // Inside-facing sphere
    const geometry = new THREE.SphereGeometry(500, 128, 64)
    geometry.scale(-1, 1, 1)
    const material = new THREE.MeshBasicMaterial()
    scene.add(new THREE.Mesh(geometry, material))

    // Video element + texture
    const video = document.createElement('video')
    video.src      = src
    video.loop     = true
    video.muted    = false
    video.autoplay = false
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    videoRef.current = video

    video.addEventListener('loadedmetadata', () => setDuration(video.duration))
    video.addEventListener('play',  () => setPlaying(true))
    video.addEventListener('pause', () => setPlaying(false))

    const texture = new THREE.VideoTexture(video)
    texture.colorSpace = THREE.SRGBColorSpace
    material.map = texture

    // Drag state
    let lon = 0, lat = 0
    let isDragging = false, lastX = 0, lastY = 0

    const onMouseDown = e => {
      if (e.target.closest('.v360-controls')) return
      isDragging = true; lastX = e.clientX; lastY = e.clientY
    }
    const onMouseMove = e => {
      if (!isDragging || gyroOnRef.current) return
      lon -= (e.clientX - lastX) * 0.25
      lat  = Math.max(-LAT_MAX, Math.min(LAT_MAX, lat + (e.clientY - lastY) * 0.25))
      lastX = e.clientX; lastY = e.clientY
    }
    const onMouseUp = () => { isDragging = false }

    const onTouchStart = e => {
      if (e.touches.length !== 1) return
      isDragging = true
      lastX = e.touches[0].clientX; lastY = e.touches[0].clientY
    }
    const onTouchMove = e => {
      if (!isDragging || e.touches.length !== 1 || gyroOnRef.current) return
      lon -= (e.touches[0].clientX - lastX) * 0.25
      lat  = Math.max(-LAT_MAX, Math.min(LAT_MAX, lat + (e.touches[0].clientY - lastY) * 0.25))
      lastX = e.touches[0].clientX; lastY = e.touches[0].clientY
    }
    const onTouchEnd = () => { isDragging = false }

    container.addEventListener('mousedown',  onMouseDown)
    window.addEventListener('mousemove',     onMouseMove)
    window.addEventListener('mouseup',       onMouseUp)
    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove',  onTouchMove,  { passive: true })
    container.addEventListener('touchend',   onTouchEnd)

    // Gyroscope
    const gyroData  = { alpha: null, beta: null }
    const gyroCalib = { alpha: null, lonAtRef: 0 }

    const onDeviceOrientation = e => {
      if (e.alpha === null || e.beta === null) return
      gyroData.alpha = e.alpha
      gyroData.beta  = e.beta
      if (gyroCalib.alpha === null) { gyroCalib.alpha = e.alpha; gyroCalib.lonAtRef = lon }
    }

    stateRef.current.enableGyro  = () => {
      gyroCalib.alpha = null
      window.addEventListener('deviceorientation', onDeviceOrientation, true)
    }
    stateRef.current.disableGyro = () => {
      window.removeEventListener('deviceorientation', onDeviceOrientation, true)
    }

    // Resize
    const onResize = () => {
      const { clientWidth: rw, clientHeight: rh } = container
      renderer.setSize(rw, rh)
      camera.aspect = rw / rh
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // RAF
    let rafId
    const phi = new THREE.Euler()

    const tick = () => {
      rafId = requestAnimationFrame(tick)

      if (gyroOnRef.current && gyroData.alpha !== null && gyroCalib.alpha !== null) {
        const deltaAlpha = gyroData.alpha - gyroCalib.alpha
        lon = gyroCalib.lonAtRef - deltaAlpha
        lat = Math.max(-LAT_MAX, Math.min(LAT_MAX, gyroData.beta - 90))
      }

      const phiRad   = THREE.MathUtils.degToRad(90 - lat)
      const thetaRad = THREE.MathUtils.degToRad(lon)
      camera.position.set(0, 0, 0)
      camera.lookAt(
        500 * Math.sin(phiRad) * Math.cos(thetaRad),
        500 * Math.cos(phiRad),
        500 * Math.sin(phiRad) * Math.sin(thetaRad),
      )

      if (texture && video && !video.paused && video.readyState >= 2) {
        texture.needsUpdate = true
        if (video.duration) setProgress(video.currentTime / video.duration)
      }

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(rafId)
      stateRef.current.disableGyro?.()
      container.removeEventListener('mousedown',  onMouseDown)
      window.removeEventListener('mousemove',     onMouseMove)
      window.removeEventListener('mouseup',       onMouseUp)
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove',  onTouchMove)
      container.removeEventListener('touchend',   onTouchEnd)
      window.removeEventListener('resize',        onResize)
      video.pause()
      video.src = ''
      texture.dispose()
      material.dispose()
      geometry.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [src])

  return (
    <div className="v360-overlay" ref={containerRef}>
      {/* Close */}
      <button className="v360-close" onClick={onClose} title="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Controls */}
      <div className="v360-controls" onClick={e => e.stopPropagation()}>
        {/* Play / Pause */}
        <button className="v360-ctrl-btn" onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </button>

        {/* Progress bar */}
        <div className="v360-progress" onClick={seek} title="Seek">
          <div className="v360-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* Mute */}
        <button className="v360-ctrl-btn" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
          {muted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          )}
        </button>

        {/* Gyro toggle (mobile only) */}
        {gyroAvailable && (
          <button className={`v360-ctrl-btn${gyroOn ? ' v360-ctrl-btn--active' : ''}`} onClick={toggleGyro} title="Gyroscope">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="12" rx="10" ry="4"/>
              <ellipse cx="12" cy="12" rx="4" ry="10"/>
              <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>
            </svg>
          </button>
        )}

        {/* Fullscreen */}
        <button className="v360-ctrl-btn" onClick={toggleFullscreen} title="Fullscreen">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>

      {/* Click-to-play overlay when not playing */}
      {!playing && (
        <button className="v360-play-overlay" onClick={togglePlay}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="none" opacity="0.85">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>
      )}
    </div>
  )
}
