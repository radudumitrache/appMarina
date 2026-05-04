import '../../css/teacher/support/SupportContact.css'

const CONTACTS = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: 'Instructor support',
    value: 'instructors@seafarer.academy',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    label: 'Response time',
    value: '1-2 business days',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 15z"/>
      </svg>
    ),
    label: 'Instructor hotline',
    value: '+1 (800) 732-2940',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    label: 'Live chat',
    value: 'Weekdays 08:00 - 18:00 UTC',
  },
]

export default function SupportContact() {
  return (
    <section className="ts-section" style={{ animationDelay: '0.09s' }}>
      <div className="ts-section-head">
        <span className="ts-section-title">Contact</span>
      </div>
      <div className="ts-contact-list">
        {CONTACTS.map((item, i) => (
          <div key={i} className="ts-contact-row">
            <div className="ts-contact-icon">{item.icon}</div>
            <div className="ts-contact-body">
              <span className="ts-contact-label">{item.label}</span>
              <span className="ts-contact-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
