import QuestionCard from './QuestionCard'

export default function PanelSection({ panel, index, onToggle, saving }) {
  return (
    <div className="so-panel">
      <div className="so-panel-head">
        <span className="so-panel-title">{panel.title || `Panel ${index + 1}`}</span>
        <span className="so-panel-count">{panel.items.length}</span>
      </div>
      {panel.items.map((item, qi) => (
        <QuestionCard
          key={item.answer?.id ?? `${index}-${qi}`}
          item={item}
          onToggle={onToggle}
          saving={saving}
          delay={Math.min(qi, 6) * 0.03}
        />
      ))}
    </div>
  )
}
