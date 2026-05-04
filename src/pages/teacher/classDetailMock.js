export const CLASSES = {
  1: { name: 'Maritime Navigation — Alpha', code: 'MN-2024-A', subject: 'Bridge Navigation',   status: 'active',   lessonsTotal: 12 },
  2: { name: 'Emergency Protocols — Beta',  code: 'EP-2024-B', subject: 'Emergency Protocols', status: 'active',   lessonsTotal:  8 },
  3: { name: 'Engine Room Ops — Charlie',   code: 'ER-2024-C', subject: 'Engine Room',         status: 'active',   lessonsTotal: 10 },
  4: { name: 'Cargo & Logistics — Delta',   code: 'CL-2024-D', subject: 'Cargo Management',    status: 'active',   lessonsTotal:  6 },
  5: { name: 'Communications — Echo',       code: 'CM-2024-E', subject: 'Communications',      status: 'complete', lessonsTotal:  5 },
  6: { name: 'Advanced Navigation — 2023',  code: 'AN-2023-F', subject: 'Bridge Navigation',   status: 'archived', lessonsTotal: 14 },
}

export const STUDENTS = [
  { id: 1,  initials: 'JH', name: 'James Harrington',   email: 'j.harrington@seafarer.edu', done: 10, lastActive: '2h ago',   status: 'active'   },
  { id: 2,  initials: 'SP', name: 'Sofia Petrova',      email: 's.petrova@seafarer.edu',    done:  7, lastActive: '1d ago',   status: 'active'   },
  { id: 3,  initials: 'ML', name: 'Marcus Lee',         email: 'm.lee@seafarer.edu',        done: 12, lastActive: '30m ago',  status: 'active'   },
  { id: 4,  initials: 'AT', name: 'Amara Toure',        email: 'a.toure@seafarer.edu',      done:  5, lastActive: '3d ago',   status: 'active'   },
  { id: 5,  initials: 'RC', name: 'Rafael Cruz',        email: 'r.cruz@seafarer.edu',       done:  9, lastActive: '5h ago',   status: 'active'   },
  { id: 6,  initials: 'EV', name: 'Elena Voronova',     email: 'e.voronova@seafarer.edu',   done:  3, lastActive: '1w ago',   status: 'inactive' },
  { id: 7,  initials: 'TN', name: 'Thomas Nakamura',    email: 't.nakamura@seafarer.edu',   done: 11, lastActive: '1h ago',   status: 'active'   },
  { id: 8,  initials: 'IB', name: 'Ingrid Bjornsen',    email: 'i.bjornsen@seafarer.edu',   done:  6, lastActive: '2d ago',   status: 'active'   },
  { id: 9,  initials: 'KO', name: 'Kwame Osei',         email: 'k.osei@seafarer.edu',       done:  8, lastActive: '4h ago',   status: 'active'   },
  { id: 10, initials: 'PD', name: 'Priya Desai',        email: 'p.desai@seafarer.edu',      done:  1, lastActive: '2w ago',   status: 'inactive' },
  { id: 11, initials: 'LM', name: 'Luca Moretti',       email: 'l.moretti@seafarer.edu',    done: 12, lastActive: '45m ago',  status: 'active'   },
  { id: 12, initials: 'YS', name: 'Yuki Sato',          email: 'y.sato@seafarer.edu',       done:  4, lastActive: '6d ago',   status: 'active'   },
]

export const LESSONS = [
  { id:  1, num: '01', title: 'Helm Control Basics',        cat: 'Navigation',   duration: '45 min', completed: 24, total: 24 },
  { id:  2, num: '02', title: 'Chart Reading Fundamentals', cat: 'Navigation',   duration: '60 min', completed: 22, total: 24 },
  { id:  3, num: '03', title: 'Radar & ARPA Systems',       cat: 'Navigation',   duration: '75 min', completed: 17, total: 24 },
  { id:  4, num: '04', title: 'Celestial Navigation',       cat: 'Navigation',   duration: '90 min', completed: 10, total: 24 },
  { id:  5, num: '05', title: 'Fire Safety Protocols',      cat: 'Emergency',    duration: '50 min', completed: 24, total: 24 },
  { id:  6, num: '06', title: 'Man Overboard Response',     cat: 'Emergency',    duration: '60 min', completed: 19, total: 24 },
  { id:  7, num: '07', title: 'Abandon Ship Procedure',     cat: 'Emergency',    duration: '45 min', completed: 13, total: 24 },
  { id:  8, num: '08', title: 'Main Engine Operations',     cat: 'Engineering',  duration: '80 min', completed: 24, total: 24 },
  { id:  9, num: '09', title: 'Fuel Management Systems',    cat: 'Engineering',  duration: '65 min', completed: 21, total: 24 },
  { id: 10, num: '10', title: 'Load Calculation',           cat: 'Cargo',        duration: '70 min', completed:  8, total: 24 },
  { id: 11, num: '11', title: 'Stability & Trim',           cat: 'Cargo',        duration: '85 min', completed:  3, total: 24 },
  { id: 12, num: '12', title: 'GMDSS Radio Operations',     cat: 'Comms',        duration: '55 min', completed:  0, total: 24 },
]

export const ASSIGNMENTS = [
  { id: 1, title: 'Navigation Chart Exercise',  dueDate: 'Apr 5, 2026',  submitted: 20, total: 24, avgScore: 84 },
  { id: 2, title: 'Radar Plot Assessment',       dueDate: 'Apr 12, 2026', submitted: 15, total: 24, avgScore: 71 },
  { id: 3, title: 'Emergency Drill Report',      dueDate: 'Apr 19, 2026', submitted:  4, total: 24, avgScore: null },
  { id: 4, title: 'Engine Room Inspection Log',  dueDate: 'Apr 26, 2026', submitted:  0, total: 24, avgScore: null },
]
