import NavBar from '../../components/teacher/NavBar'
import CourseSidebar from '../../components/teacher/course-builder/CourseSidebar'
import CourseEditor  from '../../components/teacher/course-builder/CourseEditor'
import { useCourseBuilder } from './useCourseBuilder'
import '../css/teacher/CourseBuilder.css'

export default function CourseBuilder() {
  const {
    courses, loading, error,
    selectedId, setSelected,
    search, setSearch,
    bankSearch, setBankSearch,
    bankOpen, setBankOpen,
    saving, loadingDetail,
    selected, selectedLessons,
    visible, bankFiltered, lessonBank, courseLessonsMap,
    handleNewCourse,
    handleTitleChange, handleDescChange, handleToggleStatus,
    handleAddLesson, handleRemoveLesson, handleMoveLesson,
  } = useCourseBuilder()

  return (
    <div className="cb-page">
      <div className="cb-layout">
        <NavBar />

        <div className="cb-body">

          <CourseSidebar
            loading={loading}
            error={error}
            visible={visible}
            selectedId={selectedId}
            courseLessonsMap={courseLessonsMap}
            search={search}
            setSearch={setSearch}
            onSelect={setSelected}
            onNew={handleNewCourse}
            totalCount={courses.length}
            publishedCount={courses.filter(c => c.status === 'published').length}
          />

          {selected ? (
            <CourseEditor
              selected={selected}
              selectedLessons={selectedLessons}
              loadingDetail={loadingDetail}
              saving={saving}
              bankOpen={bankOpen}
              setBankOpen={setBankOpen}
              bankFiltered={bankFiltered}
              bankSearch={bankSearch}
              setBankSearch={setBankSearch}
              lessonBankCount={lessonBank.length}
              onTitleChange={handleTitleChange}
              onDescChange={handleDescChange}
              onToggleStatus={handleToggleStatus}
              onRemoveLesson={handleRemoveLesson}
              onMoveLesson={handleMoveLesson}
              onAddLesson={handleAddLesson}
            />
          ) : !loading ? (
            <main className="cb-main cb-main--empty">
              <span>Select a course to edit</span>
            </main>
          ) : null}

        </div>
      </div>
    </div>
  )
}
