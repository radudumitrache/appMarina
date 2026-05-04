import '../../css/student/profile/CertificationsTab.css'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function certExpiresSoon(iso) {
  if (!iso) return false
  const diff = (new Date(iso) - new Date()) / (1000 * 60 * 60 * 24)
  return diff > 0 && diff <= 180
}

export default function CertificationsTab({ certifications }) {
  return (
    <div className="profile-panel">
      <div className="panel-head">
        <span className="panel-title">Certifications</span>
      </div>

      <div className="certs-list">
        {certifications.map((cert, i) => {
          const soon   = certExpiresSoon(cert.expires)
          const status = cert.status === 'pending' ? 'pending' : soon ? 'soon' : 'valid'
          return (
            <div
              key={cert.id}
              className="cert-row"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className={`cert-status-dot cert-status-dot--${status}`} />
              <div className="cert-body">
                <span className="cert-name">{cert.name}</span>
                <div className="cert-dates">
                  {cert.issued ? (
                    <>
                      <span>Issued {formatDate(cert.issued)}</span>
                      <span className="cert-sep">·</span>
                      <span className={soon ? 'cert-expiry--soon' : ''}>
                        Expires {formatDate(cert.expires)}
                      </span>
                    </>
                  ) : (
                    <span>Not yet issued</span>
                  )}
                </div>
              </div>
              <span className={`cert-badge cert-badge--${status}`}>
                {cert.status === 'pending' ? 'Pending' : soon ? 'Expiring soon' : 'Valid'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="panel-note">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Certification records are managed by your institution. Contact your coordinator for renewals or corrections.
      </div>
    </div>
  )
}
