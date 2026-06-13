import { totalDuration } from './courseBuilderUtils'
import '../../css/teacher/course-builder/SummaryBar.css'

export default function SummaryBar({ selectedLessons }) {
  return (
    <div className="cb-summary-bar">
      <div className="cb-summary-stat">
        <span className="cb-summary-value">{selectedLessons.length}</span>
        <span className="cb-summary-label">modules</span>
      </div>
      <div className="cb-summary-divider" />
      <div className="cb-summary-stat">
        <span className="cb-summary-value">{selectedLessons.length > 0 ? totalDuration(selectedLessons) : '—'}</span>
        <span className="cb-summary-label">total duration</span>
      </div>
    </div>
  )
}
