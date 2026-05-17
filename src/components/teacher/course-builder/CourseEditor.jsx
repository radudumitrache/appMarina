import { useNavigate } from 'react-router-dom'
import EditorHeader from './EditorHeader'
import LessonList   from './LessonList'
import LessonBank   from './LessonBank'

export default function CourseEditor({
  selected, selectedLessons, loadingDetail, saving,
  bankOpen, setBankOpen,
  bankFiltered, bankSearch, setBankSearch, lessonBankCount,
  classes = [],
  departments = [],
  onTitleChange, onDescChange, onClassroomChange, onToggleStatus, onDeleteCourse,
  onRemoveLesson, onMoveLesson, onAddLesson, onCreateLesson,
  panelsBasePath = '/teacher/lessons',
  builderPath    = '/teacher/builder',
}) {
  const navigate = useNavigate()

  return (
    <main className="cb-main" key={selected.id}>

      <EditorHeader
        selected={selected}
        classes={classes}
        onTitleChange={onTitleChange}
        onDescChange={onDescChange}
        onClassroomChange={onClassroomChange}
        onToggleStatus={onToggleStatus}
        onDeleteCourse={onDeleteCourse}
      />

      {!selected.classroom_id && (
        <div className="cb-warn-banner">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Assign this course to a class to enable image and video uploads in lessons.
        </div>
      )}

      <div className="cb-divider" />

      <div className="cb-section-head">
        <span className="cb-section-title">Lessons</span>
        {selectedLessons && selectedLessons.length > 0 && (
          <span className="cb-section-hint">{selectedLessons.length} lesson{selectedLessons.length !== 1 ? 's' : ''} · use arrows to reorder</span>
        )}
        <button className="cb-add-lesson-btn" onClick={() => setBankOpen(true)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Lesson
        </button>
      </div>

      <LessonList
        selectedLessons={selectedLessons}
        departments={departments}
        loadingDetail={loadingDetail}
        onRemove={onRemoveLesson}
        onMove={onMoveLesson}
        onNavigatePanels={id => navigate(`${panelsBasePath}/${id}/panels`, { state: { backPath: builderPath, classroomId: selected.classroom_id ?? null } })}
        onViewLesson={lesson => navigate(`${panelsBasePath}/${lesson.id}`, { state: { lesson } })}
      />

      {bankOpen && (
        <LessonBank
          bankOpen={bankOpen}
          setBankOpen={setBankOpen}
          lessonBankCount={lessonBankCount}
          bankFiltered={bankFiltered}
          bankSearch={bankSearch}
          setBankSearch={setBankSearch}
          selectedLessons={selectedLessons}
          departments={departments}
          saving={saving}
          onAdd={onAddLesson}
          onCreateLesson={onCreateLesson}
        />
      )}

    </main>
  )
}
