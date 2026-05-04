export const INITIAL_TESTS = [
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

export const Q_TYPES = [
  { id: 'mcq',   label: 'Multiple Choice' },
  { id: 'tf',    label: 'True / False'    },
  { id: 'short', label: 'Short Answer'    },
]

export const STATUS_META = {
  published: { label: 'Published', cls: 'status--published' },
  draft:     { label: 'Draft',     cls: 'status--draft'     },
}

let nextQId = 100
export function emptyQuestion(type) {
  const base = { id: ++nextQId, type, text: '' }
  if (type === 'mcq')   return { ...base, options: ['', '', '', ''], correct: 0 }
  if (type === 'tf')    return { ...base, correct: true }
  if (type === 'short') return base
  return base
}
