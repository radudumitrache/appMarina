export function gradeColor(g) {
  if (g >= 90) return 'sp-grade--high'
  if (g >= 70) return 'sp-grade--good'
  if (g >= 50) return 'sp-grade--mid'
  return 'sp-grade--low'
}

export function gradeLabel(g) {
  if (g >= 90) return 'Excellent'
  if (g >= 70) return 'Good'
  if (g >= 50) return 'Pass'
  return 'Fail'
}

export function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
