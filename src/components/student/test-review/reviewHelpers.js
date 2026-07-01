export function buildReviewPanels(test, submission) {
  const exerciseMap = {}
  const vrMap = { mcq: {}, tf: {}, short: {}, word: {}, localization: {} }

  for (const [pi, panel] of (test.panels ?? []).entries()) {
    for (const ex of panel.exercise_content?.exercises ?? []) {
      exerciseMap[ex.id] = { ...ex, panelTitle: panel.title, panelOrder: pi }
    }
    const vr = panel.vr_exercise
    if (vr) {
      const tag = (key, arr) => {
        for (const a of arr ?? [])
          vrMap[key][a.id] = { ...a, _type: key, panelTitle: panel.title, panelOrder: pi }
      }
      tag('mcq',          vr.mcq_anchors)
      tag('tf',           vr.tf_anchors)
      tag('short',        vr.short_anchors)
      tag('word',         vr.word_completion_anchors)
      tag('localization', vr.localization_anchors)
    }
  }

  const panelMap = {}

  function push(panelTitle, panelOrder, item) {
    if (!panelMap[panelTitle]) panelMap[panelTitle] = { panelOrder, items: [] }
    panelMap[panelTitle].items.push(item)
  }

  for (const answer of submission.answers ?? []) {
    if (answer.exercise) {
      const ex = exerciseMap[answer.exercise]
      if (ex) push(ex.panelTitle, ex.panelOrder, { kind: 'exercise', source: ex, answer })
    } else if (answer.vr_mcq_anchor) {
      const a = vrMap.mcq[answer.vr_mcq_anchor]
      if (a) push(a.panelTitle, a.panelOrder, { kind: 'vr', source: a, answer })
    } else if (answer.vr_tf_anchor) {
      const a = vrMap.tf[answer.vr_tf_anchor]
      if (a) push(a.panelTitle, a.panelOrder, { kind: 'vr', source: a, answer })
    } else if (answer.vr_short_anchor) {
      const a = vrMap.short[answer.vr_short_anchor]
      if (a) push(a.panelTitle, a.panelOrder, { kind: 'vr', source: a, answer })
    } else if (answer.vr_word_anchor) {
      const a = vrMap.word[answer.vr_word_anchor]
      if (a) push(a.panelTitle, a.panelOrder, { kind: 'vr', source: a, answer })
    } else if (answer.vr_localization_anchor) {
      const a = vrMap.localization[answer.vr_localization_anchor]
      if (a) push(a.panelTitle, a.panelOrder, { kind: 'vr', source: a, answer })
    }
  }

  return Object.entries(panelMap)
    .sort(([, a], [, b]) => a.panelOrder - b.panelOrder)
    .map(([title, { items }]) => ({ title, items }))
}

export function resolveItem(item) {
  const { kind, source, answer } = item
  const isCorrect = answer.is_correct

  if (kind === 'exercise') {
    const type = source.type

    if (type === 'mcq') {
      const opts          = source.options ?? []
      const correctOptIds = opts.filter(o => (source.correct_mcq_indices ?? []).includes(o.order)).map(o => o.id)
      const studentOptIds = answer.selected_option_ids ?? []
      const studentTexts  = opts.filter(o => studentOptIds.includes(o.id)).map(o => o.text)
      const correctTexts  = opts.filter(o => correctOptIds.includes(o.id)).map(o => o.text)
      return {
        typeLabel:     'MCQ',
        text:          source.text,
        isCorrect,
        studentAnswer: studentTexts.join(', ') || '—',
        correctAnswer: isCorrect === false ? (correctTexts.join(', ') || '—') : null,
        options:       opts,
        studentOptIds,
        correctOptIds,
      }
    }
    if (type === 'tf') {
      return {
        typeLabel:     'True / False',
        text:          source.text,
        isCorrect,
        studentAnswer: answer.selected_tf === true ? 'True' : answer.selected_tf === false ? 'False' : '—',
        correctAnswer: isCorrect === false ? (source.correct_tf ? 'True' : 'False') : null,
      }
    }
    if (type === 'short' || type === 'argument') {
      return {
        typeLabel:     type === 'argument' ? 'Argument' : 'Short Answer',
        text:          source.text,
        isCorrect,
        studentAnswer: answer.text_answer ?? '—',
        correctAnswer: null,
      }
    }
    if (type === 'arrange') {
      const ids          = (answer.text_answer || '').split(',').map(Number).filter(Boolean)
      const items        = source.arrange_items ?? []
      const studentOrder = ids.map(id => items.find(i => i.id === id)?.text ?? '?').join(' → ')
      const correctOrder = [...items].map(i => i.text).join(' → ')
      return {
        typeLabel:     'Arrange',
        text:          source.text,
        isCorrect,
        studentAnswer: studentOrder || '—',
        correctAnswer: isCorrect === false ? correctOrder : null,
      }
    }
  }

  if (kind === 'vr') {
    const atype  = source._type
    const prefix = 'VR'

    if (atype === 'mcq') {
      const opts          = source.options ?? []
      const correctOptIds = opts.filter(o => (source.correct_mcq_indices ?? []).includes(o.order)).map(o => o.id)
      const studentOptIds = answer.selected_option_ids ?? []
      const studentTexts  = opts.filter(o => studentOptIds.includes(o.id)).map(o => o.text)
      const correctTexts  = opts.filter(o => correctOptIds.includes(o.id)).map(o => o.text)
      return {
        typeLabel:     `${prefix} MCQ`,
        text:          source.text,
        title:         source.title,
        isCorrect,
        studentAnswer: studentTexts.join(', ') || '—',
        correctAnswer: isCorrect === false ? (correctTexts.join(', ') || '—') : null,
        options:       opts,
        studentOptIds,
        correctOptIds,
      }
    }
    if (atype === 'tf') {
      return {
        typeLabel:     `${prefix} True / False`,
        text:          source.text,
        title:         source.title,
        isCorrect,
        studentAnswer: answer.selected_tf === true ? 'True' : answer.selected_tf === false ? 'False' : '—',
        correctAnswer: isCorrect === false ? (source.correct_tf ? 'True' : 'False') : null,
      }
    }
    if (atype === 'short') {
      return {
        typeLabel:     `${prefix} Short Answer`,
        text:          source.text,
        title:         source.title,
        isCorrect,
        studentAnswer: answer.text_answer ?? '—',
        correctAnswer: null,
      }
    }
    if (atype === 'word') {
      return {
        typeLabel:     `${prefix} Fill in Blank`,
        text:          source.text,
        title:         source.title,
        isCorrect,
        studentAnswer: answer.text_answer ?? '—',
        correctAnswer: isCorrect === false ? source.correct_word : null,
      }
    }
    if (atype === 'localization') {
      return {
        typeLabel:     `${prefix} Locate`,
        text:          source.text,
        title:         source.title,
        isCorrect,
        studentAnswer: answer.text_answer ? 'Point placed in scene' : '—',
        correctAnswer: null,
      }
    }
  }

  return { typeLabel: '—', text: '', isCorrect: null, studentAnswer: '—', correctAnswer: null }
}

export function statusClass(v) {
  if (v === true)  return 'tr-status--correct'
  if (v === false) return 'tr-status--wrong'
  return 'tr-status--pending'
}

export function statusLabel(v) {
  if (v === true)  return 'Correct'
  if (v === false) return 'Incorrect'
  return 'Pending'
}

export function gradeColor(g) {
  if (g >= 90) return 'tr-grade--high'
  if (g >= 70) return 'tr-grade--good'
  if (g >= 50) return 'tr-grade--mid'
  return 'tr-grade--low'
}
