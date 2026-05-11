export default function ProgressSkeleton() {
  return (
    <div className="progress-content">
      <div className="progress-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card" style={{ opacity: 1 - i * 0.15 }}>
            <span className="stat-label" style={{ background: 'var(--surface-3)', borderRadius: 4, color: 'transparent' }}>Loading</span>
            <div className="stat-value-row">
              <span className="stat-value" style={{ background: 'var(--surface-3)', borderRadius: 4, color: 'transparent' }}>--</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
