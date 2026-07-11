import ReviewItem from './ReviewItem'

export default function PanelSection({ panel }) {
  return (
    <section className="tr-panel">
      <div className="tr-panel-header">
        <span className="tr-panel-title">{panel.title}</span>
        <span className="tr-panel-count">
          {panel.items.length} exercise{panel.items.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="tr-item-list">
        {panel.items.map((item, idx) => (
          <ReviewItem key={idx} item={item} index={idx} />
        ))}
      </div>
    </section>
  )
}
