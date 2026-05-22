import React, { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import { AddPhotoAlternate, Close, PhotoCamera } from '@mui/icons-material';
import {
  MAX_INCIDENT_PHOTOS,
  filesToIncidentPhotos,
  type IncidentPhotoAttachment,
} from '../incidentReportPhotos';

export interface IncidentPhotoAttachmentsProps {
  photos: IncidentPhotoAttachment[];
  onChange: (photos: IncidentPhotoAttachment[]) => void;
}

export function IncidentPhotoAttachments({ photos, onChange }: IncidentPhotoAttachmentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ severity: 'info' | 'warning'; text: string } | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setProcessing(true);
    setMessage(null);
    const result = await filesToIncidentPhotos(files, photos);
    onChange(result.photos);
    if (result.error) {
      setMessage({ severity: 'warning', text: result.error });
    }
    setProcessing(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
    setMessage(null);
  };

  const atLimit = photos.length >= MAX_INCIDENT_PHOTOS;

  return (
    <Stack spacing={1.5}>
      <Box
        onClick={() => !atLimit && !processing && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!atLimit && !processing) void handleFiles(e.dataTransfer.files);
        }}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '2px dashed',
          borderColor: atLimit ? '#e2e8f0' : '#cbd5e1',
          bgcolor: atLimit ? '#f8fafc' : '#fff',
          cursor: atLimit || processing ? 'default' : 'pointer',
          textAlign: 'center',
          transition: 'border-color 150ms ease, background-color 150ms ease',
          ...(!atLimit &&
            !processing && {
              '&:hover': { borderColor: '#6366f1', bgcolor: alpha('#6366f1', 0.04) },
            }),
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => void handleFiles(e.target.files)}
        />
        {processing ? (
          <Stack alignItems="center" spacing={1}>
            <CircularProgress size={28} />
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>Processing photos…</Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={0.75}>
            <PhotoCamera sx={{ fontSize: 32, color: atLimit ? '#cbd5e1' : '#6366f1' }} />
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
              {atLimit ? `Maximum ${MAX_INCIDENT_PHOTOS} photos attached` : 'Add incident photos'}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              Tap to browse or drag images here · JPG, PNG, HEIC (compressed on upload)
            </Typography>
            {!atLimit ? (
              <Button
                size="small"
                startIcon={<AddPhotoAlternate />}
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                sx={{ mt: 0.5, textTransform: 'none', fontWeight: 700 }}
              >
                Choose files
              </Button>
            ) : null}
          </Stack>
        )}
      </Box>

      {message ? (
        <Alert severity={message.severity} sx={{ borderRadius: 2, py: 0 }}>
          {message.text}
        </Alert>
      ) : null}

      {photos.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
            gap: 1,
          }}
        >
          {photos.map((photo) => (
            <Box
              key={photo.id}
              sx={{
                position: 'relative',
                borderRadius: 1.5,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                aspectRatio: '1',
                bgcolor: '#f1f5f9',
              }}
            >
              <Box
                component="img"
                src={photo.dataUrl}
                alt={photo.name}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <IconButton
                size="small"
                aria-label={`Remove ${photo.name}`}
                onClick={() => removePhoto(photo.id)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  bgcolor: alpha('#0f172a', 0.65),
                  color: '#fff',
                  p: 0.25,
                  '&:hover': { bgcolor: alpha('#0f172a', 0.85) },
                }}
              >
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      ) : null}

      <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
        {photos.length}/{MAX_INCIDENT_PHOTOS} photos · Stored with this report for your line manager
      </Typography>
    </Stack>
  );
}

export function IncidentPhotoGallery({ photos }: { photos: IncidentPhotoAttachment[] }) {
  if (photos.length === 0) return null;

  return (
    <Box>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', mb: 1 }}>
        ATTACHED PHOTOS ({photos.length})
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
          gap: 1,
        }}
      >
        {photos.map((photo) => (
          <Box
            key={photo.id}
            component="a"
            href={photo.dataUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              display: 'block',
              textDecoration: 'none',
              '&:hover': { borderColor: '#6366f1', boxShadow: `0 4px 12px ${alpha('#6366f1', 0.2)}` },
            }}
          >
            <Box
              component="img"
              src={photo.dataUrl}
              alt={photo.name}
              sx={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
            />
            <Typography
              noWrap
              sx={{ px: 1, py: 0.5, fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', bgcolor: '#f8fafc' }}
            >
              {photo.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
