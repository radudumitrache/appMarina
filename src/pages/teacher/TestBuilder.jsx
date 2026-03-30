import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../../components/teacher/NavBar'
import '../css/teacher/TestBuilder.css'

// ─── Mock data ────────────────────────────────────────────────────────────
const INITIAL_TESTS = [
  {
    id: 1,
    title: 'Helm Control Basics Test',
    class: 'MN-2024-A',
    status: 'published',
    timeLimit: 30,
    questions: [
      { id: 1, type: 'mcq',   text: 'What is the primary function of a helm?', options: ['Propulsion', 'Steering', 'Navigation', 'Anchoring'], correct: 1 },
      { id: 2, type: 'mcq',   text: 'Which instrument shows vessel heading?', options: ['Barometer', 'Compass', 'Anemometer', 'Chronometer'], correct: 1 },
      { id: 3, type: 'tf',    text: 'A gyrocompass is affected by magnetic fields.', correct: false },
      { id: 4, type: 'short', text: 'Describe the procedure for helmsman handover.' },
    ],
  },
  {
    id: 2,
    title: 'Chart Reading Fundamentals',
    class: 'MN-2024-A',
    status: 'published',
    timeLimit: 45,
    questions: [
      { id: 1, type: 'mcq',   text: 'What does a blue area on a nautical chart indicate?', options: ['Shallow water', 'Deep water', 'Restricted zone', 'Anchorage'], correct: 0 },
      { id: 2, type: 'mcq',   text: 'What is a "fix" in navigation?', options: ['A repair', 'A confirmed position', 'A speed calculation', 'A depth reading'], correct: 1 },
      { id: 3, type: 'short', text: 'Explain the difference between true and magnetic north.' },
    ],
  },
  {
    id: 3,
    title: 'Fire Safety Assessment',
    class: 'EP-2024-B',
    status: 'draft',
    timeLimit: 20,
    questions: [
      { id: 1, type: 'mcq',   text: 'Class B fires involve which material?', options: ['Wood', 'Flammable liquids', 'Electrical', 'Metals'], correct: 1 },
      { id: 2, type: 'tf',    text: 'Water is appropriate for extinguishing electrical fires.', correct: false },
    ],
  },
  {
    id: 4,
    title: 'Engine Room Fundamentals',
    class: 'ER-2024-C',
    status: 'draft',
    timeLimit: 40,
    questions: [],
  },
  {
    id: 5,
    title: 'GMDSS Radio Operations Quiz',
    class: 'CM-2024-E',
    status: 'published',
    timeLimit: 25,
    questions: [
      { id: 1, type: 'mcq',   text: 'What does GMDSS stand for?', options: ['Global Maritime Distress and Safety System', 'General Maritime Data and Signal System', 'Global Marine Detection and Surveillance System', 'General Maritime Distress and Safety Standard'], correct: 0 },
      { id: 2, type: 'tf',    text: 'Channel 16 VHF is the international distress frequency.', correct: true },
      { id: 3, type: 'short', text: 'What information must be included in a MAYDAY call?' },
    ],
  },
]

const Q_TYPES = [
  { id: 'mcq',   label: 'Multiple Choice' },
  { id: 'tf',    label: 'True / False'    },
  { id: 'short', label: 'Short Answer'    },
]

const STATUS_META = {
  published: { label: 'Published', cls: 'status--published' },
  draft:     { label: 'Draft',     cls: 'status--draft'     },
}

let nextQId = 100

function emptyQuestion(type) {
  const base = { id: ++nextQId, type, text: '' }
  if (type === 'mcq')   return { ...base, options: ['', '', '', ''], correct: 0 }
  if (type === 'tf')    return { ...base, correct: true }
  if (type === 'short') return base
  return base
}

