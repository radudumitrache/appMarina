import { useState, useEffect } from 'react'
import '../../css/trainer/test-builder/TestMetaRow.css'
import MultiSelectDropdown from '../../shared/MultiSelectDropdown'
import { useAuth } from '../../../auth/AuthContext'

export default function TestMetaRow({ selected, panelCount, classes = [], allCourses = [], onCourseUpdate, organisations = [], onUpdate, allowPublic = false }) {
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

  const GRADE_PRESETS = [null, 50, 60, 70, 80]
  const currentGrade  = selected.minimum_passing_grade ?? null
  const isCustom      = currentGrade !== null && !GRADE_PRESETS.includes(currentGrade)

  function selectPreset(val) {
    if (val === currentGrade) return
    onUpdate({ minimum_passing_grade: val })
    setMinGrade(val ?? '')
  }

  const selectedDeptIds = (selected.departments ?? []).map(d => d.id)
  const noClassSelected = !selectedDeptIds.length

  // Courses available for the selected departments
  const showCourses = onCourseUpdate && allCourses.length > 0
  const availableCourses = showCourses
    ? allCourses.filter(c => (c.departments ?? []).some(d => selectedDeptIds.includes(d.id)))
    : []
  const selectedCourseIds = (selected.courses ?? []).map(c => c.course_id)

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
          placeholder={allowPublic ? '-- No option selected --' : '-- Select departments --'}
          options={classes.map(c => ({ value: c.id, label: c.name }))}
        />
      </div>

      {showCourses && selectedDeptIds.length > 0 && (
        <div className="tb-meta-field tb-meta-field--wide">
          <label className="tb-meta-label">
            Link to Courses
            <span className="tb-meta-hint">{availableCourses.length} available</span>
          </label>
          <MultiSelectDropdown
            value={selectedCourseIds}
            onChange={onCourseUpdate}
            placeholder="-- Select courses --"
            options={availableCourses.map(c => ({ value: c.id, label: c.title }))}
            disabled={availableCourses.length === 0}
            emptyText={availableCourses.length === 0 ? 'No courses in selected departments' : undefined}
          />
        </div>
      )}
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
        <label className="tb-meta-label">Min. Passing Grade</label>
        <div className="tb-grade-picker">
          {GRADE_PRESETS.map(p => (
            <button
              key={p ?? 'none'}
              type="button"
              className={`tb-grade-opt ${currentGrade === p && !isCustom ? 'tb-grade-opt--active' : ''}`}
              onClick={() => selectPreset(p)}
            >
              {p === null ? 'None' : `${p}%`}
            </button>
          ))}
          <div className={`tb-grade-custom ${isCustom ? 'tb-grade-custom--active' : ''}`}>
            <input
              className="tb-grade-custom-input"
              type="number"
              min="0"
              max="100"
              placeholder="…"
              value={isCustom ? minGrade : ''}
              onChange={e => { setMinGrade(e.target.value); if (currentGrade !== null && !GRADE_PRESETS.includes(currentGrade)) {} }}
              onFocus={() => { if (!isCustom) { setMinGrade(''); onUpdate({ minimum_passing_grade: null }) } }}
              onBlur={handleMinGradeBlur}
            />
            <span className="tb-grade-custom-suffix">%</span>
          </div>
        </div>
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
