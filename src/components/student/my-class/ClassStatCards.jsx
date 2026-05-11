import '../../css/student/my-class/ClassStatCards.css'

export default function ClassStatCards({ statCards }) {
  return (
    <div className="myclass-stats">
      {statCards.map((card, i) => (
        <div
          className="stat-card"
          key={card.label}
          style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}
        >
          <span className="stat-label">{card.label}</span>
          <div className="stat-value-row">
            <span className="stat-value">{card.value}</span>
            {card.suffix && <span className="stat-suffix">{card.suffix}</span>}
          </div>
          <span className="stat-sub">{card.sub}</span>
        </div>
      ))}
    </div>
  )
}
