import '../../css/student/progress/ModuleProgress.css'

export default function ModuleProgress({ modules, overallPct }) {
  return (
    <section className="progress-section">
      <div className="section-head">
        <span className="section-title">Module Progress</span>
        <span className="section-meta">
          <span className="section-meta-num">{overallPct}%</span> overall
        </span>
      </div>

      <div className="module-list">
        {modules.map((mod, i) => {
          const pct    = mod.total > 0 ? (mod.done / mod.total) * 100 : 0
          const status = mod.done === mod.total && mod.total > 0 ? 'complete' : mod.done > 0 ? 'progress' : 'none'
          return (
            <div
              className="module-row"
              key={mod.id}
              style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
            >
              <div className="module-row-top">
                <span className="module-label">{mod.label}</span>
                <div className="module-row-right">
                  {mod.hours > 0 && <span className="module-hours">{mod.hours}h</span>}
                  <span className="module-fraction">{mod.done}/{mod.total}</span>
                </div>
              </div>
              <div className="module-bar-track">
                <div className={`module-bar-fill module-bar-fill--${status}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
