// â”€â”€â”€ MOCK DATA FOR DEVELOPMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TO SWITCH TO REAL API: delete this file and in Progress.jsx replace
//   import { fetchProgressData } from '../../api/progressMock'
// with the two real calls already written in the comment block there.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MOCK_CLASSES = [
  { id: 1, code: 'MN-2024-A', name: 'Navigation Alpha'  },
  { id: 2, code: 'EP-2024-B', name: 'Emergency Beta'    },
  { id: 3, code: 'ER-2024-C', name: 'Engine Charlie'    },
  { id: 4, code: 'CL-2024-D', name: 'Cargo Delta'       },
  { id: 5, code: 'CM-2024-E', name: 'Comms Echo'        },
]

const MOCK_STUDENTS = [
  // â”€â”€ Navigation Alpha (class 1) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { crew_member_id:  1, crew_name: 'James Harrington',  department_id: 1, department_name: 'Navigation Alpha', modules_done: 10, modules_total: 12, last_active: new Date(Date.now() - 2*60*60*1000).toISOString(),     status: 'on-track' },
  { crew_member_id:  2, crew_name: 'Sofia Petrova',     department_id: 1, department_name: 'Navigation Alpha', modules_done:  7, modules_total: 12, last_active: new Date(Date.now() - 24*60*60*1000).toISOString(),    status: 'on-track' },
  { crew_member_id:  3, crew_name: 'Marcus Lee',        department_id: 1, department_name: 'Navigation Alpha', modules_done: 12, modules_total: 12, last_active: new Date(Date.now() - 30*60*1000).toISOString(),       status: 'complete' },
  { crew_member_id:  4, crew_name: 'Amara Toure',       department_id: 1, department_name: 'Navigation Alpha', modules_done:  3, modules_total: 12, last_active: new Date(Date.now() - 5*24*60*60*1000).toISOString(),  status: 'at-risk'  },
  { crew_member_id: 16, crew_name: 'Chloe Dupont',      department_id: 1, department_name: 'Navigation Alpha', modules_done: 11, modules_total: 12, last_active: new Date(Date.now() - 45*60*1000).toISOString(),       status: 'on-track' },
  { crew_member_id: 17, crew_name: 'Dmitri Volkov',     department_id: 1, department_name: 'Navigation Alpha', modules_done:  1, modules_total: 12, last_active: new Date(Date.now() - 18*24*60*60*1000).toISOString(), status: 'at-risk'  },
  { crew_member_id: 18, crew_name: 'Aisha Kamara',      department_id: 1, department_name: 'Navigation Alpha', modules_done:  8, modules_total: 12, last_active: new Date(Date.now() - 5*60*60*1000).toISOString(),     status: 'on-track' },
  { crew_member_id: 19, crew_name: 'Patrick O\'Brien',  department_id: 1, department_name: 'Navigation Alpha', modules_done: 12, modules_total: 12, last_active: new Date(Date.now() - 3*24*60*60*1000).toISOString(),  status: 'complete' },

  // â”€â”€ Emergency Beta (class 2) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { crew_member_id:  5, crew_name: 'Rafael Cruz',       department_id: 2, department_name: 'Emergency Beta',   modules_done:  6, modules_total:  8, last_active: new Date(Date.now() - 3*60*60*1000).toISOString(),     status: 'on-track' },
  { crew_member_id:  6, crew_name: 'Elena Voronova',    department_id: 2, department_name: 'Emergency Beta',   modules_done:  1, modules_total:  8, last_active: new Date(Date.now() - 14*24*60*60*1000).toISOString(), status: 'at-risk'  },
  { crew_member_id:  7, crew_name: 'Thomas Nakamura',   department_id: 2, department_name: 'Emergency Beta',   modules_done:  8, modules_total:  8, last_active: new Date(Date.now() - 1*60*60*1000).toISOString(),     status: 'complete' },
  { crew_member_id: 20, crew_name: 'Fatima Al-Rashid',  department_id: 2, department_name: 'Emergency Beta',   modules_done:  5, modules_total:  8, last_active: new Date(Date.now() - 8*60*60*1000).toISOString(),     status: 'on-track' },
  { crew_member_id: 21, crew_name: 'Lars Eriksson',     department_id: 2, department_name: 'Emergency Beta',   modules_done:  0, modules_total:  8, last_active: null,                                                  status: 'at-risk'  },
  { crew_member_id: 22, crew_name: 'Mei Ling Chen',     department_id: 2, department_name: 'Emergency Beta',   modules_done:  7, modules_total:  8, last_active: new Date(Date.now() - 90*60*1000).toISOString(),       status: 'on-track' },
  { crew_member_id: 23, crew_name: 'Carlos Mendez',     department_id: 2, department_name: 'Emergency Beta',   modules_done:  8, modules_total:  8, last_active: new Date(Date.now() - 2*24*60*60*1000).toISOString(),  status: 'complete' },

  // â”€â”€ Engine Charlie (class 3) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { crew_member_id:  8, crew_name: 'Ingrid Bjornsen',   department_id: 3, department_name: 'Engine Charlie',   modules_done:  7, modules_total: 10, last_active: new Date(Date.now() - 2*24*60*60*1000).toISOString(),  status: 'on-track' },
  { crew_member_id:  9, crew_name: 'Kwame Osei',        department_id: 3, department_name: 'Engine Charlie',   modules_done:  9, modules_total: 10, last_active: new Date(Date.now() - 4*60*60*1000).toISOString(),     status: 'on-track' },
  { crew_member_id: 10, crew_name: 'Priya Desai',       department_id: 3, department_name: 'Engine Charlie',   modules_done:  2, modules_total: 10, last_active: new Date(Date.now() - 21*24*60*60*1000).toISOString(), status: 'at-risk'  },
  { crew_member_id: 24, crew_name: 'Tobias Gruber',     department_id: 3, department_name: 'Engine Charlie',   modules_done: 10, modules_total: 10, last_active: new Date(Date.now() - 6*60*60*1000).toISOString(),     status: 'complete' },
  { crew_member_id: 25, crew_name: 'Nkechi Okafor',     department_id: 3, department_name: 'Engine Charlie',   modules_done:  4, modules_total: 10, last_active: new Date(Date.now() - 9*24*60*60*1000).toISOString(),  status: 'at-risk'  },
  { crew_member_id: 26, crew_name: 'Ivan Petrov',       department_id: 3, department_name: 'Engine Charlie',   modules_done:  6, modules_total: 10, last_active: new Date(Date.now() - 36*60*60*1000).toISOString(),    status: 'on-track' },
  { crew_member_id: 27, crew_name: 'Sara Lindqvist',    department_id: 3, department_name: 'Engine Charlie',   modules_done:  3, modules_total: 10, last_active: new Date(Date.now() - 12*24*60*60*1000).toISOString(), status: 'at-risk'  },

  // â”€â”€ Cargo Delta (class 4) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { crew_member_id: 11, crew_name: 'Luca Moretti',      department_id: 4, department_name: 'Cargo Delta',      modules_done:  5, modules_total:  6, last_active: new Date(Date.now() - 6*60*60*1000).toISOString(),     status: 'on-track' },
  { crew_member_id: 12, crew_name: 'Yuki Sato',         department_id: 4, department_name: 'Cargo Delta',      modules_done:  2, modules_total:  6, last_active: new Date(Date.now() - 4*24*60*60*1000).toISOString(),  status: 'on-track' },
  { crew_member_id: 13, crew_name: 'Oluwaseun Balogun', department_id: 4, department_name: 'Cargo Delta',      modules_done:  0, modules_total:  6, last_active: null,                                                  status: 'at-risk'  },
  { crew_member_id: 28, crew_name: 'Ana Vasquez',       department_id: 4, department_name: 'Cargo Delta',      modules_done:  6, modules_total:  6, last_active: new Date(Date.now() - 12*60*60*1000).toISOString(),    status: 'complete' },
  { crew_member_id: 29, crew_name: 'Ravi Shankar',      department_id: 4, department_name: 'Cargo Delta',      modules_done:  4, modules_total:  6, last_active: new Date(Date.now() - 30*60*60*1000).toISOString(),    status: 'on-track' },
  { crew_member_id: 30, crew_name: 'Zoe Papadopoulos',  department_id: 4, department_name: 'Cargo Delta',      modules_done:  1, modules_total:  6, last_active: new Date(Date.now() - 10*24*60*60*1000).toISOString(), status: 'at-risk'  },
  { crew_member_id: 31, crew_name: 'Omar Farouk',       department_id: 4, department_name: 'Cargo Delta',      modules_done:  6, modules_total:  6, last_active: new Date(Date.now() - 48*60*60*1000).toISOString(),    status: 'complete' },

  // â”€â”€ Comms Echo (class 5) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  { crew_member_id: 14, crew_name: 'Hiroshi Kimura',    department_id: 5, department_name: 'Comms Echo',       modules_done:  5, modules_total:  5, last_active: new Date(Date.now() - 24*60*60*1000).toISOString(),    status: 'complete' },
  { crew_member_id: 15, crew_name: 'Nadia Wozniak',     department_id: 5, department_name: 'Comms Echo',       modules_done:  4, modules_total:  5, last_active: new Date(Date.now() - 2*24*60*60*1000).toISOString(),  status: 'on-track' },
  { crew_member_id: 32, crew_name: 'Alejandro Reyes',   department_id: 5, department_name: 'Comms Echo',       modules_done:  2, modules_total:  5, last_active: new Date(Date.now() - 7*24*60*60*1000).toISOString(),  status: 'at-risk'  },
  { crew_member_id: 33, crew_name: 'Brigitte MÃ¼ller',   department_id: 5, department_name: 'Comms Echo',       modules_done:  5, modules_total:  5, last_active: new Date(Date.now() - 3*60*60*1000).toISOString(),     status: 'complete' },
  { crew_member_id: 34, crew_name: 'Samuel Asante',     department_id: 5, department_name: 'Comms Echo',       modules_done:  3, modules_total:  5, last_active: new Date(Date.now() - 60*60*60*1000).toISOString(),    status: 'on-track' },
  { crew_member_id: 35, crew_name: 'Yuna Park',         department_id: 5, department_name: 'Comms Echo',       modules_done:  0, modules_total:  5, last_active: new Date(Date.now() - 25*24*60*60*1000).toISOString(), status: 'at-risk'  },
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
