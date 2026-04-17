import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { usePageTransition } from '../../context/TransitionContext'
import '../css/landing/HeroSection.css'

const preloadLogin = () => import('../../pages/Login')

export default function HeroSection() {
  const { transitionTo } = usePageTransition()
  const canvasRef        = useRef(null)

  /* ── Three.js particle field ─────────────────────────── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 8

    // 2,000 particles distributed in a sphere of radius 5
    const COUNT = 2000
    const positions = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      const phi   = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      const r     = 5 * Math.cbrt(Math.random())
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.028,
      transparent: true,
      opacity: 0.55,
    })

    const particles = new THREE.Points(geo, mat)
    scene.add(particles)

    let rafId
    const tick = () => {
      rafId = requestAnimationFrame(tick)
      particles.rotation.y += 0.0007
      renderer.render(scene, camera)
    }
    tick()

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
    }
  }, [])

  /* ── Hero entrance ───────────────────────────────────── */
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-label, .hero-headline, .hero-sub, .hero-cta-group', {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.14,
        delay: 0.5,
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" id="hero">
      {/* z:1 — video */}
      <video
        className="hero-video"
        src="/shipInTheSeaToshipInTheSea.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      {/* z:2 — Three.js canvas (above video, below overlay) */}
      <canvas ref={canvasRef} className="hero-particles" />
      {/* z:3 — gradient overlay */}
      <div className="hero-overlay" />
      {/* z:4 — text */}
      <div className="hero-content">
        <span className="hero-label">VR MARITIME TRAINING</span>
        <h1 className="hero-headline">
          Maritime Training,<br />Reimagined in VR
        </h1>
        <p className="hero-sub">
          Immersive bridge simulations built to IMO&nbsp;standards —<br />
          for the next generation of seafarers
        </p>
        <div className="hero-cta-group">
          <button
            className="hero-cta"
            onClick={() => transitionTo('/login')}
            onMouseEnter={preloadLogin}
          >
            Enter Platform
          </button>
          <button
            className="hero-cta hero-cta--outline"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contact Us
          </button>
        </div>
      </div>
      <div className="hero-scroll-hint">
        <span className="scroll-hint-line" />
        <span className="scroll-hint-text">SCROLL</span>
      </div>
    </section>
  )
}
