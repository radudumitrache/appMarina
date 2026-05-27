import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { downloadDiplomaAsPdf } from '../../../utils/downloadDiploma'
import '../../css/student/progress/DiplomasSection.css'

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
    <div className="ds-overlay" onClick={onClose}>
      <div className="ds-wrap" onClick={e => e.stopPropagation()}>
        <div className="ds-actions">
          <button className="ds-download" onClick={handleDownload} disabled={downloading} title="Download as PDF">
            {downloading ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="ds-spin">
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
          <button className="ds-dismiss" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="ds-cert" ref={certRef}>
          <span className="ds-corner ds-corner--tl"/>
          <span className="ds-corner ds-corner--tr"/>
          <span className="ds-corner ds-corner--bl"/>
          <span className="ds-corner ds-corner--br"/>

          <div className="ds-cert-logo">
            <span className="ds-cert-logo-word">HANSA</span>
            <span className="ds-cert-logo-num">360</span>
          </div>

          <div className="ds-cert-rule">
            <span className="ds-cert-rule-line"/>
            <svg className="ds-cert-anchor" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="5" r="3"/>
              <line x1="12" y1="8" x2="12" y2="22"/>
              <path d="M5 15l7 7 7-7"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span className="ds-cert-rule-line"/>
          </div>

          <div className="ds-cert-title">{diploma.title || 'Certificate of Completion'}</div>

          <div className="ds-cert-intro">Hereby this diploma is awarded to</div>
          <div className="ds-cert-recipient">{studentName}</div>

          <div className="ds-cert-rule ds-cert-rule--sm">
            <span className="ds-cert-rule-line"/>
            <span className="ds-cert-rule-diamond"/>
            <span className="ds-cert-rule-line"/>
          </div>

          {diploma.description && (
            <p className="ds-cert-desc">{diploma.description}</p>
          )}

          <div className="ds-cert-footer">
            <div className="ds-cert-footer-col">
              <span className="ds-cert-footer-label">Department</span>
              <span className="ds-cert-footer-value">{diploma.department_name}</span>
            </div>
            <div className="ds-cert-footer-col">
              <span className="ds-cert-footer-label">Issued</span>
              <span className="ds-cert-footer-value">{formatDate(diploma.issued_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function DiplomasSection({ diplomas, studentName }) {
  const [preview, setPreview] = useState(null)

  if (diplomas.length === 0) return null

  return (
    <div className="progress-section">
      <div className="section-head">
        <span className="section-title">Diplomas Awarded</span>
        <span className="section-meta">
          <span className="section-meta-num">{diplomas.length}</span>
          {diplomas.length === 1 ? 'diploma' : 'diplomas'}
        </span>
      </div>

      <div className="ds-list">
        {diplomas.map((d, i) => (
          <button
            key={d.id}
            className="ds-row"
            style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            onClick={() => setPreview(d)}
          >
            <div className="ds-row-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
              </svg>
            </div>
            <div className="ds-row-body">
              <span className="ds-row-title">{d.title}</span>
              <span className="ds-row-class">{d.department_name}</span>
            </div>
            <span className="ds-row-date">{formatDate(d.issued_at)}</span>
            <svg className="ds-row-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        ))}
      </div>

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
