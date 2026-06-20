/* ── PanelStrip ─────────────────────────────────────────────────────────────
 * Horizontal scrollable strip at the bottom listing all panels for quick navigation.
 *
 * Props:
 *   panels   {Array}
 *   panelIdx {number}
 *   onSelect {Function}  called with the index of the clicked panel
 */
export default function PanelStrip({ panels, panelIdx, onSelect }) {
  return (
    <div className="lpe-strip">
      {panels.map((p, i) => (
        <button
          key={p.id}
          className={`lpe-strip-btn ${i === panelIdx ? 'lpe-strip-btn--active' : ''}`}
          onClick={() => onSelect(i)}
        >
          <span className="lpe-strip-type">{p.type === 'vr_tour' ? '360°' : 'TXT'}</span>
          <span className="lpe-strip-name">{p.title}</span>
        </button>
      ))}
    </div>
  )
}
