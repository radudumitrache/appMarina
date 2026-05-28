import '../../css/student/test-taker/TestSidebar.css'

function isPanelDone(panel, answers) {
  if (panel.type === 'vr_exercise') {
    const vr = panel.vr_exercise
    if (!vr) return true
    const keys = [
      ...(vr.mcq_anchors             ?? []).map(a => `vr_mcq_${a.id}`),
      ...(vr.tf_anchors              ?? []).map(a => `vr_tf_${a.id}`),
      ...(vr.short_anchors           ?? []).map(a => `vr_short_${a.id}`),
      ...(vr.word_completion_anchors ?? []).map(a => `vr_word_${a.id}`),
      ...(vr.localization_anchors    ?? []).map(a => `vr_loc_${a.id}`),
    ]
    if (keys.length === 0) return true
    return keys.every(key => {
      const val = answers[key]
      if (val === undefined || val === null) return false
      return val !== ''
    })
  }
  const exercises = panel.exercise_content?.exercises ?? []
  if (exercises.length === 0) return false
  return exercises.every(ex => {
    const val = answers[ex.id]
    if (val === undefined || val === null) return false
    if (Array.isArray(val)) return val.length > 0
    return val !== ''
  })
}

export default function TestSidebar({ panels, panelIdx, answers, onSelect, className = '' }) {
  return (
    <nav className={`tt-sidebar${className ? ` ${className}` : ''}`}>
      {panels.map((panel, idx) => {
        const done   = isPanelDone(panel, answers)
        const active = idx === panelIdx
        let cls = 'tt-nav-item'
        if (active)      cls += ' tt-nav-item--active'
        else if (done)   cls += ' tt-nav-item--done'

        return (
          <button key={panel.id} className={cls} onClick={() => onSelect(idx)}>
            <span className="tt-nav-num">{String(idx + 1).padStart(2, '0')}</span>
            <span className="tt-nav-label">{panel.title}</span>

            {panel.type === 'vr_exercise' && (
              <span className="tt-nav-vr">VR</span>
            )}

            {done && !active && (
              <svg className="tt-nav-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        )
      })}
    </nav>
  )
}
