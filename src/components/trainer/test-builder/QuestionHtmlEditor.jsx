import RichTextEditor from '../../shared/RichTextEditor'

/* ── Props ───────────────────────────────────────────────────────────────────
 * value       {string}    Initial HTML content (component re-mounts when key changes).
 * departmentId {number}    Passed through to media uploader.
 * onBlur      {Function}  Called with HTML when editor loses focus.
 * placeholder {string}    Placeholder text.
 */
export default function QuestionHtmlEditor({ value, departmentId, onBlur, placeholder }) {
  return (
    <RichTextEditor
      value={value}
      onBlur={onBlur}
      departmentId={departmentId}
      placeholder={placeholder}
    />
  )
}
