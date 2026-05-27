import { totalDuration } from './courseBuilderUtils'
import '../../css/teacher/course-builder/CourseSidebar.css'

function CourseItem({ c, selectedId, courseLessonsMap, onSelect }) {
  const lessons = courseLessonsMap[c.id]
  const count   = lessons?.length ?? (c.lesson_count ?? 0)
  return (
    <button
      key={c.id}
      className={`cb-course-item ${selectedId === c.id ? 'cb-course-item--active' : ''}`}
      onClick={() => onSelect(c.id)}
    >
      <div className="cb-course-item-row">
        <span className="cb-course-item-title">{c.title}</span>
        <span className={`cb-course-item-status ${c.status === 'published' ? 'cb-status--published' : 'cb-status--draft'}`}>
          {c.status === 'published' ? 'Pub' : 'Draft'}
        </span>
      </div>
      <div className="cb-course-item-meta">
        <span>{count} lesson{count !== 1 ? 's' : ''}</span>
        {lessons && lessons.length > 0 && <span>{totalDuration(lessons)}</span>}
      </div>
    </button>
  )
}

export default function CourseSidebar({
  loading,
  error,
  visible,
  selectedId,
  courseLessonsMap,
  search,
  setSearch,
  onSelect,
  onNew,
  totalCount,
  publishedCount,
  lessonBankCount,
  onShowAllLessons,
  showingAllLessons,
  classes = [],
}) {
  const groups = (() => {
    const result = []
    for (const cls of classes) {
      const items = visible.filter(c => c.department_id === cls.id)
      if (items.length > 0) result.push({ label: cls.name, code: cls.code, items })
    }
    const unassigned = visible.filter(c => !c.department_id || !classes.some(cls => cls.id === c.department_id))
    if (unassigned.length > 0) result.push({ label: 'Unassigned', code: null, items: unassigned })
    return result
  })()

  return (
    <aside className="cb-sidebar">
      <div className="cb-sidebar-top">
        <div className="cb-sidebar-search-wrap">
          <svg className="cb-sidebar-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="cb-sidebar-search"
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="cb-new-btn" onClick={onNew}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New
        </button>
      </div>

      <nav className="cb-course-nav">
        {loading && <div className="cb-sidebar-empty">Loading…</div>}
        {error && !loading && <div className="cb-sidebar-empty cb-sidebar-empty--error">{error}</div>}
        {!loading && !error && visible.length === 0 && (
          <div className="cb-sidebar-empty">No courses yet</div>
        )}
        {!loading && !error && classes.length > 0
          ? groups.map(group => (
              <div key={group.label} className="cb-course-group">
                <div className="cb-course-group-label">
                  <span className="cb-course-group-name">{group.label}</span>
                  {group.code && <span className="cb-course-group-code">{group.code}</span>}
                </div>
                {group.items.map(c => (
                  <CourseItem key={c.id} c={c} selectedId={selectedId} courseLessonsMap={courseLessonsMap} onSelect={onSelect} />
                ))}
              </div>
            ))
          : visible.map(c => (
              <CourseItem key={c.id} c={c} selectedId={selectedId} courseLessonsMap={courseLessonsMap} onSelect={onSelect} />
            ))
        }
      </nav>

      <div className="cb-sidebar-bottom">
        <button
          className={`cb-all-lessons-btn ${showingAllLessons ? 'cb-all-lessons-btn--active' : ''}`}
          onClick={onShowAllLessons}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          All Lessons
          <span className="cb-all-lessons-count">{lessonBankCount}</span>
        </button>
        <div className="cb-sidebar-footer">
          <span className="cb-sidebar-footer-num">{publishedCount}</span>
          {' '}of{' '}
          <span className="cb-sidebar-footer-num">{totalCount}</span>
          {' '}published
        </div>
      </div>
    </aside>
  )
}
