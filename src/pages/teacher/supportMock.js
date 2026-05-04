export const MY_TICKETS = [
  { id: 'TK-008', subject: 'Student cannot see published course',         category: 'Platform',  status: 'open',     created: '2026-03-26', updated: '2026-03-28', lastReply: 'Support Team' },
  { id: 'TK-007', subject: 'Grade export not generating CSV correctly',   category: 'Technical', status: 'pending',  created: '2026-03-20', updated: '2026-03-22', lastReply: 'Support Team' },
  { id: 'TK-006', subject: 'VR scenario stuck on loading screen',         category: 'Hardware',  status: 'pending',  created: '2026-03-14', updated: '2026-03-16', lastReply: 'Support Team' },
  { id: 'TK-005', subject: 'Request to add new lesson to content library',category: 'Content',   status: 'resolved', created: '2026-02-28', updated: '2026-03-02', lastReply: 'Support Team' },
  { id: 'TK-004', subject: 'Student enrolment limit for class MN-2024-A', category: 'Account',   status: 'resolved', created: '2026-02-10', updated: '2026-02-11', lastReply: 'Support Team' },
]

export const FAQ = [
  { id: 1, q: 'How do I enrol students into my class?',                       a: 'Navigate to My Classes, open the class detail page, and click "Enrol Student" on the Students tab. You can add students individually by email. Bulk enrolment via CSV upload is available — contact support if you need that template.' },
  { id: 2, q: 'Why is my published course not visible to students?',           a: 'Ensure the course is assigned to a class and the class status is Active. Published courses are only visible to students enrolled in the assigned class. Check the Course Builder to confirm the class assignment is saved.' },
  { id: 3, q: 'How do I allow a student to retake a test?',                    a: "Open the Test Builder, select the test, and in the student submissions view you can reset a specific student's attempt. This unlocks a fresh attempt for that student only." },
  { id: 4, q: 'Can I reorder lessons in a course after publishing?',           a: 'Yes. Open the Course Builder, reorder the lessons using the up/down arrows, then re-publish. Existing student progress is preserved — only the order they see new incomplete lessons is affected.' },
  { id: 5, q: 'How do I export student grades?',                               a: 'On the Student Progress page, use the Export button (top right) to download a CSV of all grades for the selected class and date range. If you encounter issues, submit a Technical ticket.' },
  { id: 6, q: "A student's VR headset cannot connect to my session. What should I check?", a: "Ensure both the instructor station and the student's headset are on the same local network segment. Restart the SeaFarer Companion app on both devices. If the issue persists, submit a Hardware ticket with the headset serial number." },
]

export const CATEGORIES = ['Technical', 'Access', 'Account', 'Hardware', 'Other']

export const STATUS_META = {
  open:     { label: 'Open',     cls: 'ts-status--open'     },
  pending:  { label: 'Pending',  cls: 'ts-status--pending'  },
  resolved: { label: 'Resolved', cls: 'ts-status--resolved' },
}
