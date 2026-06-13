import SearchBar from './SearchBar'
import '../../css/teacher/class-detail/ClassTabBar.css'

const TABS = [
  { id: 'students',      label: 'Students'      },
  { id: 'modules',       label: 'Courses'       },
  { id: 'tests',         label: 'Tests'         },
  { id: 'announcements', label: 'Announcements' },
]

export default function ClassTabBar({ tab, onTabChange, search, onSearchChange, onNewTest }) {
  return (
    <div className="cd-tab-bar">
      <div className="cd-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`cd-tab ${tab === t.id ? 'cd-tab--active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'students' && (
        <div className="cd-toolbar">
          <SearchBar value={search} onChange={onSearchChange} placeholder="Search students…" />
        </div>
      )}
      {tab === 'tests' && (
        <div className="cd-toolbar">
          <button className="cd-btn-primary" onClick={onNewTest}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
            New Test
          </button>
        </div>
      )}
    </div>
  )
}
