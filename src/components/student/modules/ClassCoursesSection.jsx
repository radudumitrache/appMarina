import { useNavigate } from 'react-router-dom'
import CourseCard from './CourseCard'

export default function ClassCoursesSection({ classes, courseGroups, onModuleToggle }) {
  const navigate = useNavigate()

  if (classes.length === 0) {
    return (
      <div className="les-section">
        <div className="les-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span>You haven't joined a department yet.</span>
          <button className="les-join-link" onClick={() => navigate('/student/my-class')}>
            Go to My Department â†’
          </button>
        </div>
      </div>
    )
  }

  if (courseGroups.length === 0) {
    return (
      <div className="les-section">
        <div className="les-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span>No published courses in your departments yet.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="les-section">
      {courseGroups.map(({ cls, items }) => (
        <div key={cls.id} className="les-class-group">
          <div className="les-class-group-header">
            <span className="les-class-group-name">{cls.name}</span>
            <span className="les-class-group-code">{cls.code}</span>
            <span className="les-class-group-count">{items.length} course{items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="les-course-list">
            {items.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                onModuleToggle={onModuleToggle}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
