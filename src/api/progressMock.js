// ─── MOCK DATA FOR DEVELOPMENT ───────────────────────────────────────────────
// TO SWITCH TO REAL API: delete this file and in Progress.jsx replace
//   import { fetchProgressData } from '../../api/progressMock'
// with the two real calls already written in the comment block there.
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_CLASSES = [
  { id: 1, code: 'MN-2024-A', name: 'Navigation Alpha'  },
  { id: 2, code: 'EP-2024-B', name: 'Emergency Beta'    },
  { id: 3, code: 'ER-2024-C', name: 'Engine Charlie'    },
  { id: 4, code: 'CL-2024-D', name: 'Cargo Delta'       },
  { id: 5, code: 'CM-2024-E', name: 'Comms Echo'        },
]

const MOCK_STUDENTS = [
  // ── Navigation Alpha (class 1) ──────────────────────────────────────────────
  { student_id:  1, student_name: 'James Harrington',  classroom_id: 1, classroom_name: 'Navigation Alpha', lessons_done: 10, lessons_total: 12, last_active: new Date(Date.now() - 2*60*60*1000).toISOString(),     status: 'on-track' },
  { student_id:  2, student_name: 'Sofia Petrova',     classroom_id: 1, classroom_name: 'Navigation Alpha', lessons_done:  7, lessons_total: 12, last_active: new Date(Date.now() - 24*60*60*1000).toISOString(),    status: 'on-track' },
  { student_id:  3, student_name: 'Marcus Lee',        classroom_id: 1, classroom_name: 'Navigation Alpha', lessons_done: 12, lessons_total: 12, last_active: new Date(Date.now() - 30*60*1000).toISOString(),       status: 'complete' },
  { student_id:  4, student_name: 'Amara Toure',       classroom_id: 1, classroom_name: 'Navigation Alpha', lessons_done:  3, lessons_total: 12, last_active: new Date(Date.now() - 5*24*60*60*1000).toISOString(),  status: 'at-risk'  },
  { student_id: 16, student_name: 'Chloe Dupont',      classroom_id: 1, classroom_name: 'Navigation Alpha', lessons_done: 11, lessons_total: 12, last_active: new Date(Date.now() - 45*60*1000).toISOString(),       status: 'on-track' },
  { student_id: 17, student_name: 'Dmitri Volkov',     classroom_id: 1, classroom_name: 'Navigation Alpha', lessons_done:  1, lessons_total: 12, last_active: new Date(Date.now() - 18*24*60*60*1000).toISOString(), status: 'at-risk'  },
  { student_id: 18, student_name: 'Aisha Kamara',      classroom_id: 1, classroom_name: 'Navigation Alpha', lessons_done:  8, lessons_total: 12, last_active: new Date(Date.now() - 5*60*60*1000).toISOString(),     status: 'on-track' },
  { student_id: 19, student_name: 'Patrick O\'Brien',  classroom_id: 1, classroom_name: 'Navigation Alpha', lessons_done: 12, lessons_total: 12, last_active: new Date(Date.now() - 3*24*60*60*1000).toISOString(),  status: 'complete' },

  // ── Emergency Beta (class 2) ────────────────────────────────────────────────
  { student_id:  5, student_name: 'Rafael Cruz',       classroom_id: 2, classroom_name: 'Emergency Beta',   lessons_done:  6, lessons_total:  8, last_active: new Date(Date.now() - 3*60*60*1000).toISOString(),     status: 'on-track' },
  { student_id:  6, student_name: 'Elena Voronova',    classroom_id: 2, classroom_name: 'Emergency Beta',   lessons_done:  1, lessons_total:  8, last_active: new Date(Date.now() - 14*24*60*60*1000).toISOString(), status: 'at-risk'  },
  { student_id:  7, student_name: 'Thomas Nakamura',   classroom_id: 2, classroom_name: 'Emergency Beta',   lessons_done:  8, lessons_total:  8, last_active: new Date(Date.now() - 1*60*60*1000).toISOString(),     status: 'complete' },
  { student_id: 20, student_name: 'Fatima Al-Rashid',  classroom_id: 2, classroom_name: 'Emergency Beta',   lessons_done:  5, lessons_total:  8, last_active: new Date(Date.now() - 8*60*60*1000).toISOString(),     status: 'on-track' },
  { student_id: 21, student_name: 'Lars Eriksson',     classroom_id: 2, classroom_name: 'Emergency Beta',   lessons_done:  0, lessons_total:  8, last_active: null,                                                  status: 'at-risk'  },
  { student_id: 22, student_name: 'Mei Ling Chen',     classroom_id: 2, classroom_name: 'Emergency Beta',   lessons_done:  7, lessons_total:  8, last_active: new Date(Date.now() - 90*60*1000).toISOString(),       status: 'on-track' },
  { student_id: 23, student_name: 'Carlos Mendez',     classroom_id: 2, classroom_name: 'Emergency Beta',   lessons_done:  8, lessons_total:  8, last_active: new Date(Date.now() - 2*24*60*60*1000).toISOString(),  status: 'complete' },

  // ── Engine Charlie (class 3) ────────────────────────────────────────────────
  { student_id:  8, student_name: 'Ingrid Bjornsen',   classroom_id: 3, classroom_name: 'Engine Charlie',   lessons_done:  7, lessons_total: 10, last_active: new Date(Date.now() - 2*24*60*60*1000).toISOString(),  status: 'on-track' },
  { student_id:  9, student_name: 'Kwame Osei',        classroom_id: 3, classroom_name: 'Engine Charlie',   lessons_done:  9, lessons_total: 10, last_active: new Date(Date.now() - 4*60*60*1000).toISOString(),     status: 'on-track' },
  { student_id: 10, student_name: 'Priya Desai',       classroom_id: 3, classroom_name: 'Engine Charlie',   lessons_done:  2, lessons_total: 10, last_active: new Date(Date.now() - 21*24*60*60*1000).toISOString(), status: 'at-risk'  },
  { student_id: 24, student_name: 'Tobias Gruber',     classroom_id: 3, classroom_name: 'Engine Charlie',   lessons_done: 10, lessons_total: 10, last_active: new Date(Date.now() - 6*60*60*1000).toISOString(),     status: 'complete' },
  { student_id: 25, student_name: 'Nkechi Okafor',     classroom_id: 3, classroom_name: 'Engine Charlie',   lessons_done:  4, lessons_total: 10, last_active: new Date(Date.now() - 9*24*60*60*1000).toISOString(),  status: 'at-risk'  },
  { student_id: 26, student_name: 'Ivan Petrov',       classroom_id: 3, classroom_name: 'Engine Charlie',   lessons_done:  6, lessons_total: 10, last_active: new Date(Date.now() - 36*60*60*1000).toISOString(),    status: 'on-track' },
  { student_id: 27, student_name: 'Sara Lindqvist',    classroom_id: 3, classroom_name: 'Engine Charlie',   lessons_done:  3, lessons_total: 10, last_active: new Date(Date.now() - 12*24*60*60*1000).toISOString(), status: 'at-risk'  },

  // ── Cargo Delta (class 4) ───────────────────────────────────────────────────
  { student_id: 11, student_name: 'Luca Moretti',      classroom_id: 4, classroom_name: 'Cargo Delta',      lessons_done:  5, lessons_total:  6, last_active: new Date(Date.now() - 6*60*60*1000).toISOString(),     status: 'on-track' },
  { student_id: 12, student_name: 'Yuki Sato',         classroom_id: 4, classroom_name: 'Cargo Delta',      lessons_done:  2, lessons_total:  6, last_active: new Date(Date.now() - 4*24*60*60*1000).toISOString(),  status: 'on-track' },
  { student_id: 13, student_name: 'Oluwaseun Balogun', classroom_id: 4, classroom_name: 'Cargo Delta',      lessons_done:  0, lessons_total:  6, last_active: null,                                                  status: 'at-risk'  },
  { student_id: 28, student_name: 'Ana Vasquez',       classroom_id: 4, classroom_name: 'Cargo Delta',      lessons_done:  6, lessons_total:  6, last_active: new Date(Date.now() - 12*60*60*1000).toISOString(),    status: 'complete' },
  { student_id: 29, student_name: 'Ravi Shankar',      classroom_id: 4, classroom_name: 'Cargo Delta',      lessons_done:  4, lessons_total:  6, last_active: new Date(Date.now() - 30*60*60*1000).toISOString(),    status: 'on-track' },
  { student_id: 30, student_name: 'Zoe Papadopoulos',  classroom_id: 4, classroom_name: 'Cargo Delta',      lessons_done:  1, lessons_total:  6, last_active: new Date(Date.now() - 10*24*60*60*1000).toISOString(), status: 'at-risk'  },
  { student_id: 31, student_name: 'Omar Farouk',       classroom_id: 4, classroom_name: 'Cargo Delta',      lessons_done:  6, lessons_total:  6, last_active: new Date(Date.now() - 48*60*60*1000).toISOString(),    status: 'complete' },

  // ── Comms Echo (class 5) ────────────────────────────────────────────────────
  { student_id: 14, student_name: 'Hiroshi Kimura',    classroom_id: 5, classroom_name: 'Comms Echo',       lessons_done:  5, lessons_total:  5, last_active: new Date(Date.now() - 24*60*60*1000).toISOString(),    status: 'complete' },
  { student_id: 15, student_name: 'Nadia Wozniak',     classroom_id: 5, classroom_name: 'Comms Echo',       lessons_done:  4, lessons_total:  5, last_active: new Date(Date.now() - 2*24*60*60*1000).toISOString(),  status: 'on-track' },
  { student_id: 32, student_name: 'Alejandro Reyes',   classroom_id: 5, classroom_name: 'Comms Echo',       lessons_done:  2, lessons_total:  5, last_active: new Date(Date.now() - 7*24*60*60*1000).toISOString(),  status: 'at-risk'  },
  { student_id: 33, student_name: 'Brigitte Müller',   classroom_id: 5, classroom_name: 'Comms Echo',       lessons_done:  5, lessons_total:  5, last_active: new Date(Date.now() - 3*60*60*1000).toISOString(),     status: 'complete' },
  { student_id: 34, student_name: 'Samuel Asante',     classroom_id: 5, classroom_name: 'Comms Echo',       lessons_done:  3, lessons_total:  5, last_active: new Date(Date.now() - 60*60*60*1000).toISOString(),    status: 'on-track' },
  { student_id: 35, student_name: 'Yuna Park',         classroom_id: 5, classroom_name: 'Comms Echo',       lessons_done:  0, lessons_total:  5, last_active: new Date(Date.now() - 25*24*60*60*1000).toISOString(), status: 'at-risk'  },
]

