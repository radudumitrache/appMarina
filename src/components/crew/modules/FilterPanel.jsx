import { DURATIONS, DIFFICULTIES } from '../../../pages/crew/Lessons'
import '../../css/crew/modules/FilterPanel.css'

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function toggle(arr, value) {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
}

// â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SectionHeader({ label }) {
  return <p className="fp-section-label">{label}</p>
}

function Chip({ active, onClick, children }) {
  return (
    <button
      className={`fp-chip ${active ? 'fp-chip--active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function FilterPanel({ filters, onChange, onClear, authors = [] }) {
  const hasAny =
    filters.authors.length > 0 ||
    filters.status !== 'all'   ||
    filters.durations.length > 0 ||
    filters.difficulty.length > 0

  const set = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className="fp-panel" role="dialog" aria-label="Module filters">

      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="fp-header">
        <span className="fp-title">Filters</span>
        {hasAny && (
          <button className="fp-clear" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      <div className="fp-divider" />

      {/* â”€â”€ Author â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="fp-section">
        <SectionHeader label="Author" />
        <div className="fp-chips">
          {authors.map(author => (
            <Chip
              key={author}
              active={filters.authors.includes(author)}
              onClick={() => set('authors', toggle(filters.authors, author))}
            >
              {author}
            </Chip>
          ))}
        </div>
      </div>

      <div className="fp-divider" />

      {/* â”€â”€ Completion status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="fp-section">
        <SectionHeader label="Status" />
        <div className="fp-chips">
          {[
            { id: 'all',        label: 'All'        },
            { id: 'complete',   label: 'Complete'   },
            { id: 'incomplete', label: 'Incomplete' },
          ].map(s => (
            <Chip
              key={s.id}
              active={filters.status === s.id}
              onClick={() => set('status', s.id)}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="fp-divider" />

      {/* â”€â”€ Course duration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="fp-section">
        <SectionHeader label="Duration" />
        <div className="fp-chips">
          {DURATIONS.map(d => (
            <Chip
              key={d.id}
              active={filters.durations.includes(d.id)}
              onClick={() => set('durations', toggle(filters.durations, d.id))}
            >
              {d.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="fp-divider" />

      {/* â”€â”€ Difficulty â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="fp-section">
        <SectionHeader label="Difficulty" />
        <div className="fp-chips">
          {DIFFICULTIES.map(d => (
            <Chip
              key={d.id}
              active={filters.difficulty.includes(d.id)}
              onClick={() => set('difficulty', toggle(filters.difficulty, d.id))}
            >
              {d.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="fp-divider" />

      {/* â”€â”€ Availability â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="fp-section">
        <SectionHeader label="Access" />
        <div className="fp-chips">
          {[
            { id: 'unlocked', label: 'Unlocked' },
            { id: 'locked',   label: 'Locked'   },
          ].map(a => (
            <Chip
              key={a.id}
              active={filters.access === a.id}
              onClick={() =>
                set('access', filters.access === a.id ? 'all' : a.id)
              }
            >
              {a.label}
            </Chip>
          ))}
        </div>
      </div>

    </div>
  )
}
