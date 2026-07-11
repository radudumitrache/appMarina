import '../../css/crew/progress/ModulesProgress.css'

const DIFF_LABEL = { easy: 'Easy', intermediate: 'Intermediate', advanced: 'Advanced' }

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function fmtDuration(mins) {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export default function ModulesProgress({ modules }) {
  if (modules.length === 0) {
    return (
      <section className="progress-section">
        <div className="section-head">
          <span className="section-title">Modules</span>
        </div>
        <p className="lp-empty">No modules assigned to your classes yet.</p>
      </section>
    )
  }

  const done  = modules.filter(l => l.completed).length
  const total = modules.length

  // Group by department
  const classMap = new Map()
  for (const l of modules) {
    if (!classMap.has(l.department_id)) {
      classMap.set(l.department_id, { name: l.department_name, modules: [] })
    }
    classMap.get(l.department_id).modules.push(l)
  }

  return (
    <section className="progress-section">
      <div className="section-head">
        <span className="section-title">Modules</span>
        <span className="section-meta">
          <span className="section-meta-num">{done}</span>/ {total} completed
        </span>
      </div>

      <div className="lp-body">
        {[...classMap.values()].map(cls => {
          const clsDone  = cls.modules.filter(l => l.completed).length
          const clsTotal = cls.modules.length
          const pct      = Math.round((clsDone / clsTotal) * 100)

          return (
            <div key={cls.name} className="lp-class">
              <div className="lp-class-head">
                <span className="lp-class-name">{cls.name}</span>
                <span className="lp-class-count">{clsDone}/{clsTotal}</span>
                <div className="lp-class-bar">
                  <div className="lp-class-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>

              <div className="lp-list">
                {cls.modules.map((l, i) => (
                  <div
                    key={l.id}
                    className={`lp-row ${l.completed ? 'lp-row--done' : ''}`}
                    style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
                  >
                    <div className={`lp-status ${l.completed ? 'lp-status--done' : 'lp-status--pending'}`}>
                      {l.completed ? <CheckIcon /> : null}
                    </div>
                    <span className="lp-title">{l.title}</span>
                    <div className="lp-meta">
                      {l.difficulty && (
                        <span className={`lp-diff lp-diff--${l.difficulty}`}>
                          {DIFF_LABEL[l.difficulty]}
                        </span>
                      )}
                      <span className="lp-duration">
                        <ClockIcon />
                        {fmtDuration(l.duration_minutes)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
