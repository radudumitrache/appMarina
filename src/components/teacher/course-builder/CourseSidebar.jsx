import { totalDuration } from './courseBuilderUtils'
import '../../css/teacher/course-builder/CourseSidebar.css'

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
}) {
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
          <div className="cb-sidebar-empty">No courses found</div>
        )}
        {visible.map(c => {
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
                  {c.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="cb-course-item-meta">
                <span>{count} lesson{count !== 1 ? 's' : ''}</span>
                {lessons && lessons.length > 0 && <span>{totalDuration(lessons)}</span>}
              </div>
            </button>
          )
        })}
      </nav>

      <div className="cb-sidebar-footer">
        <span className="cb-sidebar-footer-num">{publishedCount}</span>
        {' '}of{' '}
        <span className="cb-sidebar-footer-num">{totalCount}</span>
        {' '}published
      </div>
    </aside>
  )
}
