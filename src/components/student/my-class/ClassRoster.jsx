import '../../css/student/my-class/ClassRoster.css'

function gradeColor(g) {
  if (g == null) return 'var(--text-3)'
  if (g >= 90)   return 'var(--success)'
  if (g >= 70)   return 'var(--accent)'
  if (g >= 50)   return 'var(--gold)'
  return 'var(--error)'
}

export default function ClassRoster({ classmates, myRank }) {
  return (
    <section className="myclass-section">
      <div className="section-head">
        <span className="section-title">Class Roster</span>
        <span className="section-meta">
          Your rank&nbsp;
          <span className="section-meta-num">{myRank}</span>
          &nbsp;of&nbsp;
          <span className="section-meta-num">{classmates.length}</span>
        </span>
      </div>

      <div className="roster-list">
        {classmates.map((student, i) => {
          const pct  = student.totalLessons > 0 ? (student.lessonsComplete / student.totalLessons) * 100 : 0
          const rank = i + 1
          return (
            <div
              key={student.id}
              className={`roster-row ${student.isMe ? 'roster-row--me' : ''}`}
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <span className="roster-rank">{rank}</span>
              <div className="roster-avatar">{student.avatar}</div>
              <div className="roster-body">
                <div className="roster-name-row">
                  <span className="roster-name">
                    {student.name}
                    {student.isMe && <span className="roster-you-tag">you</span>}
                  </span>
                  <span className="roster-grade" style={{ color: gradeColor(student.avgGrade) }}>
                    {student.avgGrade != null ? `${student.avgGrade}%` : '—'}
                  </span>
                </div>
                <div className="roster-bar-track">
                  <div
                    className={`roster-bar-fill ${pct === 100 ? 'roster-bar-fill--complete' : 'roster-bar-fill--progress'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="roster-fraction">
                {student.lessonsComplete}/{student.totalLessons}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
