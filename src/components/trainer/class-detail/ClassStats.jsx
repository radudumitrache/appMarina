import '../../css/trainer/class-detail/ClassStats.css'

export default function ClassStats({ totalCrew, activeCrew, avgProgress, coursesDone, coursesTotal, subject }) {
  return (
    <div className="cd-stats">
      <div className="cd-stat-card">
        <span className="cd-stat-label">Crew Members</span>
        <span className="cd-stat-value">{totalCrew}</span>
        <span className="cd-stat-sub">{activeCrew} active</span>
      </div>
      <div className="cd-stat-card">
        <span className="cd-stat-label">Avg. Progress</span>
        <span className="cd-stat-value">{avgProgress}%</span>
        <span className="cd-stat-sub">across all crew</span>
      </div>
      <div className="cd-stat-card">
        <span className="cd-stat-label">Courses Complete</span>
        <span className="cd-stat-value">{coursesDone}/{coursesTotal}</span>
        <span className="cd-stat-sub">by the whole department</span>
      </div>
      <div className="cd-stat-card">
        <span className="cd-stat-label">Subject</span>
        <span className="cd-stat-subject">{subject}</span>
      </div>
    </div>
  )
}
