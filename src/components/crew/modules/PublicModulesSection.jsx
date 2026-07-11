import ModuleCard from './ModuleCard'

export default function PublicModulesSection({ modules, onToggleComplete }) {
  return (
    <div className="les-section">
      {modules.length === 0 ? (
        <div className="les-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>No public modules available.</span>
        </div>
      ) : (
        <div className="modules-list modules-list--grid">
          {modules.map((module, i) => (
            <ModuleCard
              key={module.id}
              module={module}
              index={i}
              viewMode="grid"
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
