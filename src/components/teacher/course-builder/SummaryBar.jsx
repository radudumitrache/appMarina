import { totalDuration } from './courseBuilderUtils'
import '../../css/teacher/course-builder/SummaryBar.css'

export default function SummaryBar({ selectedLessons }) {
  const uniqueCategories = [...new Set(selectedLessons.map(l => l.category).filter(Boolean))].length

  return (
    <div className="cb-summary-bar">
      <div className="cb-summary-stat">
        <span className="cb-summary-value">{selectedLessons.length}</span>
        <span className="cb-summary-label">lessons</span>
      </div>
      <div className="cb-summary-divider" />
      <div className="cb-summary-stat">
        <span className="cb-summary-value">{selectedLessons.length > 0 ? totalDuration(selectedLessons) : '—'}</span>
        <span className="cb-summary-label">total duration</span>
      </div>
      <div className="cb-summary-divider" />
      <div className="cb-summary-stat">
        <span className="cb-summary-value">{uniqueCategories}</span>
        <span className="cb-summary-label">categories</span>
      </div>
    </div>
  )
}
