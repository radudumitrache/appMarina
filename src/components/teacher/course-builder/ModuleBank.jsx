import { useState } from 'react'
import { formatDuration } from './courseBuilderUtils'
import ModuleEditModal from './ModuleEditModal'
import '../../css/teacher/course-builder/ModuleBank.css'

export default function ModuleBank({
  setBankOpen,
  moduleBankCount,
  bankFiltered,
  bankSearch,
  setBankSearch,
  selectedModules,
  saving,
  onAdd,
  onCreateModule,
  onAddTest,
  allTests = [],
}) {
  const [creatingModule, setCreatingModule] = useState(false)
  const [bankTab, setBankTab] = useState('lessons')

  const added = (id) => selectedModules?.some(l => l.id === id) ?? false
  const testAdded = (id) => selectedModules?.some(l => l._type === 'test' && l.testId === id) ?? false

  const testsFiltered = allTests.filter(t =>
    t.title.toLowerCase().includes(bankSearch.toLowerCase().trim())
  )

  async function handleCreate(data) {
    const module = await onCreateModule(data)
    setCreatingLesson(false)
    // auto-add the newly created module to the course
    if (module?.id) onAdd(module.id)
  }

  if (creatingModule) {
    return (
      <ModuleEditModal
        module={null}
        onSave={handleCreate}
        onClose={() => setCreatingModule(false)}
      />
    )
  }

  return (
    <>
      <div className="cb-bank-overlay" onClick={() => setBankOpen(false)}>
        <div className="cb-bank-modal" onClick={e => e.stopPropagation()}>

          <div className="cb-bank-modal-header">
            <div className="cb-bank-modal-title-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span className="cb-bank-modal-title">Add Modules</span>
              <span className="cb-bank-modal-count">
                {bankTab === 'lessons' ? moduleBankCount : allTests.length} available
              </span>
            </div>
            <div className="cb-bank-modal-header-actions">
              {/* New Module button disabled for teachers â€” admins only
              <button className="cb-bank-new-btn" onClick={() => setCreatingModule(true)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Lesson
              </button>
              */}
              <button className="cb-bank-modal-close" onClick={() => setBankOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="cb-bank-tabs">
            <button
              className={`cb-bank-tab ${bankTab === 'lessons' ? 'cb-bank-tab--active' : ''}`}
              onClick={() => setBankTab('lessons')}
            >
              Modules
            </button>
            <button
              className={`cb-bank-tab ${bankTab === 'tests' ? 'cb-bank-tab--active' : ''}`}
              onClick={() => setBankTab('tests')}
            >
              Tests
            </button>
          </div>

          <div className="cb-bank-modal-search-wrap">
            <svg className="cb-bank-modal-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="cb-bank-modal-search"
              type="text"
              placeholder={bankTab === 'lessons' ? 'Filter modulesâ€¦' : 'Filter testsâ€¦'}
              value={bankSearch}
              onChange={e => setBankSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="cb-bank-modal-list">
            {bankTab === 'lessons' ? (
              bankFiltered.length === 0 ? (
                <div className="cb-bank-modal-empty">
                  <p>No modules match your search.</p>
                  <button className="cb-bank-empty-create" onClick={() => setCreatingModule(true)}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Create a new module
                  </button>
                </div>
              ) : (
                bankFiltered.map(module => {
                  const isAdded = added(module.id)
                  return (
                    <div key={module.id} className={`cb-bank-item ${isAdded ? 'cb-bank-item--added' : ''}`}>
                      <div className="cb-bank-item-info">
                        <span className="cb-bank-item-title">{module.title}</span>
                        <div className="cb-bank-item-meta">
                          <span className="cb-bank-item-dur">{formatDuration(module.duration_minutes)}</span>
                        </div>
                      </div>
                      <button
                        className={`cb-bank-item-btn ${isAdded ? 'cb-bank-item-btn--added' : ''}`}
                        onClick={() => !isAdded && !saving && onAdd(module.id)}
                        disabled={isAdded || saving}
                      >
                        {isAdded ? (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Added
                          </>
                        ) : (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  )
                })
              )
            ) : (
              testsFiltered.length === 0 ? (
                <div className="cb-bank-modal-empty">
                  <p>No tests match your search.</p>
                </div>
              ) : (
                testsFiltered.map(test => {
                  const isAdded = testAdded(test.id)
                  return (
                    <div key={test.id} className={`cb-bank-item ${isAdded ? 'cb-bank-item--added' : ''}`}>
                      <div className="cb-bank-item-info">
                        <span className="cb-bank-item-title">{test.title}</span>
                        <div className="cb-bank-item-meta">
                          {test.time_limit_minutes && (
                            <span className="cb-bank-item-dur">{test.time_limit_minutes} min</span>
                          )}
                        </div>
                      </div>
                      <button
                        className={`cb-bank-item-btn ${isAdded ? 'cb-bank-item-btn--added' : ''}`}
                        onClick={() => !isAdded && !saving && onAddTest?.(test.id)}
                        disabled={isAdded || saving}
                      >
                        {isAdded ? (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Added
                          </>
                        ) : (
                          <>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  )
                })
              )
            )}
          </div>

          <div className="cb-bank-modal-footer">
            <button className="cb-bank-modal-done" onClick={() => setBankOpen(false)}>Done</button>
          </div>

        </div>
      </div>
    </>
  )
}
