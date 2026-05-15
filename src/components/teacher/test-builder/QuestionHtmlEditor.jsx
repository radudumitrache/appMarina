import RichTextEditor from '../../shared/RichTextEditor'

/* ── Props ───────────────────────────────────────────────────────────────────
 * value       {string}    Initial HTML content (component re-mounts when key changes).
 * classroomId {number}    Passed through to media uploader.
 * onBlur      {Function}  Called with HTML when editor loses focus.
 * placeholder {string}    Placeholder text.
 */
export default function QuestionHtmlEditor({ value, classroomId, onBlur, placeholder }) {
  return (
    <RichTextEditor
      value={value}
      onBlur={onBlur}
      classroomId={classroomId}
      placeholder={placeholder}
    />
  )
}
