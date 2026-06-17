import SearchBar from './SearchBar'
import '../../css/teacher/class-detail/ClassTabBar.css'

const TABS = [
  { id: 'students',      label: 'Students'      },
  { id: 'modules',       label: 'Courses'       },
  { id: 'announcements', label: 'Announcements' },
]

export default function ClassTabBar({ tab, onTabChange, search, onSearchChange }) {
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
    </div>
  )
}
