import { useState } from 'react'
import { fmt } from '../../admin/crew-progress/helpers'

function ChevronIcon({ open }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease', flexShrink: 0, color: 'var(--text-3)' }}
    >
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  )
}

function ItemRow({ item }) {
  const isTest = item.type === 'test'

  return (
    <div className={`cp-item-row ${item.completed ? 'cp-item-row--done' : 'cp-item-row--pending'}`}>
      <div className={`cp-item-type-icon ${isTest ? 'cp-item-type-icon--test' : 'cp-item-type-icon--module'}`}>
        {isTest ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        )}
      </div>

      <div className="cp-item-body">
        <span className="cp-item-title">{item.title}</span>
        <span className="cp-item-meta">
          {isTest && <span className="cp-item-type-tag">Test</span>}
          {item.completed
            ? (isTest && item.grade != null
                ? `${Math.round(item.grade)}% · ${fmt(item.completed_at)}`
                : fmt(item.completed_at))
            : 'Not completed'}
        </span>
      </div>

      <div className="cp-item-check">
        {item.completed ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        )}
      </div>
    </div>
  )
}

function CourseCard({ course, index }) {
  const [open, setOpen] = useState(true)
  const items = course.items ?? []
  const done  = items.filter(i => i.completed).length
  const total = items.length

  return (
    <div className="cp-course-card" style={{ animationDelay: `${Math.min(index, 6) * 0.04}s` }}>
      <button className="cp-course-header" onClick={() => setOpen(o => !o)}>
        <div className="cp-course-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        </div>
        <span className="cp-course-title">{course.course_title}</span>
        <span className="cp-course-progress">{done}/{total}</span>
        {course.completed && (
          <span className="cp-course-badge cp-course-badge--done">Complete</span>
        )}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="cp-item-list">
          {items.map(item => (
            <ItemRow key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CourseProgressSection({ courses }) {
  const completedCount = courses.filter(c => c.completed).length

  return (
    <div className="sp-section cp-section">
      <div className="sp-section-head">
        <span className="sp-section-title">Courses</span>
        <span className="sp-section-count">{completedCount}/{courses.length} complete</span>
      </div>

      {courses.length === 0 ? (
        <p className="sp-empty">No courses assigned yet.</p>
      ) : (
        <div className="sp-list">
          {courses.map((course, i) => (
            <CourseCard key={course.course_id} course={course} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
