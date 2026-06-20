import '../../css/trainer/profile/QualificationsPanel.css'

const QUALIFICATIONS = [
  { id: 1, name: 'Chief Officer Certificate of Competency',  issued: '2015-06-01', expires: '2030-06-01', status: 'valid'    },
  { id: 2, name: 'STCW Instructor Certification',            issued: '2024-01-15', expires: '2029-01-15', status: 'valid'    },
  { id: 3, name: 'Advanced Fire Fighting Instructor',        issued: '2024-03-10', expires: '2029-03-10', status: 'valid'    },
  { id: 4, name: 'VR Platform Trainer Certification',        issued: '2024-09-01', expires: '2027-09-01', status: 'valid'    },
  { id: 5, name: 'ECDIS Type Approval Certificate',          issued: '2020-11-01', expires: '2025-11-01', status: 'expiring' },
  { id: 6, name: 'Dynamic Positioning Operator',             issued: null,         expires: null,          status: 'pending'  },
]

function formatDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function qualExpiresSoon(iso) {
  if (!iso) return false
  const diff = (new Date(iso) - new Date()) / (1000 * 60 * 60 * 24)
  return diff > 0 && diff <= 180
}

const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

export default function QualificationsPanel() {
  return (
    <div className="tp-panel">
      <div className="tp-panel-head">
        <span className="tp-panel-title">Qualifications</span>
      </div>

      <div className="tp-quals-list">
        {QUALIFICATIONS.map((q, i) => {
          const soon = q.status === 'expiring' || qualExpiresSoon(q.expires)
          const dotStatus = q.status === 'pending' ? 'pending' : soon ? 'soon' : 'valid'
          return (
            <div
              key={q.id}
              className="tp-qual-row"
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className={`tp-qual-dot tp-qual-dot--${dotStatus}`} />
              <div className="tp-qual-body">
                <span className="tp-qual-name">{q.name}</span>
                <div className="tp-qual-dates">
                  {q.issued
                    ? <>
                        <span>Issued {formatDate(q.issued)}</span>
                        <span className="tp-qual-sep">·</span>
                        <span className={soon ? 'tp-qual-expiry--soon' : ''}>
                          Expires {formatDate(q.expires)}
                        </span>
                      </>
                    : <span>Not yet issued</span>
                  }
                </div>
              </div>
              <span className={`tp-qual-badge tp-qual-badge--${dotStatus}`}>
                {q.status === 'pending' ? 'Pending' : soon ? 'Expiring soon' : 'Valid'}
              </span>
            </div>
          )
        })}
      </div>

      <div className="tp-panel-note">
        <InfoIcon />
        Qualification records are managed by your institution. Contact your coordinator for renewals or corrections.
      </div>
    </div>
  )
}
