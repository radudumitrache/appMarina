import { useState } from 'react'
import NavBar            from '../../components/teacher/NavBar'
import TestSidebar       from '../../components/teacher/test-builder/TestSidebar'
import TestEditorHeader  from '../../components/teacher/test-builder/TestEditorHeader'
import TestMetaRow       from '../../components/teacher/test-builder/TestMetaRow'
import QuestionCard      from '../../components/teacher/test-builder/QuestionCard'
import AddQuestionPanel  from '../../components/teacher/test-builder/AddQuestionPanel'
import { INITIAL_TESTS, emptyQuestion } from './testBuilderMock'
import '../css/teacher/TestBuilder.css'

export default function TestBuilder() {
  const [tests,      setTests]     = useState(INITIAL_TESTS)
  const [selectedId, setSelected]  = useState(1)

  const selected = tests.find(t => t.id === selectedId)

  function updateTest(id, patch) {
    setTests(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
  }

  function updateQuestion(testId, qId, patch) {
    setTests(prev => prev.map(t => {
      if (t.id !== testId) return t
      return { ...t, questions: t.questions.map(q => q.id === qId ? { ...q, ...patch } : q) }
    }))
  }

  function deleteQuestion(testId, qId) {
    setTests(prev => prev.map(t => {
      if (t.id !== testId) return t
      return { ...t, questions: t.questions.filter(q => q.id !== qId) }
    }))
  }

  function addQuestion(type) {
    const q = emptyQuestion(type)
    setTests(prev => prev.map(t =>
      t.id === selectedId ? { ...t, questions: [...t.questions, q] } : t
    ))
  }

  function toggleStatus(id) {
    setTests(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'published' ? 'draft' : 'published' } : t
    ))
  }

  function handleNew() {
    const id = Date.now()
    setTests(prev => [...prev, { id, title: 'Untitled Test', class: '', status: 'draft', timeLimit: 30, questions: [] }])
    setSelected(id)
  }

  return (
    <div className="tb-page">
      <div className="tb-layout">
        <NavBar />

        <div className="tb-body">
          <TestSidebar
            tests={tests}
            selectedId={selectedId}
            onSelect={setSelected}
            onNew={handleNew}
          />

          {selected ? (
            <main className="tb-main" key={selected.id}>
              <TestEditorHeader
                selected={selected}
                onTitleChange={title => updateTest(selected.id, { title })}
                onToggleStatus={() => toggleStatus(selected.id)}
              />

              <TestMetaRow
                selected={selected}
                onUpdate={patch => updateTest(selected.id, patch)}
              />

              <div className="tb-divider" />

              <div className="tb-q-list">
                {selected.questions.length === 0 && (
                  <div className="tb-q-empty">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-3)' }}>
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span>No questions yet. Add one below.</span>
                  </div>
                )}
                {selected.questions.map((q, i) => (
                  <QuestionCard
                    key={q.id}
                    q={q}
                    index={i}
                    onUpdate={patch => updateQuestion(selected.id, q.id, patch)}
                    onDelete={() => deleteQuestion(selected.id, q.id)}
                  />
                ))}
              </div>

              <AddQuestionPanel onAdd={addQuestion} />
            </main>
          ) : (
            <main className="tb-main tb-main--empty">
              <span>Select a test to edit</span>
            </main>
          )}
        </div>
      </div>
    </div>
  )
}
