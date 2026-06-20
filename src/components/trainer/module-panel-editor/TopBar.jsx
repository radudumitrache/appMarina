import { IconArrowLeft } from './LPEIcons'

/* â”€â”€ TopBar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
 * Fixed header: back button, module title + EDITING badge, prev/next arrows.
 *
 * Props:
 *   lessonTitle      {string|null}
 *   lessonId         {string}
 *   panelCount       {number}
 *   panelIdx         {number}
 *   onChangePanelIdx {Function}  receives a React state updater (i => i Â± 1)
 *   onBack           {Function}
 */
export default function TopBar({ moduleTitle, moduleId, panelCount, panelIdx, onChangePanelIdx, onBack, backLabel = 'Builder' }) {
  return (
    <header className="lpe-topbar">
      <button className="lpe-back-btn" onClick={onBack}>
        <IconArrowLeft />
        {backLabel}
      </button>

      <div className="lpe-topbar-center">
        <span className="lpe-module-title">{moduleTitle ?? `Module ${moduleId}`}</span>
        <span className="lpe-trainer-badge">EDITING</span>
      </div>

      <div className="lpe-topbar-right">
        {panelCount > 0 && (
          <span className="lpe-panel-counter">
            <span className="lpe-panel-cur">{panelIdx + 1}</span>
            <span className="lpe-panel-sep"> / </span>
            <span className="lpe-panel-tot">{panelCount}</span>
          </span>
        )}
        <button
          className="lpe-nav-btn"
          disabled={panelIdx === 0}
          onClick={() => onChangePanelIdx(i => i - 1)}
          title="Previous panel"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <button
          className="lpe-nav-btn"
          disabled={panelIdx === panelCount - 1}
          onClick={() => onChangePanelIdx(i => i + 1)}
          title="Next panel"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
