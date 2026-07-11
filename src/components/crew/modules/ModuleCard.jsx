import { useNavigate } from 'react-router-dom'
import '../../css/crew/modules/ModuleCard.css'

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

export default function ModuleCard({ module, index, viewMode = 'grid', onToggleComplete }) {
  const navigate = useNavigate()
  const delay = `${Math.min(index, 6) * 0.04}s`
  const lockedClass = module.locked ? 'module-card--locked' : ''

  const handleCardClick = () => {
    if (!module.locked) navigate(`/crew/modules/${module.id}`, { state: { module } })
  }

  if (viewMode === 'list') {
    return (
      <div
        className={`module-card module-card--list ${lockedClass}`}
        style={{ animationDelay: delay }}
        onClick={handleCardClick}
        role={module.locked ? undefined : 'button'}
        tabIndex={module.locked ? undefined : 0}
        onKeyDown={e => { if (!module.locked && (e.key === 'Enter' || e.key === ' ')) handleCardClick() }}
      >
        <span className="module-num">{String(index + 1).padStart(2, '0')}</span>

        <div className="module-body">
          <span className="module-title">{module.title}</span>
          <span className="module-author">{module.author}</span>
        </div>

        <span className="module-duration">{module.duration}</span>

        <span className={`module-badge module-badge--vis-${module.visibility}`}>
          {module.visibility === 'class' ? 'My Department' : 'Public'}
        </span>

        <span className={`module-badge module-badge--${module.complete ? 'complete' : 'pending'}`}>
          {module.complete ? 'Complete' : 'Not started'}
        </span>

        {module.locked ? (
          <span className="module-lock-icon"><LockIcon /></span>
        ) : (
          <button
            className={`module-toggle ${module.complete ? 'module-toggle--done' : ''}`}
            onClick={e => { e.stopPropagation(); onToggleComplete(module.id) }}
            title={module.complete ? 'Mark incomplete' : 'Mark complete'}
          >
            <CheckIcon />
          </button>
        )}
      </div>
    )
  }

  // â”€â”€ Grid mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div
      className={`module-card module-card--grid ${lockedClass}`}
      style={{ animationDelay: delay }}
      onClick={handleCardClick}
      role={module.locked ? undefined : 'button'}
      tabIndex={module.locked ? undefined : 0}
      onKeyDown={e => { if (!module.locked && (e.key === 'Enter' || e.key === ' ')) handleCardClick() }}
    >
      <span className="module-num">{String(index + 1).padStart(2, '0')}</span>

      <div className="module-body">
        <span className="module-title">{module.title}</span>
        <span className="module-duration">{module.duration}</span>
      </div>

      {module.locked ? (
        <span className="module-lock-icon"><LockIcon /></span>
      ) : (
        <button
          className={`module-toggle ${module.complete ? 'module-toggle--done' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleComplete(module.id) }}
          title={module.complete ? 'Mark incomplete' : 'Mark complete'}
        >
          <CheckIcon />
        </button>
      )}
    </div>
  )
}