const MOCK_ASSIGNMENTS = {
  1: [
    { id: 101, title: 'Nav Fundamentals Quiz',  due_date: '2026-04-15' },
    { id: 102, title: 'Chart Reading Test',     due_date: '2026-05-01' },
  ],
  2: [
    { id: 201, title: 'Emergency Procedures',   due_date: '2026-04-20' },
  ],
  3: [
    { id: 301, title: 'Engine Systems Test',    due_date: '2026-04-28' },
    { id: 302, title: 'Maintenance Quiz',       due_date: '2026-05-10' },
  ],
  4: [
    { id: 401, title: 'Cargo Handling Basics',  due_date: '2026-04-25' },
  ],
  5: [
    { id: 501, title: 'GMDSS Fundamentals',     due_date: '2026-05-05' },
    { id: 502, title: 'Radio Procedures',       due_date: '2026-05-12' },
  ],
}

// grade: null means not submitted
const MOCK_SUBMISSIONS = {
  101: [
    { student:  1, grade: 88 }, { student:  2, grade: 72 }, { student:  3, grade: 95 },
    { student:  4, grade: 54 }, { student: 16, grade: 91 }, { student: 17, grade: 42 },
    { student: 18, grade: 78 }, { student: 19, grade: 96 },
  ],
  102: [
    { student:  1, grade: 91 }, { student:  3, grade: 98 }, { student: 16, grade: 87 },
    { student: 18, grade: 74 }, { student: 19, grade: 99 },
  ],
  201: [
    { student:  5, grade: 81 }, { student:  7, grade: 91 }, { student: 20, grade: 76 },
    { student: 22, grade: 88 }, { student: 23, grade: 94 },
  ],
  301: [
    { student:  8, grade: 76 }, { student:  9, grade: 83 }, { student: 24, grade: 92 },
    { student: 26, grade: 67 },
  ],
  302: [
    { student:  9, grade: 80 }, { student: 24, grade: 95 },
  ],
  401: [
    { student: 11, grade: 79 }, { student: 12, grade: 63 }, { student: 28, grade: 91 },
    { student: 29, grade: 85 }, { student: 31, grade: 88 },
  ],
  501: [
    { student: 14, grade: 97 }, { student: 15, grade: 85 }, { student: 33, grade: 92 },
    { student: 34, grade: 71 },
  ],
  502: [
    { student: 14, grade: 94 }, { student: 33, grade: 89 },
  ],
}

function delay(ms = 300) {
  return new Promise(r => setTimeout(r, ms))
}

export async function fetchProgressData() {
  await delay()
  return {
    students: MOCK_STUDENTS,
    classes:  MOCK_CLASSES,
  }
}

export async function fetchStudentTests(classroomId, studentId) {
  await delay(200)
  const assignments = MOCK_ASSIGNMENTS[classroomId] ?? []
  return assignments.map(test => {
    const sub = (MOCK_SUBMISSIONS[test.id] ?? []).find(s => s.student === studentId)
    return {
      id:          test.id,
      title:       test.title,
      dueDate:     test.due_date,
      grade:       sub?.grade ?? null,
      submittedAt: sub ? new Date().toISOString() : null,
    }
  })
}
