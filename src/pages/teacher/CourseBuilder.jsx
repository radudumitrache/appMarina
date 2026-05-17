import { useState, useRef, useEffect } from 'react'
import Dropdown        from '../../components/shared/Dropdown'
import NavBar          from '../../components/teacher/NavBar'
import CourseSidebar   from '../../components/teacher/course-builder/CourseSidebar'
import CourseEditor    from '../../components/teacher/course-builder/CourseEditor'
import LessonsManager  from '../../components/teacher/course-builder/LessonsManager'
import { useCourseBuilder } from './useCourseBuilder'
import { getClasses } from '../../api/classes'
import '../css/teacher/CourseBuilder.css'

export default function CourseBuilder() {
  const [showCreate,  setShowCreate]  = useState(false)
  const [newTitle,    setNewTitle]    = useState('')
  const [newDesc,     setNewDesc]     = useState('')
  const [newStatus,   setNewStatus]   = useState('draft')
  const [newClassId,  setNewClassId]  = useState('')
  const [creating,    setCreating]    = useState(false)
  const [createErr,   setCreateErr]   = useState(null)
  const [classes,     setClasses]     = useState([])
  const titleRef = useRef(null)

  useEffect(() => {
    getClasses().then(r => setClasses(r.data)).catch(() => {})
  }, [])

  const {
    courses, loading, error,
    selectedId, setSelected,
    search, setSearch,
    bankSearch, setBankSearch,
    bankOpen, setBankOpen,
    saving, loadingDetail,
    selected, selectedLessons,
    visible, bankFiltered, lessonBank, courseLessonsMap, lessonCourseMap,
    departments,
    activeTab, setActiveTab,
    handleNewCourse,
    handleTitleChange, handleDescChange, handleClassroomChange, handleToggleStatus, handleDeleteCourse,
    handleAddLesson, handleRemoveLesson, handleMoveLesson,
    // handleCreateLesson,
    handleUpdateLesson, handleDeleteLesson,
    ensureAllCoursesLoaded,
  } = useCourseBuilder()

  function switchToCourse(id) {
    setSelected(id)
    setActiveTab('courses')
  }

  function switchToAllLessons() {
    setActiveTab('lessons')
    ensureAllCoursesLoaded()
  }

  function openCreate() {
    setNewTitle('')
    setNewDesc('')
    setNewStatus('draft')
    setNewClassId(classes[0]?.id ?? null)
    setCreateErr(null)
    setShowCreate(true)
    setTimeout(() => titleRef.current?.focus(), 40)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!newTitle.trim()) { setCreateErr('Title is required.'); return }
    if (!newClassId) { setCreateErr('Please select a class.'); return }
    setCreating(true)
    setCreateErr(null)
    try {
      await handleNewCourse({ title: newTitle, description: newDesc, status: newStatus, classroom_id: newClassId })
      setShowCreate(false)
    } catch {
      setCreateErr('Could not create course. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <div className="cb-page">
        <div className="cb-layout">
          <NavBar />
          <div className="cb-body">
            <CourseSidebar
              loading={loading}
              error={error}
              visible={visible}
              selectedId={activeTab === 'courses' ? selectedId : null}
              courseLessonsMap={courseLessonsMap}
              search={search}
              setSearch={setSearch}
              onSelect={switchToCourse}
              onNew={openCreate}
              totalCount={courses.length}
              publishedCount={courses.filter(c => c.status === 'published').length}
              lessonBankCount={lessonBank.length}
              onShowAllLessons={switchToAllLessons}
              showingAllLessons={activeTab === 'lessons'}
              classes={classes}
            />

            {activeTab === 'courses' ? (
              selected ? (
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
                  classes={classes}
                  departments={departments}
                  onTitleChange={handleTitleChange}
                  onDescChange={handleDescChange}
                  onClassroomChange={handleClassroomChange}
                  onToggleStatus={handleToggleStatus}
                  onDeleteCourse={handleDeleteCourse}
                  onRemoveLesson={handleRemoveLesson}
                  onMoveLesson={handleMoveLesson}
                  onAddLesson={handleAddLesson}
                  // onCreateLesson={handleCreateLesson}
                />
              ) : !loading ? (
                <main className="cb-main cb-main--empty">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)', marginBottom: 12 }}>
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  <span>Select a course or create a new one</span>
                </main>
              ) : null
            ) : (
              <LessonsManager
                lessonBank={lessonBank}
                lessonCourseMap={lessonCourseMap}
                departments={departments}
                saving={saving}
                // onCreateLesson={handleCreateLesson}
                onUpdateLesson={handleUpdateLesson}
                onDeleteLesson={handleDeleteLesson}
              />
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="cb-create-overlay" onClick={() => setShowCreate(false)}>
          <div className="cb-create-modal" onClick={e => e.stopPropagation()}>
            <div className="cb-create-header">
              <span className="cb-create-title">New Course</span>
              <button className="cb-create-close" onClick={() => setShowCreate(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form className="cb-create-form" onSubmit={handleCreate}>
              <div className="cb-create-field">
                <label className="cb-create-label">Class <span className="cb-create-required">*</span></label>
                <Dropdown
                  value={newClassId}
                  onChange={v => setNewClassId(v)}
                  placeholder="— select a class —"
                  options={classes.map(c => ({ value: c.id, label: `${c.name} (${c.code})` }))}
                />
              </div>
              <div className="cb-create-field">
                <label className="cb-create-label">Title</label>
                <input
                  ref={titleRef}
                  className="cb-create-input"
                  type="text"
                  placeholder="e.g. Maritime Safety Fundamentals"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                />
              </div>
              <div className="cb-create-field">
                <label className="cb-create-label">
                  Description <span className="cb-create-optional">(optional)</span>
                </label>
                <input
                  className="cb-create-input"
                  type="text"
                  placeholder="Short description…"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>

              <div className="cb-create-field">
                <label className="cb-create-label">Status</label>
                <div className="cb-create-status-row">
                  <button
                    type="button"
                    className={`cb-create-status-btn ${newStatus === 'draft' ? 'cb-create-status-btn--active' : ''}`}
                    onClick={() => setNewStatus('draft')}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    className={`cb-create-status-btn cb-create-status-btn--pub ${newStatus === 'published' ? 'cb-create-status-btn--active cb-create-status-btn--pub-active' : ''}`}
                    onClick={() => setNewStatus('published')}
                  >
                    Published
                  </button>
                </div>
              </div>

              {createErr && <p className="cb-create-error">{createErr}</p>}

              <div className="cb-create-footer">
                <button type="button" className="cb-create-cancel" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="cb-create-submit" disabled={creating}>
                  {creating ? 'Creating…' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
