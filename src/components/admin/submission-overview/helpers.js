export function fmt(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function gradeClass(g) {
  if (g == null) return 'so-grade--none'
  if (g >= 90)   return 'so-grade--high'
  if (g >= 70)   return 'so-grade--good'
  if (g >= 50)   return 'so-grade--mid'
  return 'so-grade--low'
}

export function cardClass(isCorrect, unanswered) {
  if (unanswered)        return 'so-card so-card--unanswered'
  if (isCorrect === true)  return 'so-card so-card--correct'
  if (isCorrect === false) return 'so-card so-card--wrong'
  return 'so-card so-card--pending'
}

export function buildPanels(testPanels, answers) {
  const byExercise = {}, byVrMcq = {}, byVrTf = {}, byVrShort = {}, byVrWord = {}, byVrLoc = {}
  for (const a of answers) {
    if (a.exercise)                byExercise[a.exercise]            = a
    if (a.vr_mcq_anchor)          byVrMcq[a.vr_mcq_anchor]          = a
    if (a.vr_tf_anchor)           byVrTf[a.vr_tf_anchor]            = a
    if (a.vr_short_anchor)        byVrShort[a.vr_short_anchor]      = a
    if (a.vr_word_anchor)         byVrWord[a.vr_word_anchor]        = a
    if (a.vr_localization_anchor) byVrLoc[a.vr_localization_anchor] = a
  }

  return testPanels.map(panel => {
    const items = []

    for (const ex of panel.exercise_content?.exercises ?? [])
      items.push({ kind: 'exercise', source: ex, answer: byExercise[ex.id] ?? null })

    const vr = panel.vr_exercise
    if (vr) {
      for (const a of vr.mcq_anchors ?? [])
        items.push({ kind: 'vr', source: { ...a, _type: 'mcq' },          answer: byVrMcq[a.id]   ?? null })
      for (const a of vr.tf_anchors ?? [])
        items.push({ kind: 'vr', source: { ...a, _type: 'tf' },           answer: byVrTf[a.id]    ?? null })
      for (const a of vr.short_anchors ?? [])
        items.push({ kind: 'vr', source: { ...a, _type: 'short' },        answer: byVrShort[a.id] ?? null })
      for (const a of vr.word_completion_anchors ?? [])
        items.push({ kind: 'vr', source: { ...a, _type: 'word' },         answer: byVrWord[a.id]  ?? null })
      for (const a of vr.localization_anchors ?? [])
        items.push({ kind: 'vr', source: { ...a, _type: 'localization' }, answer: byVrLoc[a.id]   ?? null })
    }

    return { title: panel.title, order: panel.order, items }
  }).filter(p => p.items.length > 0)
}

export function resolveQuestion(item) {
  const { kind, source, answer } = item
  const isCorrect = answer?.is_correct ?? null

  if (kind === 'exercise') {
    const t = source.type
    if (t === 'mcq') {
      const opts       = [...(source.options ?? [])].sort((a, b) => a.order - b.order)
      const correctOpt = opts.find(o => o.order === source.correct_mcq_index)
      return { type: 'mcq', typeLabel: 'Multiple Choice', text: source.text, isCorrect,
        options: opts, studentOptId: answer?.exercise_option ?? null, correctOptId: correctOpt?.id ?? null }
    }
    if (t === 'tf')
      return { type: 'tf', typeLabel: 'True / False', text: source.text, isCorrect,
        studentTf: answer?.selected_tf ?? null, correctTf: source.correct_tf }
    if (t === 'short')
      return { type: 'short', typeLabel: 'Short Answer', text: source.text, isCorrect,
        studentText: answer?.text_answer || null }
    if (t === 'argument')
      return { type: 'argument', typeLabel: 'Argument', text: source.text, isCorrect,
        studentText: answer?.text_answer || null }
    if (t === 'arrange') {
      const itms        = source.arrange_items ?? []
      const correctItems = [...itms].sort((a, b) => a.correct_order - b.correct_order)
      const ids          = (answer?.text_answer || '').split(',').map(Number).filter(Boolean)
      const studentItems = ids.map(id => itms.find(i => i.id === id)).filter(Boolean)
      return { type: 'arrange', typeLabel: 'Arrange in Order', text: source.text, isCorrect,
        correctItems, studentItems }
    }
  }

  if (kind === 'vr') {
    const atype = source._type
    if (atype === 'mcq') {
      const opts       = [...(source.options ?? [])].sort((a, b) => a.order - b.order)
      const correctOpt = opts.find(o => o.order === source.correct_mcq_index)
      return { type: 'mcq', typeLabel: 'VR Multiple Choice', text: source.text, title: source.title, isCorrect,
        options: opts, studentOptId: answer?.vr_mcq_anchor_option ?? null, correctOptId: correctOpt?.id ?? null }
    }
    if (atype === 'tf')
      return { type: 'tf', typeLabel: 'VR True / False', text: source.text, title: source.title, isCorrect,
        studentTf: answer?.selected_tf ?? null, correctTf: source.correct_tf }
    if (atype === 'short')
      return { type: 'short', typeLabel: 'VR Short Answer', text: source.text, title: source.title, isCorrect,
        studentText: answer?.text_answer || null }
    if (atype === 'word')
      return { type: 'word', typeLabel: 'VR Fill in Blank', text: source.text, title: source.title, isCorrect,
        studentText: answer?.text_answer || null, correctWord: source.correct_word }
    if (atype === 'localization')
      return { type: 'localization', typeLabel: 'VR Localize', text: source.text, title: source.title, isCorrect,
        placed: !!answer?.text_answer }
  }

  return { type: 'unknown', typeLabel: '—', text: '', isCorrect: null }
}
