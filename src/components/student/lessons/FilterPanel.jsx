import { AUTHORS, DURATIONS, DIFFICULTIES, DEFAULT_FILTERS } from '../../../pages/student/Lessons'
import '../../css/student/lessons/FilterPanel.css'

// ── Helpers ────────────────────────────────────────────────────────────────

function toggle(arr, value) {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
}

// ── Sub-components ─────────────────────────────────────────────────────────

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

// ── Main component ─────────────────────────────────────────────────────────

export default function FilterPanel({ filters, onChange, onClear }) {
  const hasAny =
    filters.authors.length > 0 ||
    filters.status !== 'all'   ||
    filters.durations.length > 0 ||
    filters.difficulty.length > 0

  const set = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className="fp-panel" role="dialog" aria-label="Lesson filters">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="fp-header">
        <span className="fp-title">Filters</span>
        {hasAny && (
          <button className="fp-clear" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      <div className="fp-divider" />

      {/* ── Author ──────────────────────────────────────────────────── */}
      <div className="fp-section">
        <SectionHeader label="Author" />
        <div className="fp-chips">
          {AUTHORS.map(author => (
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

      {/* ── Completion status ────────────────────────────────────────── */}
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

      {/* ── Course duration ──────────────────────────────────────────── */}
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

      {/* ── Difficulty ───────────────────────────────────────────────── */}
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

      {/* ── Availability ─────────────────────────────────────────────── */}
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
