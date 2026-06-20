export const APPROVAL_STATUS_LABELS = {
  PENDING:            'Pending',
  APPROVED:           'Approved',
  REJECTED:           'Rejected',
  REVISION_REQUESTED: 'Revision Requested',
};

export const APPROVAL_STATUS_COLORS = {
  PENDING:            { bg: '#FFF3E0', text: '#E65100',  chip: 'warning' },
  APPROVED:           { bg: '#E8F5E9', text: '#2E7D32',  chip: 'success' },
  REJECTED:           { bg: '#FFCDD2', text: '#C62828',  chip: 'error'   },
  REVISION_REQUESTED: { bg: '#E3F2FD', text: '#1565C0',  chip: 'info'    },
};

export const VALIDATION_RULE_LABELS = {
  THREE_DAY_ADVANCE:  '3-Day Advance Rule',
  BUFFER_DAY:         'Buffer Day Rule',
  RESOURCE_CONFLICT:  'Resource Conflict',
  CAPACITY_CHECK:     'Capacity Check',
  MAINTENANCE_CHECK:  'Maintenance Check',
  TIMETABLE_CLASH:    'Timetable Clash',
  PRIORITY_CONFLICT:  'Priority Conflict',
  ADVANCE_WINDOW:     'Advance Booking Window',
  AVAILABILITY_TIME:  'Availability Hours',
};

export const VALIDATION_RULE_ICONS = {
  THREE_DAY_ADVANCE:  'CalendarMonthOutlined',
  BUFFER_DAY:         'ScheduleOutlined',
  RESOURCE_CONFLICT:  'ErrorOutlineRounded',
  CAPACITY_CHECK:     'PeopleAltOutlined',
  MAINTENANCE_CHECK:  'BuildOutlined',
  TIMETABLE_CLASH:    'TableChartOutlined',
  PRIORITY_CONFLICT:  'PriorityHighRounded',
  ADVANCE_WINDOW:     'EventAvailableOutlined',
  AVAILABILITY_TIME:  'AccessTimeOutlined',
};

export const DECISION_OPTIONS = [
  { value: 'APPROVE',          label: 'Approve',          color: 'success', description: 'Confirm the booking request' },
  { value: 'REJECT',           label: 'Reject',           color: 'error',   description: 'Deny the booking request with reason' },
  { value: 'REQUEST_REVISION', label: 'Request Revision', color: 'info',    description: 'Ask the organizer to revise and resubmit' },
];

export const PRIORITY_COLORS = {
  HIGH:   { bg: '#FCE4EC', text: '#880E4F' },
  NORMAL: { bg: '#E3F2FD', text: '#1565C0' },
};
