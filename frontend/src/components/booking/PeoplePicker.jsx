import {
  Avatar, Box, Button, Chip, CircularProgress, Collapse, Divider,
  FormControl, Grid, IconButton, InputLabel, MenuItem, Paper,
  Select, TextField, Typography,
} from '@mui/material';
import {
  AddRounded, CloseRounded, PersonAddAltRounded, PersonSearchRounded,
} from '@mui/icons-material';
import { useEffect, useRef, useState } from 'react';
import useDebounce from '../../hooks/useDebounce';
import { bookingApi } from '../../api/bookingApi';

const YEAR_OPTIONS = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];

// ─── Empty person template ─────────────────────────────────────────────────────
const emptyPerson = (mode) => ({
  userId:         null,
  name:           '',
  email:          '',
  department:     '',
  phoneNumber:    '',
  ...(mode === 'coordinator' ? { registerNumber: '', yearOfStudy: '' } : {}),
});

// ─── Single person card ────────────────────────────────────────────────────────
function PersonCard({ person, index, onRemove, mode, canRemove, errors = {} }) {
  const initials = person.name
    ? person.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2,
        position: 'relative', bgcolor: person.userId ? '#F8FAFF' : '#FAFAFA',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Avatar
          sx={{
            width: 36, height: 36, fontSize: '0.8rem', fontWeight: 700,
            bgcolor: mode === 'coordinator' ? '#1565C0' : '#2E7D32',
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {person.name || `${mode === 'coordinator' ? 'Coordinator' : 'Faculty'} ${index + 1}`}
          </Typography>
          {person.userId && (
            <Chip label="Registered User" size="small" color="success"
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
          )}
        </Box>
        {canRemove && (
          <IconButton size="small" onClick={() => onRemove(index)}
            sx={{ color: 'error.main', '&:hover': { bgcolor: '#FFF5F5' } }}>
            <CloseRounded fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Email</Typography>
          <Typography variant="body2" sx={{ color: person.email ? 'text.primary' : 'text.disabled' }}>
            {person.email || '—'}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Department</Typography>
          <Typography variant="body2" sx={{ color: person.department ? 'text.primary' : 'text.disabled' }}>
            {person.department || '—'}
          </Typography>
        </Grid>
        {mode === 'coordinator' && person.registerNumber && (
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Register No.</Typography>
            <Typography variant="body2">{person.registerNumber}</Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}

// ─── Add person form ───────────────────────────────────────────────────────────
function AddPersonForm({ mode, onAdd, onCancel }) {
  const [tab,       setTab]       = useState('search'); // 'search' | 'manual'
  const [searchQ,   setSearchQ]   = useState('');
  const [results,   setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [manual,    setManual]    = useState(emptyPerson(mode));
  const [errors,    setErrors]    = useState({});

  const debouncedQ = useDebounce(searchQ, 400);

  useEffect(() => {
    if (!debouncedQ.trim() || tab !== 'search') { setResults([]); return; }
    setSearching(true);
    const fn = mode === 'faculty' ? bookingApi.searchFaculty : bookingApi.searchUsers;
    fn(debouncedQ)
      .then(({ data }) => { if (data.success) setResults(data.data.content || []); })
      .catch(() => {})
      .finally(() => setSearching(false));
  }, [debouncedQ, mode, tab]);

  const handleSelectUser = (user) => {
    onAdd({
      userId:         user.id,
      name:           user.fullName,
      email:          user.email,
      department:     user.departmentName || '',
      phoneNumber:    user.phoneNumber || '',
      ...(mode === 'coordinator' ? {
        registerNumber: user.registerNumber || '',
        yearOfStudy:    user.yearOfStudy || '',
      } : {}),
    });
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManual((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validateManual = () => {
    const errs = {};
    if (!manual.name.trim())  errs.name  = 'Required';
    if (!manual.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manual.email))
      errs.email = 'Valid email required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleManualAdd = () => {
    if (validateManual()) onAdd({ ...manual, userId: null });
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'primary.light', borderRadius: 2, p: 2, bgcolor: '#F8FAFF' }}>
      {/* Tab bar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {[
          { key: 'search', label: 'Search Users', icon: <PersonSearchRounded sx={{ fontSize: 16 }} /> },
          { key: 'manual', label: 'Add Manually', icon: <PersonAddAltRounded sx={{ fontSize: 16 }} /> },
        ].map((t) => (
          <Button
            key={t.key} size="small" startIcon={t.icon}
            variant={tab === t.key ? 'contained' : 'outlined'}
            onClick={() => setTab(t.key)}
            sx={{ borderRadius: 2, fontSize: '0.78rem' }}
          >
            {t.label}
          </Button>
        ))}
      </Box>

      {/* Search tab */}
      {tab === 'search' && (
        <Box>
          <TextField
            fullWidth size="small" value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder={`Search ${mode === 'faculty' ? 'faculty' : 'students'} by name or email…`}
            InputProps={{
              endAdornment: searching && <CircularProgress size={14} sx={{ mr: 1 }} />,
            }}
            sx={{ mb: 1.5 }}
          />
          {results.length > 0 && (
            <Box sx={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {results.map((user) => (
                <Box
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25,
                    borderRadius: 1.5, cursor: 'pointer', border: '1px solid transparent',
                    '&:hover': { bgcolor: '#EFF4FF', borderColor: 'primary.light' },
                    transition: 'all 0.15s',
                  }}
                >
                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#1565C0', fontSize: '0.75rem', fontWeight: 700 }}>
                    {user.fullName?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{user.fullName}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user.email}</Typography>
                  </Box>
                  {user.registerNumber && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', flexShrink: 0 }}>
                      {user.registerNumber}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
          {searchQ && !searching && results.length === 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', py: 1 }}>
              No users found. Try adding manually.
            </Typography>
          )}
        </Box>
      )}

      {/* Manual tab */}
      {tab === 'manual' && (
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth required size="small" label="Full Name" name="name"
              value={manual.name} onChange={handleManualChange}
              error={!!errors.name} helperText={errors.name} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth required size="small" label="Email" name="email" type="email"
              value={manual.email} onChange={handleManualChange}
              error={!!errors.email} helperText={errors.email} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Department" name="department"
              value={manual.department} onChange={handleManualChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth size="small" label="Phone (Optional)" name="phoneNumber"
              value={manual.phoneNumber} onChange={handleManualChange} inputProps={{ maxLength: 10 }} />
          </Grid>
          {mode === 'coordinator' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth size="small" label="Register Number" name="registerNumber"
                  value={manual.registerNumber} onChange={handleManualChange}
                  inputProps={{ style: { textTransform: 'uppercase' } }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Year of Study</InputLabel>
                  <Select name="yearOfStudy" value={manual.yearOfStudy}
                    label="Year of Study" onChange={handleManualChange}>
                    {YEAR_OPTIONS.map((y) => <MenuItem key={y.value} value={y.value}>{y.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <Button variant="contained" size="small" onClick={handleManualAdd} sx={{ mr: 1 }}>
              Add Person
            </Button>
            <Button variant="outlined" size="small" onClick={onCancel}>Cancel</Button>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
}

// ─── Main PeoplePicker ─────────────────────────────────────────────────────────
export default function PeoplePicker({ label, people, onChange, min, max, mode, error, helperText }) {
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (person) => {
    onChange([...people, person]);
    setShowForm(false);
  };

  const handleRemove = (index) => {
    onChange(people.filter((_, i) => i !== index));
  };

  const canAdd    = people.length < max;
  const canRemove = people.length > min;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{label}</Typography>
          <Chip
            label={`${people.length} / ${max}`}
            size="small"
            color={people.length >= min ? 'success' : 'warning'}
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {min}–{max} {mode === 'coordinator' ? 'coordinators' : 'faculty'}
        </Typography>
      </Box>

      {/* Existing people */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.5 }}>
        {people.map((person, index) => (
          <PersonCard
            key={index} person={person} index={index}
            onRemove={handleRemove} mode={mode} canRemove={canRemove}
          />
        ))}
      </Box>

      {/* Error message */}
      {error && (
        <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 1 }}>
          {helperText}
        </Typography>
      )}

      {/* Add form */}
      {showForm && (
        <Box sx={{ mb: 1.5 }}>
          <AddPersonForm mode={mode} onAdd={handleAdd} onCancel={() => setShowForm(false)} />
        </Box>
      )}

      {/* Add button */}
      {canAdd && !showForm && (
        <Button
          size="small" startIcon={<AddRounded />} onClick={() => setShowForm(true)}
          variant="outlined"
          sx={{
            borderStyle: 'dashed', borderRadius: 2,
            color: 'primary.main', borderColor: 'primary.light',
            fontSize: '0.78rem',
          }}
        >
          Add {mode === 'coordinator' ? 'Coordinator' : 'Faculty'}{' '}
          ({max - people.length} more allowed)
        </Button>
      )}
    </Box>
  );
}
