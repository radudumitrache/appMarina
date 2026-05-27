import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { downloadDiplomaAsPdf } from '../../../utils/downloadDiploma'
import '../../css/student/profile/DiplomasTab.css'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function CertificatePreview({ diploma, studentName, onClose }) {
  const certRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    if (!certRef.current || downloading) return
    setDownloading(true)
    try {
      const slug = diploma.title.replace(/\s+/g, '_').toLowerCase()
      await downloadDiplomaAsPdf(certRef.current, `diploma_${slug}.pdf`)
    } finally {
      setDownloading(false)
    }
  }

  return createPortal(
    <div className="sdip-overlay" onClick={onClose}>
      <div className="sdip-wrap" onClick={e => e.stopPropagation()}>
        <div className="sdip-actions">
          <button className="sdip-download" onClick={handleDownload} disabled={downloading} title="Download as PDF">
            {downloading ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="sdip-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
            {downloading ? 'Generating…' : 'Download PDF'}
          </button>
          <button className="sdip-dismiss" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="sdip-cert" ref={certRef}>
          {/* Corner ornaments */}
          <span className="sdip-corner sdip-corner--tl"/>
          <span className="sdip-corner sdip-corner--tr"/>
          <span className="sdip-corner sdip-corner--bl"/>
          <span className="sdip-corner sdip-corner--br"/>

          {/* Logo */}
          <div className="sdip-logo">
            <span className="sdip-logo-word">HANSA</span>
            <span className="sdip-logo-num">360</span>
          </div>

          {/* Decorative rule + anchor */}
          <div className="sdip-rule">
            <span className="sdip-rule-line"/>
            <svg className="sdip-anchor" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="3"/>
              <line x1="12" y1="8" x2="12" y2="22"/>
              <path d="M5 15l7 7 7-7"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className="sdip-rule-line"/>
          </div>

          {/* Title */}
          <div className="sdip-title">{diploma.title || 'Certificate of Completion'}</div>

          {/* Intro + recipient */}
          <div className="sdip-intro">Hereby this diploma is awarded to</div>
          <div className="sdip-recipient">{studentName}</div>

          {/* Decorative rule */}
          <div className="sdip-rule sdip-rule--sm">
            <span className="sdip-rule-line"/>
            <span className="sdip-rule-diamond"/>
            <span className="sdip-rule-line"/>
          </div>

          {/* Description */}
          {diploma.description && (
            <p className="sdip-desc">{diploma.description}</p>
          )}

          {/* Footer */}
          <div className="sdip-footer">
            <div className="sdip-footer-col">
              <span className="sdip-footer-label">Department</span>
              <span className="sdip-footer-value">{diploma.department_name}</span>
            </div>
            <div className="sdip-footer-col">
              <span className="sdip-footer-label">Issued</span>
              <span className="sdip-footer-value">{formatDate(diploma.issued_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function DiplomasTab({ diplomas, studentName }) {
  const [preview, setPreview] = useState(null)

  return (
    <div className="profile-panel">
      <div className="panel-head">
        <span className="panel-title">Diplomas</span>
        <span className="sdip-count">{diplomas.length} awarded</span>
      </div>

      {diplomas.length === 0 ? (
        <p className="sdip-empty">No diplomas awarded yet. Complete courses and tests to earn them.</p>
      ) : (
        <div className="sdip-grid">
          {diplomas.map((d, i) => (
            <button
              key={d.id}
              className="sdip-card"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
              onClick={() => setPreview(d)}
            >
              <div className="sdip-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="6"/>
                  <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
                </svg>
              </div>
              <div className="sdip-card-body">
                <span className="sdip-card-title">{d.title}</span>
                <span className="sdip-card-class">{d.department_name}</span>
                <span className="sdip-card-date">{formatDate(d.issued_at)}</span>
              </div>
              <div className="sdip-card-arrow">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {preview && (
        <CertificatePreview
          diploma={preview}
          studentName={studentName}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}
