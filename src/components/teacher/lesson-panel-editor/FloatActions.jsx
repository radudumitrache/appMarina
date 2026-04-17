import { IconEdit, IconTrash, IconChevronUp, IconChevronDown } from './LPEIcons'

/* ── FloatActions ───────────────────────────────────────────────────────────
 * Floating action cluster on the right edge: Edit, Move Up, Move Down, Delete.
 *
 * Props:
 *   onEdit       {Function}
 *   onMoveUp     {Function}
 *   onMoveDown   {Function}
 *   onDelete     {Function}
 *   panelIdx     {number}
 *   panelCount   {number}
 *   saving       {boolean}
 */
export default function FloatActions({ onEdit, onMoveUp, onMoveDown, onDelete, panelIdx, panelCount, saving }) {
  return (
    <div className="lpe-float-actions">
      <button className="lpe-float-btn lpe-float-btn--edit" onClick={onEdit} title="Edit panel">
        <IconEdit /><span>Edit</span>
      </button>
      <button className="lpe-float-btn lpe-float-btn--up" onClick={onMoveUp} disabled={panelIdx === 0 || saving} title="Move up">
        <IconChevronUp />
      </button>
      <button className="lpe-float-btn lpe-float-btn--down" onClick={onMoveDown} disabled={panelIdx === panelCount - 1 || saving} title="Move down">
        <IconChevronDown />
      </button>
      <button className="lpe-float-btn lpe-float-btn--delete" onClick={onDelete} title="Delete panel">
        <IconTrash />
      </button>
    </div>
  )
}
