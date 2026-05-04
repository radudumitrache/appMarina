import '../../css/admin/dashboard/DashNav.css'

export default function DashNav({ actions, onNavigate }) {
  return (
    <div className="dash-nav">
      {actions.map((action, i) => (
        <button
          key={action.id}
          className="dash-btn"
          style={{ animationDelay: `${0.5 + i * 0.07}s` }}
          onClick={() => onNavigate(action.path)}
        >
          <span className="dash-btn-icon">{action.icon}</span>
          <span className="dash-btn-label">{action.label}</span>
        </button>
      ))}
    </div>
  )
}
