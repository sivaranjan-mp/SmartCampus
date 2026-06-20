// ─── Category ────────────────────────────────────────────────────────────────

export const RESOURCE_CATEGORIES = [
  'LAB', 'CLASSROOM', 'SEMINAR_HALL', 'CONFERENCE_ROOM',
  'EQUIPMENT', 'PROJECTOR', 'SPORTS_FACILITY', 'AUDITORIUM',
  'LIBRARY', 'WORKSHOP', 'OTHER',
];

export const CATEGORY_LABELS = {
  LAB:             'Laboratory',
  CLASSROOM:       'Classroom',
  SEMINAR_HALL:    'Seminar Hall',
  CONFERENCE_ROOM: 'Conference Room',
  EQUIPMENT:       'Equipment',
  PROJECTOR:       'Projector',
  SPORTS_FACILITY: 'Sports Facility',
  AUDITORIUM:      'Auditorium',
  LIBRARY:         'Library',
  WORKSHOP:        'Workshop',
  OTHER:           'Other',
};

export const CATEGORY_COLORS = {
  LAB:             { bg: '#E3F2FD', text: '#1565C0', chip: 'primary' },
  CLASSROOM:       { bg: '#E8F5E9', text: '#2E7D32', chip: 'success' },
  SEMINAR_HALL:    { bg: '#F3E5F5', text: '#6A1B9A', chip: 'secondary' },
  CONFERENCE_ROOM: { bg: '#E0F7FA', text: '#006064', chip: 'info' },
  EQUIPMENT:       { bg: '#FFF3E0', text: '#E65100', chip: 'warning' },
  PROJECTOR:       { bg: '#FFF8E1', text: '#F57F17', chip: 'warning' },
  SPORTS_FACILITY: { bg: '#E8F5E9', text: '#1B5E20', chip: 'success' },
  AUDITORIUM:      { bg: '#FCE4EC', text: '#880E4F', chip: 'error' },
  LIBRARY:         { bg: '#E8EAF6', text: '#283593', chip: 'secondary' },
  WORKSHOP:        { bg: '#FBE9E7', text: '#BF360C', chip: 'error' },
  OTHER:           { bg: '#F5F5F5', text: '#424242', chip: 'default' },
};

// ─── Scope ────────────────────────────────────────────────────────────────────

export const SCOPE_LABELS = {
  COMMON:     'Common (Shared)',
  DEPARTMENT: 'Department',
};

export const SCOPE_COLORS = {
  COMMON:     { bg: '#E8F5E9', text: '#2E7D32' },
  DEPARTMENT: { bg: '#E3F2FD', text: '#1565C0' },
};

// ─── Approval Authority ───────────────────────────────────────────────────────

export const APPROVAL_LABELS = {
  HOD:   'HOD Approval',
  ADMIN: 'Admin Approval',
  AUTO:  'Auto-Approved',
};

export const APPROVAL_COLORS = {
  HOD:   { bg: '#FFF3E0', text: '#E65100', chip: 'warning' },
  ADMIN: { bg: '#FCE4EC', text: '#880E4F', chip: 'error' },
  AUTO:  { bg: '#E8F5E9', text: '#2E7D32', chip: 'success' },
};

// ─── Days ─────────────────────────────────────────────────────────────────────

export const DAY_OPTIONS = [
  { value: 'MON', label: 'Mon' },
  { value: 'TUE', label: 'Tue' },
  { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' },
  { value: 'FRI', label: 'Fri' },
  { value: 'SAT', label: 'Sat' },
  { value: 'SUN', label: 'Sun' },
];

export const DEFAULT_AVAILABLE_DAYS = 'MON,TUE,WED,THU,FRI';

// ─── Sort options ─────────────────────────────────────────────────────────────

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date Added' },
  { value: 'name',      label: 'Name' },
  { value: 'category',  label: 'Category' },
  { value: 'capacity',  label: 'Capacity' },
];
