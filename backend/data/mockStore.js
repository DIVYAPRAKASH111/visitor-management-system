// System Pre-Loaded User Accounts (Admins, Security Officers, Visitors)
export const users = [
  // System Main Admin & Specific Assigned Admins
  {
    id: 'USR-ADMIN-MAIN',
    email: 'admin@campus.edu',
    password: 'admin123',
    name: 'Alex Johnson',
    role: 'admin',
    title: 'System Administrator (Main)',
    avatar: 'A',
  },
  {
    id: 'USR-ADMIN-1',
    email: 'admin1@gmail.com',
    password: 'admin123',
    name: 'Prakash',
    role: 'admin',
    title: 'Campus Administrator (Group 1: Reqs 1-20)',
    avatar: 'P',
  },
  {
    id: 'USR-ADMIN-2',
    email: 'admin2@gmail.com',
    password: 'admin456',
    name: 'Gobi',
    role: 'admin',
    title: 'Campus Administrator (Group 2: Reqs 21-40)',
    avatar: 'G',
  },
  {
    id: 'USR-ADMIN-3',
    email: 'admin3@gmail.com',
    password: 'admin789',
    name: 'Abhi',
    role: 'admin',
    title: 'Campus Administrator (Group 3: Reqs 41+)',
    avatar: 'A',
  },

  // Security Staff Accounts
  {
    id: 'USR-SEC-MAIN',
    email: 'officer@campus.edu',
    password: 'sec123',
    name: 'Officer Marcus Vance',
    role: 'security',
    title: 'Chief Security Officer',
    gate: 'Gate 1 / Main Entrance',
    avatar: 'M',
  },
  {
    id: 'USR-SEC-1',
    email: 'security1@gmail.com',
    password: 'security123',
    name: 'Ram',
    role: 'security',
    title: 'Security Officer Ram',
    gate: 'Gate 1 / Main Entrance',
    avatar: 'R',
  },
  {
    id: 'USR-SEC-2',
    email: 'security2@gmail.com',
    password: 'security456',
    name: 'Dobby',
    role: 'security',
    title: 'Security Officer Dobby',
    gate: 'Gate 2 / North Entrance',
    avatar: 'D',
  },
  {
    id: 'USR-SEC-3',
    email: 'security3@gmail.com',
    password: 'security789',
    name: 'Jap',
    role: 'security',
    title: 'Security Officer Jap',
    gate: 'Gate 3 / South Entrance',
    avatar: 'J',
  },

  // Default Visitor
  {
    id: 'USR-VISITOR-1',
    email: 'visitor@example.com',
    password: 'visitor123',
    name: 'Michael Scott',
    role: 'visitor',
    title: 'Registered Visitor',
    avatar: 'M',
  },
]

export const securityStaff = [
  { id: 'SEC-101', name: 'Ram', title: 'Security Officer Ram', gate: 'Gate 1 / Main Entrance' },
  { id: 'SEC-102', name: 'Dobby', title: 'Security Officer Dobby', gate: 'Gate 2 / North Entrance' },
  { id: 'SEC-103', name: 'Jap', title: 'Security Officer Jap', gate: 'Gate 3 / South Entrance' },
  { id: 'SEC-104', name: 'Officer Marcus Vance', title: 'Chief Security Officer', gate: 'Control Room' },
]

export const initialRequests = []
export const entryExitLogs = []
