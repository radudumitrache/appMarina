import '../../css/admin/class-detail/ClassDetailHeader.css'

function formatDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function MetaChip({ icon, label, value }) {
  if (!value) return null
  return (
    <div className="cd-meta-chip">
      {icon}
      <span className="cd-meta-label">{label}</span>
      <span className="cd-meta-value">{value}</span>
    </div>
  )
}

export default function ClassDetailHeader({ cls, studentCount = 0, courseCount = 0, testCount = 0 }) {
  const startFmt = formatDate(cls.start_date)
  const endFmt   = formatDate(cls.end_date)
  const dateRange = startFmt && endFmt ? `${startFmt} — ${endFmt}` : startFmt || endFmt || null

  return (
    <div className="cd-header">
      <div className="cd-header-left">
        <div className="cd-name-row">
          <h1 className="cd-name">{cls.name}</h1>
          <span className={`cd-status-badge cd-status-badge--${cls.status}`}>{cls.status}</span>
        </div>
        {cls.description && <p className="cd-description">{cls.description}</p>}
        <div className="cd-teacher-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="cd-teacher-name">{cls.teacher_name}</span>
        </div>
        <div className="cd-meta-strip">
          <MetaChip
            icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>}
            label="Code"
            value={cls.code}
          />
          <MetaChip
            icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
            label="Subject"
            value={cls.subject}
          />
          {dateRange && (
            <MetaChip
              icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              label="Period"
              value={dateRange}
            />
          )}
        </div>
      </div>
      <div className="cd-header-stats">
        <div className="cd-stat">
          <span className="cd-stat-value">{studentCount}</span>
          <span className="cd-stat-label">Students</span>
        </div>
        <div className="cd-stat-sep" />
        <div className="cd-stat">
          <span className="cd-stat-value">{courseCount}</span>
          <span className="cd-stat-label">Courses</span>
        </div>
        <div className="cd-stat-sep" />
        <div className="cd-stat">
          <span className="cd-stat-value">{testCount}</span>
          <span className="cd-stat-label">Tests</span>
        </div>
      </div>
    </div>
  )
}
