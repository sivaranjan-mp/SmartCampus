import {
  Box, Button, IconButton, TextField, Typography, Chip,
} from '@mui/material';
import { AddRounded, DeleteOutlineRounded, DragIndicatorRounded } from '@mui/icons-material';

export default function DynamicListField({
  label, items, onChange, min = 3, max = 5,
  placeholder = 'Enter description…', helperText, error,
}) {
  const handleChange = (index, value) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const handleAdd = () => {
    if (items.length < max) onChange([...items, '']);
  };

  const handleRemove = (index) => {
    if (items.length <= min) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const canAdd    = items.length < max;
  const canRemove = items.length > min;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {label}
          </Typography>
          <Chip
            label={`${items.length} / ${max}`}
            size="small"
            color={items.length >= min ? 'success' : 'warning'}
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
          />
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {min}–{max} required
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {items.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box
              sx={{
                width: 28, height: 40, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 24, height: 24, borderRadius: '50%',
                  bgcolor: 'primary.main', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: 'white', fontSize: '0.7rem', fontWeight: 700 }}>
                  {index + 1}
                </Typography>
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={3}
              size="small"
              value={item}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`${placeholder} (${index + 1})`}
              error={error && !item.trim()}
              helperText={error && !item.trim() ? 'This field is required' : ''}
              inputProps={{ maxLength: 500 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.875rem',
                },
              }}
            />

            <IconButton
              size="small"
              onClick={() => handleRemove(index)}
              disabled={!canRemove}
              sx={{
                mt: 0.5, flexShrink: 0,
                color: canRemove ? 'error.main' : 'text.disabled',
                '&:hover': canRemove ? { bgcolor: '#FFF5F5' } : {},
              }}
            >
              <DeleteOutlineRounded fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>

      {error && (
        <Typography variant="caption" sx={{ color: 'error.main', mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      <Box sx={{ mt: 1.5 }}>
        <Button
          size="small"
          startIcon={<AddRounded />}
          onClick={handleAdd}
          disabled={!canAdd}
          variant="outlined"
          sx={{
            borderStyle: 'dashed', borderRadius: 2,
            color: canAdd ? 'primary.main' : 'text.disabled',
            borderColor: canAdd ? 'primary.light' : 'divider',
            fontSize: '0.78rem',
          }}
        >
          Add {label.split(' ')[0]} {canAdd ? `(${max - items.length} remaining)` : '(Max reached)'}
        </Button>
      </Box>
    </Box>
  );
}
