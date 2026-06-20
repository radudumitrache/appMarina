import { useState } from 'react'
import '../../css/trainer/support/SupportFAQ.css'

const FAQ = [
  { id: 1, q: 'How do I add students to my department?', a: 'Go to Departments, open the department detail, and use the student search field to enroll students by name or email.' },
  { id: 2, q: 'How do I assign a module to a department?', a: 'Inside a department detail page, use the module search field to find and assign any available module.' },
  { id: 3, q: 'Can students see modules before I assign them?', a: 'Only public modules are visible to all students. Department-visibility modules are only accessible to students enrolled in a department they are assigned to.' },
  { id: 4, q: 'How long does it take to get a support reply?', a: 'Our support team typically responds within 1â€“2 business days.' },
  { id: 5, q: 'Who do I contact for urgent technical issues?', a: 'Use the contact form below or email support@seafarer.edu for urgent matters.' },
]

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
