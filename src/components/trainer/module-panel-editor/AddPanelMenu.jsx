import { IconPlus, IconText, IconVR } from './LPEIcons'

/* ── AddPanelMenu ───────────────────────────────────────────────────────────
 * Bottom-left "Add Panel" trigger + pop-up menu with Text Panel / VR Tour options.
 *
 * Props:
 *   addMenuOpen {boolean}
 *   onToggle    {Function}
 *   onAdd       {Function}  called with 'text' | 'vr_tour'
 *   saving      {boolean}
 */
export default function AddPanelMenu({ addMenuOpen, onToggle, onAdd, saving }) {
  return (
    <div className="lpe-add-wrap" onClick={e => e.stopPropagation()}>
      {addMenuOpen && (
        <div className="lpe-add-menu">
          <button className="lpe-add-menu-item" onClick={() => onAdd('text')} disabled={saving}>
            <IconText /> Text Panel
          </button>
          <button className="lpe-add-menu-item lpe-add-menu-item--vr" onClick={() => onAdd('vr_tour')} disabled={saving}>
            <IconVR /> VR Tour
          </button>
        </div>
      )}
      <button
        className={`lpe-add-trigger ${addMenuOpen ? 'lpe-add-trigger--open' : ''}`}
        onClick={onToggle}
        disabled={saving}
        title="Add panel"
      >
        <IconPlus /><span>Add Panel</span>
      </button>
    </div>
  )
}
