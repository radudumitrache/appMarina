export const CLASSES = [
  { id: 'all', label: 'All Classes' },
  { id: 1,     label: 'MN-2024-A — Navigation Alpha' },
  { id: 2,     label: 'EP-2024-B — Emergency Beta'   },
  { id: 3,     label: 'ER-2024-C — Engine Charlie'   },
  { id: 4,     label: 'CL-2024-D — Cargo Delta'      },
  { id: 5,     label: 'CM-2024-E — Comms Echo'       },
]

export const STUDENTS = [
  { id:  1, initials: 'JH', name: 'James Harrington',  classId: 1, className: 'Navigation Alpha', lessonsDone: 10, lessonsTotal: 12, avgScore:   88, lastActive: '2h ago',  status: 'on-track' },
  { id:  2, initials: 'SP', name: 'Sofia Petrova',     classId: 1, className: 'Navigation Alpha', lessonsDone:  7, lessonsTotal: 12, avgScore:   72, lastActive: '1d ago',  status: 'on-track' },
  { id:  3, initials: 'ML', name: 'Marcus Lee',        classId: 1, className: 'Navigation Alpha', lessonsDone: 12, lessonsTotal: 12, avgScore:   95, lastActive: '30m ago', status: 'complete' },
  { id:  4, initials: 'AT', name: 'Amara Toure',       classId: 1, className: 'Navigation Alpha', lessonsDone:  3, lessonsTotal: 12, avgScore:   54, lastActive: '5d ago',  status: 'at-risk'  },
  { id:  5, initials: 'RC', name: 'Rafael Cruz',       classId: 2, className: 'Emergency Beta',   lessonsDone:  6, lessonsTotal:  8, avgScore:   81, lastActive: '3h ago',  status: 'on-track' },
  { id:  6, initials: 'EV', name: 'Elena Voronova',    classId: 2, className: 'Emergency Beta',   lessonsDone:  1, lessonsTotal:  8, avgScore:   40, lastActive: '2w ago',  status: 'at-risk'  },
  { id:  7, initials: 'TN', name: 'Thomas Nakamura',   classId: 2, className: 'Emergency Beta',   lessonsDone:  8, lessonsTotal:  8, avgScore:   91, lastActive: '1h ago',  status: 'complete' },
  { id:  8, initials: 'IB', name: 'Ingrid Bjornsen',   classId: 3, className: 'Engine Charlie',   lessonsDone:  7, lessonsTotal: 10, avgScore:   76, lastActive: '2d ago',  status: 'on-track' },
  { id:  9, initials: 'KO', name: 'Kwame Osei',        classId: 3, className: 'Engine Charlie',   lessonsDone:  9, lessonsTotal: 10, avgScore:   83, lastActive: '4h ago',  status: 'on-track' },
  { id: 10, initials: 'PD', name: 'Priya Desai',       classId: 3, className: 'Engine Charlie',   lessonsDone:  2, lessonsTotal: 10, avgScore:   48, lastActive: '3w ago',  status: 'at-risk'  },
  { id: 11, initials: 'LM', name: 'Luca Moretti',      classId: 4, className: 'Cargo Delta',      lessonsDone:  5, lessonsTotal:  6, avgScore:   79, lastActive: '6h ago',  status: 'on-track' },
  { id: 12, initials: 'YS', name: 'Yuki Sato',         classId: 4, className: 'Cargo Delta',      lessonsDone:  2, lessonsTotal:  6, avgScore:   63, lastActive: '4d ago',  status: 'on-track' },
  { id: 13, initials: 'OB', name: 'Oluwaseun Balogun', classId: 4, className: 'Cargo Delta',      lessonsDone:  0, lessonsTotal:  6, avgScore: null, lastActive: 'Never',   status: 'at-risk'  },
  { id: 14, initials: 'HK', name: 'Hiroshi Kimura',    classId: 5, className: 'Comms Echo',       lessonsDone:  5, lessonsTotal:  5, avgScore:   97, lastActive: '1d ago',  status: 'complete' },
  { id: 15, initials: 'NW', name: 'Nadia Wozniak',     classId: 5, className: 'Comms Echo',       lessonsDone:  4, lessonsTotal:  5, avgScore:   85, lastActive: '2d ago',  status: 'on-track' },
]

export const STATUS_ORDER = { 'at-risk': 0, 'on-track': 1, 'complete': 2 }

export const STATUS_META = {
  'at-risk':  { label: 'At Risk',  className: 'badge--risk'     },
  'on-track': { label: 'On Track', className: 'badge--on-track' },
  'complete': { label: 'Complete', className: 'badge--complete' },
}

export const SORT_OPTIONS = [
  { id: 'name',       label: 'Name'        },
  { id: 'progress',   label: 'Progress'    },
  { id: 'score',      label: 'Avg. Score'  },
  { id: 'lastActive', label: 'Last Active' },
  { id: 'status',     label: 'Status'      },
]
