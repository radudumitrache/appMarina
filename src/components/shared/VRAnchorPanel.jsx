/**
 * VRAnchorPanel — slide-in detail panel for VR scene hotspots.
 *
 * Three layout variants driven by `anchor.type`:
 *
 *  'waypoint'  Teal accent. Navigation point with category + CTA.
 *  'image'     Full-bleed image header, reference tag, CTA.
 *  'info'      Gold accent. Icon + body text + regulation reference + CTA.
 *
 * Glass is explicitly permitted here because this panel floats
 * directly over the VR photographic background (surfaces.md rule).
 */
import { useState } from 'react'
import '../../components/css/shared/VRAnchorPanel.css'

/* ── Icons ─────────────────────────────────────────────────────────────── */
function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  )
}
function IconCompass() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  )
}
function IconImage() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}
function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

/* ── Shared panel shell ─────────────────────────────────────────────────── */
function PanelShell({ type, onClose, children }) {
  return (
    <aside className={`vr-ap vr-ap--${type}`}>
      <button className="vr-ap-close" onClick={onClose} aria-label="Close">
        <IconX />
      </button>
      {children}
    </aside>
  )
}

/* ── Waypoint layout ────────────────────────────────────────────────────── */
function WaypointPanel({ anchor, onClose }) {
  return (
    <PanelShell type="waypoint" onClose={onClose}>
      <div className="vr-ap-kicker">
        <span className="vr-ap-type-dot" />
        <span className="vr-ap-type-label">Waypoint</span>
        {anchor.status === 'locked' && (
          <span className="vr-ap-badge vr-ap-badge--locked">Locked</span>
        )}
        {anchor.status === 'active' && (
          <span className="vr-ap-badge vr-ap-badge--active">Active</span>
        )}
      </div>

      <h2 className="vr-ap-title">{anchor.label}</h2>

      <div className="vr-ap-divider" />

      <p className="vr-ap-body">{anchor.description}</p>

      {anchor.category && (
        <div className="vr-ap-meta-row">
          <span className="vr-ap-meta-label">Category</span>
          <span className="vr-ap-meta-value">{anchor.category}</span>
        </div>
      )}

      {anchor.bearing != null && (
        <div className="vr-ap-meta-row">
          <span className="vr-ap-meta-label">Bearing</span>
          <span className="vr-ap-meta-value vr-ap-mono">{anchor.bearing}°</span>
        </div>
      )}

      <button className="vr-ap-cta vr-ap-cta--accent">
        <IconCompass />
        Navigate Here
        <span className="vr-ap-cta-arrow"><IconArrow /></span>
      </button>
    </PanelShell>
  )
}

/* ── Image pin layout ───────────────────────────────────────────────────── */
function ImagePanel({ anchor, onClose }) {
  return (
    <PanelShell type="image" onClose={onClose}>
      <div className="vr-ap-image-wrap">
        <img src={anchor.image} alt={anchor.label} className="vr-ap-image" />
        <div className="vr-ap-image-gradient" />
        <div className="vr-ap-image-kicker">
          <IconImage />
          <span className="vr-ap-type-label">Equipment</span>
        </div>
      </div>

      <div className="vr-ap-image-body">
        <h2 className="vr-ap-title">{anchor.label}</h2>
        <p className="vr-ap-body">{anchor.description}</p>

        {anchor.ref && (
          <div className="vr-ap-ref-row">
            <span className="vr-ap-ref-label">Reference</span>
            <span className="vr-ap-ref-tag">{anchor.ref}</span>
          </div>
        )}

        <button className="vr-ap-cta vr-ap-cta--accent">
          <IconImage />
          View Details
          <span className="vr-ap-cta-arrow"><IconArrow /></span>
        </button>
      </div>
    </PanelShell>
  )
}

/* ── Info / technical note layout ───────────────────────────────────────── */
function InfoPanel({ anchor, onClose }) {
  return (
    <PanelShell type="info" onClose={onClose}>
      <div className="vr-ap-info-header">
        <div className="vr-ap-icon-circle">
          <span className="vr-ap-icon-emoji">{anchor.icon}</span>
        </div>
        <div>
          <div className="vr-ap-kicker vr-ap-kicker--gold">
            <span className="vr-ap-type-label">Technical Note</span>
          </div>
          <h2 className="vr-ap-title vr-ap-title--sm">{anchor.label}</h2>
        </div>
      </div>

      <div className="vr-ap-divider" />

      <p className="vr-ap-summary">{anchor.body}</p>

      {anchor.detail && (
        <p className="vr-ap-body">{anchor.detail}</p>
      )}

      {anchor.ref && (
        <div className="vr-ap-ref-row">
          <span className="vr-ap-ref-label">Regulation</span>
          <span className="vr-ap-ref-tag vr-ap-ref-tag--gold">{anchor.ref}</span>
        </div>
      )}

      <button className="vr-ap-cta vr-ap-cta--gold">
        <IconInfo />
        Learn More
        <span className="vr-ap-cta-arrow"><IconArrow /></span>
      </button>
    </PanelShell>
  )
}

/* ── Public component ───────────────────────────────────────────────────── */
export default function VRAnchorPanel({ anchor, onClose }) {
  if (!anchor) return null

  if (anchor.type === 'waypoint') return <WaypointPanel anchor={anchor} onClose={onClose} />
  if (anchor.type === 'image')    return <ImagePanel    anchor={anchor} onClose={onClose} />
  if (anchor.type === 'info')     return <InfoPanel     anchor={anchor} onClose={onClose} />
  return null
}
