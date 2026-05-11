export default function LessonsSwitcher({ mode, onChange }) {
  return (
    <div className="les-switcher">
      <button
        className={`les-switch-btn ${mode === 'courses' ? 'les-switch-btn--active' : ''}`}
        onClick={() => onChange('courses')}
      >
        Class Courses
      </button>
      <button
        className={`les-switch-btn ${mode === 'public' ? 'les-switch-btn--active' : ''}`}
        onClick={() => onChange('public')}
      >
        Public Lessons
      </button>
    </div>
  )
}
