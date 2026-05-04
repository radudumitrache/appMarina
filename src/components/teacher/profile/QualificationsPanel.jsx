import { QUALIFICATIONS } from '../../../pages/teacher/profileMock'
import '../../css/teacher/profile/QualificationsPanel.css'
import { formatDate, qualExpiresSoon } from '../../../pages/teacher/profileUtils'

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
