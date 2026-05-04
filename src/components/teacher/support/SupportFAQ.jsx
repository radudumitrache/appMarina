import { useState } from 'react'
import { FAQ } from '../../../pages/teacher/supportMock'
import '../../css/teacher/support/SupportFAQ.css'

export default function SupportFAQ() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <section className="ts-section" style={{ animationDelay: '0.03s' }}>
      <div className="ts-section-head">
        <span className="ts-section-title">FAQ</span>
      </div>
      <div className="ts-faq-list">
        {FAQ.map((item, i) => (
          <div
            key={item.id}
            className={`ts-faq-item ${openFaq === item.id ? 'ts-faq-item--open' : ''}`}
            style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
          >
            <button
              className="ts-faq-q"
              onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
            >
              <span>{item.q}</span>
              <svg
                className="ts-faq-chevron"
                width="14" height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {openFaq === item.id && (
              <p className="ts-faq-a">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
