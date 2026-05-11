export default function ProgressStatCards({ cards }) {
  return (
    <div className="progress-stats">
      {cards.map((card, i) => (
        <div
          className="stat-card"
          key={card.label}
          style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
        >
          <span className="stat-label">{card.label}</span>
          <div className="stat-value-row">
            <span className="stat-value">{card.value}</span>
            <span className="stat-suffix">{card.suffix}</span>
          </div>
          <span className="stat-sub">{card.sub}</span>
        </div>
      ))}
    </div>
  )
}
