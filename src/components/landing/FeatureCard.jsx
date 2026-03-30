import { useRef, useCallback } from 'react'
import '../css/landing/FeatureCard.css'

export default function FeatureCard({ title, body, icon }) {
  const cardRef = useRef(null)

  const handleTilt = useCallback((e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const dx   = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2)
    const dy   = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2)
    card.style.transform  = `perspective(900px) rotateX(${-dy * 15}deg) rotateY(${dx * 15}deg)`
    card.style.transition = 'transform 0.05s linear'

    const spec = card.querySelector('.card-specular')
    if (spec) {
      const px = ((e.clientX - rect.left) / rect.width)  * 100
      const py = ((e.clientY - rect.top)  / rect.height) * 100
      spec.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.07) 0%, transparent 55%)`
    }
  }, [])

  const resetTilt = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
    card.style.transition = 'transform 0.45s cubic-bezier(0.16,1,0.3,1)'
    const spec = card.querySelector('.card-specular')
    if (spec) spec.style.background = 'none'
  }, [])

  return (
    <div
      className="feature-card"
      ref={cardRef}
      onMouseMove={handleTilt}
      onMouseLeave={resetTilt}
    >
      <div className="card-specular" />
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-body">{body}</p>
      <div className="feature-card-line" />
    </div>
  )
}
