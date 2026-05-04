import '../../css/student/support/FaqAccordion.css'
import { useState } from 'react'

export default function FaqAccordion({ items }) {
  const [openId, setOpenId] = useState(null)

  return (
    <section className="support-section">
      <div className="section-head">
        <span className="section-title">FAQ</span>
      </div>
      <div className="faq-list">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`faq-item ${openId === item.id ? 'faq-item--open' : ''}`}
            style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
          >
            <button
              className="faq-q"
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
              aria-expanded={openId === item.id}
            >
              <span>{item.q}</span>
              <svg className="faq-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {openId === item.id && <p className="faq-a">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
