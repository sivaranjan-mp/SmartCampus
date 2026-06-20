export const EVENT_DOMAINS = [
  { value: 'TECHNICAL',     label: 'Technical' },
  { value: 'CULTURAL',      label: 'Cultural' },
  { value: 'SPORTS',        label: 'Sports' },
  { value: 'ACADEMIC',      label: 'Academic' },
  { value: 'WORKSHOP',      label: 'Workshop' },
  { value: 'SEMINAR',       label: 'Seminar' },
  { value: 'HACKATHON',     label: 'Hackathon' },
  { value: 'COMPETITION',   label: 'Competition' },
  { value: 'EXHIBITION',    label: 'Exhibition' },
  { value: 'GUEST_LECTURE', label: 'Guest Lecture' },
  { value: 'INDUSTRY_VISIT',label: 'Industry Visit' },
  { value: 'OTHER',         label: 'Other' },
];

export const BOOKING_STATUS_LABELS = {
  DRAFT:         'Draft',
  PENDING:       'Pending',
  PENDING_HOD:   'Pending HOD',
  PENDING_ADMIN: 'Pending Admin',
  APPROVED:      'Approved',
  REJECTED:      'Rejected',
  CANCELLED:     'Cancelled',
  COMPLETED:     'Completed',
  NO_SHOW:       'No Show',
};

export const BOOKING_STATUS_COLORS = {
  DRAFT:         { bg: '#F5F5F5', text: '#616161',  chip: 'default'  },
  PENDING:       { bg: '#FFF3E0', text: '#E65100',  chip: 'warning'  },
  PENDING_HOD:   { bg: '#FFF3E0', text: '#E65100',  chip: 'warning'  },
  PENDING_ADMIN: { bg: '#FFF3E0', text: '#E65100',  chip: 'warning'  },
  APPROVED:      { bg: '#E8F5E9', text: '#2E7D32',  chip: 'success'  },
  REJECTED:      { bg: '#FFCDD2', text: '#C62828',  chip: 'error'    },
  CANCELLED:     { bg: '#EEEEEE', text: '#616161',  chip: 'default'  },
  COMPLETED:     { bg: '#E3F2FD', text: '#1565C0',  chip: 'primary'  },
  NO_SHOW:       { bg: '#FCE4EC', text: '#880E4F',  chip: 'error'    },
};

export const BOOKING_STEPS = [
  'Resource & Schedule',
  'Event Details',
  'Team',
  'Documents & Review',
];

export const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png,.webp,.doc,.docx';
export const MAX_FILE_SIZE_MB    = 10;
