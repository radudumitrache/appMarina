export const INITIAL_PROFILE = {
  firstName:   'Marina',
  lastName:    'Vasquez',
  email:       'marina.vasquez@seafarer.academy',
  employeeId:  'INS-2024-0031',
  nationality: 'Spanish',
  dateOfBirth: '1983-04-22',
  phone:       '+34 91 555 0144',
  department:  'Navigation & Deck Operations',
  subjects:    'Navigation, Cargo Handling, Emergency Procedures',
  startYear:   '2024',
  language:    'English',
  timezone:    'Europe/Madrid',
}

export const QUALIFICATIONS = [
  { id: 1, name: 'Chief Officer Certificate of Competency',  issued: '2015-06-01', expires: '2030-06-01', status: 'valid'    },
  { id: 2, name: 'STCW Instructor Certification',            issued: '2024-01-15', expires: '2029-01-15', status: 'valid'    },
  { id: 3, name: 'Advanced Fire Fighting Instructor',        issued: '2024-03-10', expires: '2029-03-10', status: 'valid'    },
  { id: 4, name: 'VR Platform Trainer Certification',        issued: '2024-09-01', expires: '2027-09-01', status: 'valid'    },
  { id: 5, name: 'ECDIS Type Approval Certificate',          issued: '2020-11-01', expires: '2025-11-01', status: 'expiring' },
  { id: 6, name: 'Dynamic Positioning Operator',             issued: null,         expires: null,          status: 'pending'  },
]

export const TIMEZONES = [
  'Europe/Madrid', 'Europe/London', 'Europe/Paris',
  'America/New_York', 'America/Vancouver', 'America/Chicago',
  'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney', 'UTC',
]

export const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', 'Japanese', 'Mandarin', 'Arabic']
