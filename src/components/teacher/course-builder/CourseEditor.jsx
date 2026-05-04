import { useNavigate } from 'react-router-dom'
import EditorHeader from './EditorHeader'
import SummaryBar   from './SummaryBar'
import LessonList   from './LessonList'
import LessonBank   from './LessonBank'

export default function CourseEditor({
  selected, selectedLessons, loadingDetail, saving,
  bankOpen, setBankOpen,
  bankFiltered, bankSearch, setBankSearch, lessonBankCount,
  onTitleChange, onDescChange, onToggleStatus,
  onRemoveLesson, onMoveLesson, onAddLesson,
}) {
  const navigate = useNavigate()

  return (
    <main className="cb-main" key={selected.id}>

      <EditorHeader
        selected={selected}
        onTitleChange={onTitleChange}
        onDescChange={onDescChange}
        onToggleStatus={onToggleStatus}
        onNavigateDashboard={() => navigate('/teacher/dashboard')}
      />

      {selectedLessons && <SummaryBar selectedLessons={selectedLessons} />}

      <div className="cb-divider" />

      <div className="cb-section-head">
        <span className="cb-section-title">Course Lessons</span>
        <span className="cb-section-hint">Use arrows to reorder</span>
      </div>

      <LessonList
        selectedLessons={selectedLessons}
        loadingDetail={loadingDetail}
        onRemove={onRemoveLesson}
        onMove={onMoveLesson}
        onNavigatePanels={id => navigate(`/teacher/lessons/${id}/panels`)}
      />

      <LessonBank
        bankOpen={bankOpen}
        setBankOpen={setBankOpen}
        lessonBankCount={lessonBankCount}
        bankFiltered={bankFiltered}
        bankSearch={bankSearch}
        setBankSearch={setBankSearch}
        selectedLessons={selectedLessons}
        saving={saving}
        onAdd={onAddLesson}
      />

    </main>
  )
}
