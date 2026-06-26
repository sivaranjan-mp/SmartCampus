export const ROLES = { STUDENT:'STUDENT', FACULTY:'FACULTY', HOD:'HOD', ADMIN:'ADMIN' };

export const ROLE_LABELS = {
  STUDENT: 'Student',
  FACULTY: 'Faculty',
  HOD:     'Head of Department',
  ADMIN:   'Administrator',
};

export const ROLE_COLORS = {
  STUDENT: 'primary',
  FACULTY: 'secondary',
  HOD:     'warning',
  ADMIN:   'error',
};

export const ROLE_AVATAR_BG = {
  STUDENT: '#1565C0',
  FACULTY: '#00838F',
  HOD:     '#EF6C00',
  ADMIN:   '#B71C1C',
};

export const getDashboardPath = (role) => {
  const paths = { 
    ADMIN: '/admin/dashboard', 
    HOD: '/hod/approvals', 
    FACULTY: '/bookings/my', 
    STUDENT: '/bookings/my' 
  };
  return paths[role] || '/login';
};

export const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Biomedical Engineering',
  'Chemical Engineering',
  'Aeronautical Engineering',
];

export const YEAR_OF_STUDY_OPTIONS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year (Final)' },
];
