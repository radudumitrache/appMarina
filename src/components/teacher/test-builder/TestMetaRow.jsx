import { useState, useEffect } from 'react'
import '../../css/teacher/test-builder/TestMetaRow.css'
import MultiSelectDropdown from '../../shared/MultiSelectDropdown'
import { useAuth } from '../../../auth/AuthContext'

export default function TestMetaRow({ selected, panelCount, classes = [], organisations = [], onUpdate, allowPublic = false }) {
  const { user } = useAuth()
  const isSuperAdmin = user?.is_staff
  const [timeLimit, setTimeLimit] = useState(selected.time_limit_minutes ?? 30)
  const [minGrade, setMinGrade] = useState(selected.minimum_passing_grade ?? '')

  useEffect(() => {
    setTimeLimit(selected.time_limit_minutes ?? 30)
  }, [selected.time_limit_minutes])

  useEffect(() => {
    setMinGrade(selected.minimum_passing_grade ?? '')
  }, [selected.minimum_passing_grade])

  function handleTimeLimitBlur() {
    const val = Number(timeLimit)
    if (val !== selected.time_limit_minutes && val >= 1) {
      onUpdate({ time_limit_minutes: val })
    }
  }

  function handleMinGradeBlur() {
    const raw = String(minGrade).trim()
    const current = selected.minimum_passing_grade ?? null
    if (raw === '') {
      if (current !== null) onUpdate({ minimum_passing_grade: null })
    } else {
      const val = Math.min(100, Math.max(0, Number(raw)))
      if (val !== current) onUpdate({ minimum_passing_grade: val })
    }
  }

  const selectedDeptIds = (selected.departments ?? []).map(d => d.id)
  const noClassSelected = !selectedDeptIds.length

  return (
    <div className="tb-meta-row">
      <div className="tb-meta-field tb-meta-field--wide">
        <label className="tb-meta-label">
          Departments
          {!allowPublic && noClassSelected && (
            <span className="tb-meta-required">Required</span>
          )}
        </label>
        <MultiSelectDropdown
          value={selectedDeptIds}
          onChange={ids => onUpdate({ department_ids: ids })}
          placeholder={allowPublic ? '-- Public --' : '-- Select departments --'}
          options={classes.map(c => ({ value: c.id, label: c.name }))}
        />
      </div>
      <div className="tb-meta-field">
        <label className="tb-meta-label">Time Limit (min)</label>
        <input
          className="tb-meta-input tb-meta-input--mono"
          type="number"
          min="1"
          max="300"
          value={timeLimit}
          onChange={e => setTimeLimit(e.target.value)}
          onBlur={handleTimeLimitBlur}
        />
      </div>
      <div className="tb-meta-field">
        <label className="tb-meta-label">Min. Passing Grade (%)</label>
        <input
          className="tb-meta-input tb-meta-input--mono"
          type="number"
          min="0"
          max="100"
          placeholder="None"
          value={minGrade}
          onChange={e => setMinGrade(e.target.value)}
          onBlur={handleMinGradeBlur}
        />
      </div>
      {isSuperAdmin && organisations.length > 0 && (
        <div className="tb-meta-field">
          <label className="tb-meta-label">Organisation</label>
          <select
            className="tb-meta-input tb-meta-select"
            value={selected.organisation ?? ''}
            onChange={e => onUpdate({ organisation: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">-- None --</option>
            {organisations.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="tb-meta-stat">
        <span className="tb-meta-stat-value">{panelCount}</span>
        <span className="tb-meta-stat-label">panels</span>
      </div>
    </div>
  )
}
