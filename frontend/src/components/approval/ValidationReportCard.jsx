import {
  Box, Chip, CircularProgress, Collapse, Divider,
  IconButton, Paper, Tooltip, Typography,
} from '@mui/material';
import {
  AccessTimeOutlined, BuildOutlined, CalendarMonthOutlined,
  CheckCircleRounded, ErrorRounded, ExpandMoreRounded,
  InfoOutlined, PeopleAltOutlined, PriorityHighRounded,
  ScheduleOutlined, TableChartOutlined, WarningAmberRounded,
} from '@mui/icons-material';
import { useState } from 'react';
import { VALIDATION_RULE_LABELS } from '../../utils/approvalConstants';

const RULE_ICONS = {
  THREE_DAY_ADVANCE:  <CalendarMonthOutlined sx={{ fontSize: 18 }} />,
  BUFFER_DAY:         <ScheduleOutlined      sx={{ fontSize: 18 }} />,
  RESOURCE_CONFLICT:  <ErrorRounded          sx={{ fontSize: 18 }} />,
  CAPACITY_CHECK:     <PeopleAltOutlined     sx={{ fontSize: 18 }} />,
  MAINTENANCE_CHECK:  <BuildOutlined         sx={{ fontSize: 18 }} />,
  TIMETABLE_CLASH:    <TableChartOutlined    sx={{ fontSize: 18 }} />,
  PRIORITY_CONFLICT:  <PriorityHighRounded   sx={{ fontSize: 18 }} />,
  ADVANCE_WINDOW:     <CalendarMonthOutlined sx={{ fontSize: 18 }} />,
  AVAILABILITY_TIME:  <AccessTimeOutlined    sx={{ fontSize: 18 }} />,
};

function RuleRow({ result, index }) {
  const [expanded, setExpanded] = useState(false);

  const isPassed  = result.passed;
  const isWarning = !result.passed && !result.mandatory;
  const isFailed  = !result.passed && result.mandatory;

  const statusColor = isFailed  ? '#C62828'
                    : isWarning ? '#F57C00'
                    : '#2E7D32';

  const statusBg = isFailed  ? '#FFF5F5'
                 : isWarning ? '#FFF8E1'
                 : '#F1F8E9';

  const StatusIcon = isFailed  ? <ErrorRounded          sx={{ fontSize: 20, color: statusColor }} />
                   : isWarning ? <WarningAmberRounded    sx={{ fontSize: 20, color: statusColor }} />
                   : <CheckCircleRounded sx={{ fontSize: 20, color: statusColor }} />;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5,
          bgcolor: isPassed ? 'transparent' : statusBg,
          cursor: result.suggestion || result.message ? 'pointer' : 'default',
          '&:hover': { bgcolor: isPassed ? '#F8FAFF' : statusBg },
          transition: 'background 0.15s',
        }}
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Rule icon */}
        <Box sx={{ color: statusColor, flexShrink: 0, display: 'flex' }}>
          {RULE_ICONS[result.rule] || <InfoOutlined sx={{ fontSize: 18 }} />}
        </Box>

        {/* Label */}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, color: 'text.primary' }}>
          {VALIDATION_RULE_LABELS[result.rule] || result.label}
        </Typography>

        {/* Status chip */}
        <Chip
          label={isFailed ? 'Failed' : isWarning ? 'Warning' : 'Passed'}
          size="small"
          sx={{
            height: 20, fontSize: '0.68rem', fontWeight: 700,
            bgcolor: `${statusColor}20`, color: statusColor, border: 'none',
            flexShrink: 0,
          }}
        />

        {/* Mandatory badge */}
        {isFailed && (
          <Chip label="Blocking" size="small"
            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: '#FFCDD2', color: '#C62828', border: 'none', ml: 0.5 }} />
        )}

        {/* Status icon */}
        <Box sx={{ flexShrink: 0, display: 'flex' }}>{StatusIcon}</Box>

        {/* Expand */}
        {(result.message || result.suggestion) && (
          <IconButton size="small" sx={{ flexShrink: 0 }}>
            <ExpandMoreRounded sx={{ fontSize: 18, color: 'text.secondary',
              transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </IconButton>
        )}
      </Box>

      {/* Expanded detail */}
      <Collapse in={expanded}>
        <Box sx={{ px: 3, pb: 1.5, pt: 0.5, bgcolor: statusBg, borderTop: '1px dashed', borderColor: `${statusColor}40` }}>
          {result.message && (
            <Typography variant="caption" sx={{ color: 'text.primary', display: 'block', lineHeight: 1.6, mb: 0.5 }}>
              {result.message}
            </Typography>
          )}
          {result.suggestion && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mt: 0.75 }}>
              <InfoOutlined sx={{ fontSize: 14, color: '#1565C0', mt: 0.1, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: '#1565C0', fontWeight: 600, lineHeight: 1.5 }}>
                {result.suggestion}
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function ValidationReportCard({ report, loading }) {
  if (loading) {
    return (
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 3, textAlign: 'center' }}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Running validation checks…
        </Typography>
      </Paper>
    );
  }

  if (!report) return null;

  const failCount  = report.results?.filter((r) => !r.passed && r.mandatory).length  ?? 0;
  const warnCount  = report.results?.filter((r) => !r.passed && !r.mandatory).length ?? 0;
  const passCount  = report.results?.filter((r) =>  r.passed).length ?? 0;

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: report.passed ? 'success.main' : 'error.main', borderRadius: 2, overflow: 'hidden' }}>
      {/* Summary header */}
      <Box
        sx={{
          px: 2.5, py: 2,
          bgcolor: report.passed ? '#E8F5E9' : '#FFF5F5',
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}
      >
        {report.passed
          ? <CheckCircleRounded sx={{ color: 'success.main', fontSize: 24 }} />
          : <ErrorRounded       sx={{ color: 'error.main',   fontSize: 24 }} />}

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: report.passed ? 'success.dark' : 'error.dark' }}>
            {report.passed ? 'All Checks Passed' : `${failCount} Blocking Check${failCount !== 1 ? 's' : ''} Failed`}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {report.summary}
          </Typography>
        </Box>

        {/* Counters */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {failCount > 0 && (
            <Chip label={`${failCount} Failed`} size="small" color="error"
              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }} />
          )}
          {warnCount > 0 && (
            <Chip label={`${warnCount} Warn`} size="small" color="warning"
              sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }} />
          )}
          <Chip label={`${passCount} Passed`} size="small" color="success" variant="outlined"
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }} />
        </Box>
      </Box>

      {/* Rule results */}
      <Box>
        {report.results?.map((result, i) => (
          <Box key={result.rule || i}>
            {i > 0 && <Divider />}
            <RuleRow result={result} index={i} />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
