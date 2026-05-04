let _nextCommentId = 20

export const TAGS = ['Technical', 'Access', 'Account', 'Hardware', 'Other']

export const STATUS_META = {
  open:     { label: 'Open',     cls: 'as-status--open'     },
  pending:  { label: 'Pending',  cls: 'as-status--pending'  },
  resolved: { label: 'Resolved', cls: 'as-status--resolved' },
}

export function nextCommentId() { return _nextCommentId++ }

export const INITIAL_TICKETS = [
  {
    id: 1,
    ticket_id: 'TK-001',
    author_name: 'Alice Chen',
    author_role: 'student',
    subject: 'Cannot access Cargo Management lessons',
    description: 'Lessons 10 and 11 in Cargo Management are locked even though I completed the prerequisites. Please check the access control settings for my class.',
    tag: 'Access',
    status: 'open',
    created_at: '2026-03-25T09:00:00Z',
    updated_at: '2026-03-27T14:30:00Z',
    comments: [
      { id: 1, author_name: 'Support Admin', body: 'We are checking the access control settings for your class. Could you confirm your class code (e.g. SEC-2024-A)?', created_at: '2026-03-27T14:30:00Z' },
    ],
  },
  {
    id: 2,
    ticket_id: 'TK-002',
    author_name: 'Bob Martinez',
    author_role: 'student',
    subject: 'Test result not showing correct grade',
    description: 'My grade for the Load Calculation Quiz shows 61% but I believe my answers were marked incorrectly on questions 4 and 7.',
    tag: 'Technical',
    status: 'pending',
    created_at: '2026-03-18T11:00:00Z',
    updated_at: '2026-03-20T09:15:00Z',
    comments: [
      { id: 2, author_name: 'Support Admin', body: 'We are reviewing the quiz answer key. Could you confirm which browser and device you used when submitting?', created_at: '2026-03-20T09:15:00Z' },
    ],
  },
  {
    id: 3,
    ticket_id: 'TK-003',
    author_name: 'Clara Novak',
    author_role: 'student',
    subject: 'VR headset not connecting',
    description: 'The VR headset is not pairing with the companion app. I have tried restarting both devices and re-installing the companion app.',
    tag: 'Hardware',
    status: 'resolved',
    created_at: '2026-03-05T08:30:00Z',
    updated_at: '2026-03-07T10:00:00Z',
    comments: [
      { id: 3, author_name: 'Support Admin', body: 'Please ensure both devices are on the same local network and that the companion app firmware is updated to v2.4 or later.', created_at: '2026-03-06T09:00:00Z' },
      { id: 4, author_name: 'Support Admin', body: 'Headset is pairing correctly after the firmware update. Marking this ticket as resolved.', created_at: '2026-03-07T10:00:00Z' },
    ],
  },
  {
    id: 4,
    ticket_id: 'TK-004',
    author_name: 'Daniel Park',
    author_role: 'student',
    subject: 'Reset progress for Bridge Navigation module',
    description: 'I would like to reset my progress for the Bridge Navigation module so I can retake it from the beginning.',
    tag: 'Account',
    status: 'resolved',
    created_at: '2026-02-14T14:00:00Z',
    updated_at: '2026-02-15T11:00:00Z',
    comments: [
      { id: 5, author_name: 'Support Admin', body: 'Progress has been reset as requested. You can now retake the Bridge Navigation module from the beginning.', created_at: '2026-02-15T11:00:00Z' },
    ],
  },
  {
    id: 5,
    ticket_id: 'TK-005',
    author_name: 'Capt. Rodriguez',
    author_role: 'teacher',
    subject: 'Student cannot see published course',
    description: 'One of my students reported that the newly published Cargo Handling course is not visible in their Lessons list despite being enrolled in the class.',
    tag: 'Technical',
    status: 'open',
    created_at: '2026-03-26T10:00:00Z',
    updated_at: '2026-03-28T16:00:00Z',
    comments: [
      { id: 6, author_name: 'Support Admin', body: "Could you confirm the student's class code and check in Course Builder that the course is assigned to that specific class?", created_at: '2026-03-28T16:00:00Z' },
    ],
  },
  {
    id: 6,
    ticket_id: 'TK-006',
    author_name: 'Prof. Whitmore',
    author_role: 'teacher',
    subject: 'Grade export not generating CSV correctly',
    description: 'When I click Export on the Student Progress page the CSV downloads but dates are formatted incorrectly and several columns (Class, Completion %) are missing.',
    tag: 'Technical',
    status: 'pending',
    created_at: '2026-03-20T13:00:00Z',
    updated_at: '2026-03-22T10:00:00Z',
    comments: [
      { id: 7, author_name: 'Support Admin', body: 'We have reproduced the issue in our test environment and a fix is being prepared. We will notify you when it is deployed — estimated 2–3 business days.', created_at: '2026-03-22T10:00:00Z' },
    ],
  },
  {
    id: 7,
    ticket_id: 'TK-007',
    author_name: 'Instr. Chen',
    author_role: 'teacher',
    subject: 'VR scenario stuck on loading screen',
    description: 'Students in class SEC-2024-B are reporting that the Cargo Stowage VR scenario freezes on the loading screen after approximately 30 seconds and does not progress.',
    tag: 'Hardware',
    status: 'pending',
    created_at: '2026-03-14T09:30:00Z',
    updated_at: '2026-03-16T14:00:00Z',
    comments: [],
  },
  {
    id: 8,
    ticket_id: 'TK-008',
    author_name: 'Eng. Vasquez',
    author_role: 'teacher',
    subject: 'Request to add new lesson to content library',
    description: 'We need a new lesson on Emergency Procedures for Engine Room to be added to the content library for the upcoming SEC-2024-C class starting next month.',
    tag: 'Other',
    status: 'resolved',
    created_at: '2026-02-28T11:00:00Z',
    updated_at: '2026-03-02T15:00:00Z',
    comments: [
      { id: 8, author_name: 'Support Admin', body: 'The "Emergency Procedures for Engine Room" lesson has been added to the content library. You can now find and assign it via the Course Builder.', created_at: '2026-03-02T15:00:00Z' },
    ],
  },
]
