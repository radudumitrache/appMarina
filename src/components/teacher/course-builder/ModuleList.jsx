import { useNavigate } from 'react-router-dom'
import { formatDuration } from './courseBuilderUtils'
import '../../css/teacher/course-builder/ModuleList.css'

const TYPE_SHORT = { vr_tour: 'VR', text: 'Text' }

export default function ModuleList({ selectedModules, loadingDetail, onRemove, onMove, onNavigatePanels, onViewModule }) {
  const navigate = useNavigate()

  if (loadingDetail) {
    return (
      <div className="cb-loading">
        <div className="cb-spinner" />
      </div>
    )
  }

  if (!selectedModules) return null

  return (
    <div className="cb-module-list">
      {selectedModules.length === 0 && (
        <div className="cb-empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <span>No modules yet. Add from the bank below.</span>
        </div>
      )}

      {selectedModules.map((module, i) => {
        const isTest = module._type === 'test'
        const removeId = module._courseModuleId ?? module.id
        return (
          <div
            key={module._courseModuleId ?? module.id}
            className="cb-module-row"
            style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
          >
            <span className="cb-module-num">{String(i + 1).padStart(2, '0')}</span>
            <div className="cb-module-body">
              <span className="cb-module-title">{module.title}</span>
              <div className="cb-module-meta">
                {isTest ? (
                  <span className="cb-type-badge cb-type--test">Test</span>
                ) : (
                  module.type && (
                    <span className={`cb-type-badge cb-type--${module.type}`}>
                      {TYPE_SHORT[module.type] ?? module.type}
                    </span>
                  )
                )}
                {!isTest && (
                  <span className="cb-module-duration">{formatDuration(module.duration_minutes)}</span>
                )}
                {isTest && module.time_limit_minutes && (
                  <span className="cb-module-duration">{module.time_limit_minutes} min</span>
                )}
              </div>
            </div>
            <div className="cb-module-actions">
              {!isTest && (
                <button
                  className="cb-view-module-btn"
                  onClick={() => onViewModule?.(module)}
                  title="View module"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View
                </button>
              )}
              {isTest && (
                <button
                  className="cb-view-module-btn"
                  onClick={() => navigate(`/teacher/assignments?test=${module.testId}`)}
                  title="View test"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View
                </button>
              )}
              <button
                className="cb-reorder-btn"
                disabled={i === 0}
                onClick={() => onMove(i, -1)}
                title="Move up"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              </button>
              <button
                className="cb-reorder-btn"
                disabled={i === selectedModules.length - 1}
                onClick={() => onMove(i, 1)}
                title="Move down"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <button
                className="cb-remove-btn"
                onClick={() => onRemove(removeId)}
                title="Remove from course"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6"  y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