export default function TestBuilder() {
  const navigate         = useNavigate()
  const [tests, setTests]         = useState(INITIAL_TESTS)
  const [selectedId, setSelected] = useState(1)
  const [search, setSearch]       = useState('')
  const [addingQ, setAddingQ]     = useState(false)
  const [newQType, setNewQType]   = useState('mcq')

  const selected = tests.find(t => t.id === selectedId)

  const visible = tests.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase().trim())
  )

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

  function addQuestion() {
    const q = emptyQuestion(newQType)
    setTests(prev => prev.map(t =>
      t.id === selectedId ? { ...t, questions: [...t.questions, q] } : t
    ))
    setAddingQ(false)
  }

  function toggleStatus(id) {
    setTests(prev => prev.map(t =>
      t.id === id ? { ...t, status: t.status === 'published' ? 'draft' : 'published' } : t
    ))
  }

  return (
    <div className="tb-page">
      <div className="tb-layout">
        <NavBar />

        <div className="tb-body">

          {/* ─── Sidebar: test list ─────────────────────────────────────── */}
          <aside className="tb-sidebar">
            <div className="tb-sidebar-top">
              <div className="tb-sidebar-search-wrap">
                <svg className="tb-sidebar-search-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className="tb-sidebar-search"
                  type="text"
                  placeholder="Search tests…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button className="tb-new-btn" onClick={() => {
                const id = Date.now()
                setTests(prev => [...prev, { id, title: 'Untitled Test', class: '', status: 'draft', timeLimit: 30, questions: [] }])
                setSelected(id)
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New
              </button>
            </div>

            <nav className="tb-test-nav">
              {visible.map(t => (
                <button
                  key={t.id}
                  className={`tb-test-item ${selectedId === t.id ? 'tb-test-item--active' : ''}`}
                  onClick={() => setSelected(t.id)}
                >
                  <div className="tb-test-item-row">
                    <span className="tb-test-item-title">{t.title}</span>
                    <span className={`tb-test-item-status ${STATUS_META[t.status].cls}`}>
                      {STATUS_META[t.status].label}
                    </span>
                  </div>
                  <div className="tb-test-item-meta">
                    <span>{t.class || 'No class'}</span>
                    <span>{t.questions.length} questions</span>
                  </div>
                </button>
              ))}
            </nav>

            <div className="tb-sidebar-footer">
              <span className="tb-sidebar-footer-num">{tests.filter(t => t.status === 'published').length}</span>
              {' '}of{' '}
              <span className="tb-sidebar-footer-num">{tests.length}</span>
              {' '}published
            </div>
          </aside>

          {/* ─── Main: test editor ──────────────────────────────────────── */}
          {selected ? (
            <main className="tb-main" key={selected.id}>

              {/* Editor header */}
              <div className="tb-editor-header">
                <div className="tb-editor-header-left">
                  <button className="tb-crumb-link" onClick={() => navigate('/teacher/dashboard')}>
                    Dashboard /
                  </button>
                  <input
                    className="tb-title-input"
                    value={selected.title}
                    onChange={e => updateTest(selected.id, { title: e.target.value })}
                    placeholder="Test title…"
                  />
                </div>
                <div className="tb-editor-header-right">
                  <span className={`tb-status-badge ${STATUS_META[selected.status].cls}`}>
                    {STATUS_META[selected.status].label}
                  </span>
                  <button
                    className="tb-toggle-btn"
                    onClick={() => toggleStatus(selected.id)}
                  >
                    {selected.status === 'draft' ? 'Publish' : 'Unpublish'}
                  </button>
                </div>
              </div>

              {/* Test meta row */}
              <div className="tb-meta-row">
                <div className="tb-meta-field">
                  <label className="tb-meta-label">Class</label>
                  <input
                    className="tb-meta-input"
                    value={selected.class}
                    onChange={e => updateTest(selected.id, { class: e.target.value })}
                    placeholder="e.g. MN-2024-A"
                  />
                </div>
                <div className="tb-meta-field">
                  <label className="tb-meta-label">Time Limit (min)</label>
                  <input
                    className="tb-meta-input tb-meta-input--mono"
                    type="number"
                    min="5"
                    max="180"
                    value={selected.timeLimit}
                    onChange={e => updateTest(selected.id, { timeLimit: Number(e.target.value) })}
                  />
                </div>
                <div className="tb-meta-stat">
                  <span className="tb-meta-stat-value">{selected.questions.length}</span>
                  <span className="tb-meta-stat-label">questions</span>
                </div>
                <div className="tb-meta-stat">
                  <span className="tb-meta-stat-value">{selected.timeLimit}</span>
                  <span className="tb-meta-stat-label">minutes</span>
                </div>
              </div>

              <div className="tb-divider" />

              {/* Question list */}
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
                  <div key={q.id} className="tb-q-card" style={{ animationDelay: `${Math.min(i, 6) * 0.04}s` }}>
                    <div className="tb-q-card-header">
                      <span className="tb-q-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="tb-q-type-tag">{Q_TYPES.find(t => t.id === q.type)?.label}</span>
                      <button className="tb-q-delete" onClick={() => deleteQuestion(selected.id, q.id)} title="Remove question">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </div>

                    <textarea
                      className="tb-q-text"
                      rows={2}
                      value={q.text}
                      onChange={e => updateQuestion(selected.id, q.id, { text: e.target.value })}
                      placeholder="Question text…"
                    />

                    {q.type === 'mcq' && (
                      <div className="tb-mcq-options">
                        {q.options.map((opt, oi) => (
                          <label key={oi} className={`tb-mcq-option ${q.correct === oi ? 'tb-mcq-option--correct' : ''}`}>
                            <input
                              type="radio"
                              name={`q-${q.id}-correct`}
                              checked={q.correct === oi}
                              onChange={() => updateQuestion(selected.id, q.id, { correct: oi })}
                            />
                            <input
                              className="tb-option-input"
                              type="text"
                              value={opt}
                              onChange={e => {
                                const opts = [...q.options]
                                opts[oi] = e.target.value
                                updateQuestion(selected.id, q.id, { options: opts })
                              }}
                              placeholder={`Option ${oi + 1}…`}
                            />
                          </label>
                        ))}
                        <span className="tb-mcq-hint">Select the correct answer</span>
                      </div>
                    )}

                    {q.type === 'tf' && (
                      <div className="tb-tf-options">
                        <label className={`tb-tf-option ${q.correct === true ? 'tb-tf-option--correct' : ''}`}>
                          <input type="radio" name={`q-${q.id}-tf`} checked={q.correct === true} onChange={() => updateQuestion(selected.id, q.id, { correct: true })} />
                          True
                        </label>
                        <label className={`tb-tf-option ${q.correct === false ? 'tb-tf-option--correct' : ''}`}>
                          <input type="radio" name={`q-${q.id}-tf`} checked={q.correct === false} onChange={() => updateQuestion(selected.id, q.id, { correct: false })} />
                          False
                        </label>
                      </div>
                    )}

                    {q.type === 'short' && (
                      <div className="tb-short-hint">Students type a free-text response.</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add question panel */}
              {addingQ ? (
                <div className="tb-add-q-panel">
                  <span className="tb-add-q-label">Question type</span>
                  <div className="tb-q-type-picker">
                    {Q_TYPES.map(t => (
                      <button
                        key={t.id}
                        className={`tb-q-type-btn ${newQType === t.id ? 'tb-q-type-btn--active' : ''}`}
                        onClick={() => setNewQType(t.id)}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className="tb-add-q-actions">
                    <button className="tb-add-q-cancel" onClick={() => setAddingQ(false)}>Cancel</button>
                    <button className="tb-add-q-confirm" onClick={addQuestion}>Add Question</button>
                  </div>
                </div>
              ) : (
                <button className="tb-add-q-trigger" onClick={() => setAddingQ(true)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add Question
                </button>
              )}

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
