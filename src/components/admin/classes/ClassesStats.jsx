import '../../css/admin/classes/ClassesStats.css'

export default function ClassesStats({ stats }) {
  const items = [
    { label: 'Total Classes',     value: stats.total    },
    { label: 'Active',            value: stats.active   },
    { label: 'Archived',          value: stats.archived },
    { label: 'Students Enrolled', value: stats.students },
  ]

  return (
    <div className="classes-stats">
      {items.map(s => (
        <div key={s.label} className="stat-pill">
          <span className="stat-pill-value">{s.value}</span>
          <span className="stat-pill-label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
