import { useState, useRef, useEffect } from 'react'
import '../css/shared/MultiSelectDropdown.css'

function ChevronIcon({ open }) {
  return (
    <svg
      className={`dropdown-chevron${open ? ' dropdown-chevron--open' : ''}`}
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function CheckboxIcon({ checked }) {
  return (
    <span className={`multiselect-checkbox${checked ? ' multiselect-checkbox--checked' : ''}`}>
      {checked && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
    </span>
  )
}

/**
 * options: Array<{ value: any, label: string }>
 * value: array of currently selected option values
 * onChange: (values: any[]) => void
 * placeholder: string shown when nothing is selected
 */
export default function MultiSelectDropdown({ value = [], onChange, options = [], placeholder = '— Select —', disabled = false }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const selectedOptions = options.filter(o => value.includes(o.value))

  function toggle(optValue) {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  let label = placeholder
  if (selectedOptions.length === 1) {
    label = selectedOptions[0].label
  } else if (selectedOptions.length === 2) {
    label = selectedOptions.map(o => o.label).join(', ')
  } else if (selectedOptions.length > 2) {
    label = `${selectedOptions.length} departments selected`
  }

  return (
    <div className={`dropdown multiselect-dropdown${open ? ' dropdown--open' : ''}${disabled ? ' dropdown--disabled' : ''}`} ref={ref}>
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => !disabled && setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`dropdown-trigger-label${selectedOptions.length ? '' : ' dropdown-trigger-label--placeholder'}`}>
          {label}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="dropdown-list" role="listbox">
          {options.length === 0 && (
            <div className="multiselect-empty">No departments available.</div>
          )}
          {options.map((opt) => {
            const isChecked = value.includes(opt.value)
            return (
              <div
                key={opt.value}
                className={`dropdown-option${isChecked ? ' dropdown-option--active' : ''}`}
                role="option"
                aria-selected={isChecked}
                onMouseDown={(e) => {
                  e.preventDefault()
                  toggle(opt.value)
                }}
              >
                <CheckboxIcon checked={isChecked} />
                <span className="dropdown-option-label">{opt.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
