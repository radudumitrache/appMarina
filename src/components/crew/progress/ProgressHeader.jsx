export default function ProgressHeader({ onBack }) {
  return (
    <header className="progress-header">
      <div className="progress-breadcrumb">
        <button className="breadcrumb-link" onClick={onBack}>Dashboard</button>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span className="breadcrumb-current">My Progress</span>
      </div>
      <h1 className="progress-page-title">My Progress</h1>
    </header>
  )
}
