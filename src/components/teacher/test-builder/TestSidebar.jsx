import { useState } from 'react'
import { STATUS_META } from '../../../pages/teacher/testBuilderMock'
import '../../css/teacher/test-builder/TestSidebar.css'

export default function TestSidebar({ tests, selectedId, onSelect, onNew }) {
  const [search, setSearch] = useState('')

  const visible = tests.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase().trim())
  )

  return (
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
        <button className="tb-new-btn" onClick={onNew}>
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
            onClick={() => onSelect(t.id)}
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
  )
}
