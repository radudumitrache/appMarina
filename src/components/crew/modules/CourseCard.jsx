import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeModule, uncompleteModule } from '../../../api/modules'
import '../../css/crew/modules/CourseCard.css'

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const TestIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
)

function isEntryCompleted(cl) {
  if (cl.test) return cl.test_completed === true
  return cl.module_detail?.completed === true
}

export default function CourseCard({ course, index, onModuleToggle }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const delay = `${Math.min(index, 6) * 0.04}s`

  const modules = course.modules ?? []
  const total = modules.length
  const completed = modules.filter(isEntryCompleted).length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  function handleToggle(cl, isLocked, e) {
    e.stopPropagation()
    if (isLocked) return
    const wasComplete = !!cl.module_detail?.completed
    onModuleToggle(course.id, cl.module, !wasComplete)
    const apiCall = wasComplete ? uncompleteModule : completeModule
    apiCall(cl.module).catch(() => onModuleToggle(course.id, cl.module, wasComplete))
  }

  return (
    <div className="crs-card" style={{ animationDelay: delay }}>
      <div className="crs-header" onClick={() => setExpanded(v => !v)}>
        <div className="crs-info">
          <span className="crs-title">{course.title}</span>
          <span className="crs-meta">{completed} / {total} items complete</span>
        </div>
        <div className="crs-right">
          <div className="crs-bar">
            <div className="crs-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="crs-pct">{pct}%</span>
          <span className={`crs-chevron ${expanded ? 'crs-chevron--open' : ''}`}>
            <ChevronIcon />
          </span>
        </div>
      </div>

      {expanded && (
        <div className="crs-modules">
          {modules.length === 0 ? (
            <p className="crs-empty">No modules in this course yet.</p>
          ) : (
            modules.map((cl, i) => {
              // An item is locked if ANY prior item (lesson or test) is not completed
              const seqLocked = modules.slice(0, i).some(prev => !isEntryCompleted(prev))

              if (cl.test) {
                const td = cl.test_detail ?? {}
                const isDone = cl.test_completed === true
                const isLocked = seqLocked
                return (
                  <div
                    key={cl.id}
                    className={`crs-module crs-module--test ${isLocked ? 'crs-module--locked' : ''}`}
                    onClick={() => !isLocked && navigate(`/crew/tests/${cl.test}`)}
                    role={isLocked ? undefined : 'button'}
                    tabIndex={isLocked ? undefined : 0}
                    onKeyDown={e => { if (!isLocked && (e.key === 'Enter' || e.key === ' ')) navigate(`/crew/tests/${cl.test}`) }}
                  >
                    <span className="crs-module-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="crs-module-title">{td.title ?? '—'}</span>
                    <span className="crs-module-dur">{td.time_limit_minutes ? `${td.time_limit_minutes} min` : '—'}</span>
                    {isLocked ? (
                      <span className="crs-module-icon crs-module-icon--lock"><LockIcon /></span>
                    ) : isDone ? (
                      <span className="crs-module-toggle crs-module-toggle--done" title="Test completed">
                        <CheckIcon />
                      </span>
                    ) : (
                      <span className="crs-module-icon crs-module-icon--test"><TestIcon /></span>
                    )}
                  </div>
                )
              }

              const ld = cl.module_detail ?? {}
              const isLocked = ld.locked || seqLocked
              const isDone = !!ld.completed
              return (
                <div
                  key={cl.id}
                  className={`crs-module ${isLocked ? 'crs-module--locked' : ''}`}
                  onClick={() => !isLocked && navigate(`/crew/modules/${cl.module}`, { state: { module: ld } })}
                  role={isLocked ? undefined : 'button'}
                  tabIndex={isLocked ? undefined : 0}
                  onKeyDown={e => { if (!isLocked && (e.key === 'Enter' || e.key === ' ')) navigate(`/crew/modules/${cl.module}`) }}
                >
                  <span className="crs-module-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="crs-module-title">{ld.title ?? '—'}</span>
                  <span className="crs-module-dur">{ld.duration_minutes ? `${ld.duration_minutes} min` : '—'}</span>
                  {isLocked ? (
                    <span className="crs-module-icon crs-module-icon--lock"><LockIcon /></span>
                  ) : (
                    <button
                      className={`crs-module-toggle ${isDone ? 'crs-module-toggle--done' : ''}`}
                      onClick={e => handleToggle(cl, isLocked, e)}
                      title={isDone ? 'Mark incomplete' : 'Mark complete'}
                    >
                      <CheckIcon />
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
