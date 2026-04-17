import { IconEdit, IconTrash } from './LPEIcons'

/* ── AnchorContextMenu ──────────────────────────────────────────────────────
 * Small floating popup that appears when an anchor is clicked in edit mode.
 * Offers quick Edit (opens the drawer) and Delete actions.
 *
 * Props:
 *   anchor      {object}          the anchor object
 *   anchorType  {'text'|'nav'}
 *   x           {number}          clientX of the click
 *   y           {number}          clientY of the click
 *   onEdit      {Function}
 *   onDelete    {Function}
 *   onClose     {Function}
 */
export default function AnchorContextMenu({ anchor, anchorType, x, y, onEdit, onDelete, onClose }) {
  const label     = anchorType === 'nav'
    ? `→ Tour #${anchor.target_vr_tour}`
    : (anchor.title || 'Untitled')
  const typeLabel = anchorType === 'nav' ? 'Navigator' : 'Text Anchor'

  // Clamp so the card never bleeds off the right / bottom edge
  const style = {
    left: Math.min(x, window.innerWidth  - 220),
    top:  Math.min(y, window.innerHeight - 120),
  }

  return (
    <>
      <div className="lpe-ctx-backdrop" onClick={onClose} />
      <div className="lpe-ctx-menu" style={style} onClick={e => e.stopPropagation()}>
        <div className="lpe-ctx-header">
          <span className="lpe-ctx-type">{typeLabel}</span>
          <span className="lpe-ctx-label">{label}</span>
        </div>
        <div className="lpe-ctx-actions">
          <button className="lpe-ctx-btn lpe-ctx-btn--edit" onClick={onEdit}>
            <IconEdit /> Edit
          </button>
          <button className="lpe-ctx-btn lpe-ctx-btn--delete" onClick={onDelete}>
            <IconTrash /> Delete
          </button>
        </div>
      </div>
    </>
  )
}
