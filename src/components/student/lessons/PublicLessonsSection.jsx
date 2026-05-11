import LessonCard from './LessonCard'

export const CATEGORIES = [
  { id: 'all',   label: 'All'               },
  { id: 'nav',   label: 'Bridge Navigation' },
  { id: 'emg',   label: 'Emergency'         },
  { id: 'eng',   label: 'Engine Room'       },
  { id: 'cargo', label: 'Cargo'             },
  { id: 'comm',  label: 'Communications'    },
]

export default function PublicLessonsSection({ lessons, activeCategory, onCategoryChange, onToggleComplete }) {
  const filtered = activeCategory === 'all'
    ? lessons
    : lessons.filter(l => l.cat === activeCategory)

  return (
    <div className="les-section">
      <div className="les-cat-pills">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`les-cat-pill ${activeCategory === cat.id ? 'les-cat-pill--active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="les-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>No public lessons in this category.</span>
        </div>
      ) : (
        <div className="lessons-list lessons-list--grid">
          {filtered.map((lesson, i) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={i}
              viewMode="grid"
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
