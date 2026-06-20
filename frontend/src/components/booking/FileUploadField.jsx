import {
  Box, Button, CircularProgress, IconButton, LinearProgress,
  Typography,
} from '@mui/material';
import {
  AttachFileRounded, CheckCircleRounded, CloudUploadRounded,
  DeleteOutlineRounded, InsertDriveFileOutlined,
} from '@mui/icons-material';
import { useRef, useState } from 'react';
import { bookingApi } from '../../api/bookingApi';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB } from '../../utils/bookingConstants';

function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)         return bytes + ' B';
  if (bytes < 1024 * 1024)  return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export default function FileUploadField({
  label, required = false, fileId, fileName, onUploadComplete, onRemove,
  accept = ACCEPTED_FILE_TYPES, error, helperText,
}) {
  const inputRef = useRef(null);
  const [uploading,   setUploading]   = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [dragOver,    setDragOver]    = useState(false);

  const isUploaded = Boolean(fileId);

  const handleFile = async (file) => {
    if (!file) return;
    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File must be under ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setUploadError('');
    setUploading(true);
    setProgress(0);

    try {
      const { data } = await bookingApi.uploadDocument(file, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
      });
      if (data.success) {
        onUploadComplete(data.data.fileId, data.data.originalFileName);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {label}
        </Typography>
        {required && (
          <Typography component="span" sx={{ color: 'error.main', fontWeight: 700 }}>*</Typography>
        )}
      </Box>

      {/* Uploaded state */}
      {isUploaded ? (
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
            border: '2px solid', borderColor: 'success.main',
            borderRadius: 2, bgcolor: '#F1F8E9',
          }}
        >
          <CheckCircleRounded sx={{ color: 'success.main', fontSize: 28, flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileName || fileId}
            </Typography>
            <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
              Uploaded successfully
            </Typography>
          </Box>
          <IconButton size="small" onClick={onRemove} sx={{ color: 'error.main', flexShrink: 0 }}>
            <DeleteOutlineRounded fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        /* Drop zone */
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: error ? 'error.main' : dragOver ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            cursor: uploading ? 'default' : 'pointer',
            bgcolor: dragOver ? '#EFF4FF' : error ? '#FFF5F5' : '#F8FAFF',
            transition: 'all 0.2s',
            '&:hover': uploading ? {} : {
              borderColor: 'primary.main',
              bgcolor: '#EFF4FF',
            },
          }}
        >
          {uploading ? (
            <Box>
              <CircularProgress size={32} sx={{ mb: 1 }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                Uploading… {progress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ borderRadius: 2, height: 6, maxWidth: 200, mx: 'auto' }}
              />
            </Box>
          ) : (
            <Box>
              <CloudUploadRounded sx={{ fontSize: 36, color: error ? 'error.light' : 'primary.light', mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                Click to upload or drag & drop
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                PDF, JPG, PNG, WEBP, DOC, DOCX — max {MAX_FILE_SIZE_MB} MB
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Error messages */}
      {(error || uploadError) && (
        <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5 }}>
          {uploadError || helperText}
        </Typography>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files?.[0])}
        onClick={(e) => (e.target.value = '')}
      />
    </Box>
  );
}
