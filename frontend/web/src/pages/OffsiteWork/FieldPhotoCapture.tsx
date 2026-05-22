import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, Stack, Alert, CircularProgress, alpha } from '@mui/material';
import { Camera, RefreshCw, SwitchCamera } from 'lucide-react';

export interface FieldPhotoCaptureProps {
  active: boolean;
  userId: string;
  userName: string;
  accentColor?: string;
  onCapture: (dataUrl: string) => void;
  onClear?: () => void;
}

type FacingMode = 'environment' | 'user';

export function FieldPhotoCapture({
  active,
  userId,
  userName,
  accentColor = '#6366f1',
  onCapture,
  onClear,
}: FieldPhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [streamReady, setStreamReady] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (!active) return;
    setError(null);
    setStarting(true);
    stopCamera();

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not available in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        setStreamReady(true);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Camera permission denied or unavailable.';
      setError(message);
      setStreamReady(false);
    } finally {
      setStarting(false);
    }
  }, [active, facingMode, stopCamera]);

  useEffect(() => {
    if (!active) {
      stopCamera();
      setPreviewUrl(null);
      setError(null);
      return;
    }
    if (!previewUrl) {
      startCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart when tool opens or camera flips
  }, [active, facingMode]);

  useEffect(() => {
    if (!active) {
      setPreviewUrl(null);
      setError(null);
    }
  }, [active]);

  const takeSnapshot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamReady) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setPreviewUrl(dataUrl);
    onCapture(dataUrl);
    stopCamera();
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      onCapture(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const retake = () => {
    setPreviewUrl(null);
    onClear?.();
    startCamera();
  };

  const switchCamera = () => {
    onClear?.();
    setPreviewUrl(null);
    setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'));
  };

  if (!active) return null;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b' }}>
          Device camera · logged in as <Box component="span" sx={{ color: '#0f172a', fontWeight: 800 }}>{userName}</Box>
          {userId && userId !== 'unknown' ? ` · ID ${String(userId).slice(0, 8)}` : ''}
        </Typography>
        {streamReady && !previewUrl && (
          <Button size="small" onClick={switchCamera} startIcon={<SwitchCamera size={14} />} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.6875rem' }}>
            Flip
          </Button>
        )}
      </Stack>

      <Box
        sx={{
          position: 'relative',
          aspectRatio: '4/3',
          borderRadius: 2,
          overflow: 'hidden',
          border: `2px solid ${alpha(accentColor, 0.35)}`,
          bgcolor: '#0f172a',
        }}
      >
        {starting && (
          <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0, zIndex: 2, bgcolor: 'rgba(15,23,42,0.85)' }}>
            <CircularProgress size={32} sx={{ color: accentColor }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#e2e8f0', mt: 1, fontWeight: 600 }}>
              Starting camera…
            </Typography>
          </Stack>
        )}

        {previewUrl ? (
          <Box component="img" src={previewUrl} alt="Captured" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box
            component="video"
            ref={videoRef}
            autoPlay
            playsInline
            muted
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: streamReady ? 'block' : 'none' }}
          />
        )}

        {!streamReady && !starting && !previewUrl && (
          <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0, p: 2 }}>
            <Camera size={40} color={accentColor} />
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 1, textAlign: 'center', fontWeight: 600 }}>
              Camera not active
            </Typography>
          </Stack>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Box>

      {error && (
        <Alert
          severity="warning"
          sx={{ borderRadius: 2, fontSize: '0.8125rem' }}
          action={
            <Button color="inherit" size="small" onClick={() => fileInputRef.current?.click()} sx={{ fontWeight: 700 }}>
              Use native camera
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFilePick}
      />

      <Stack direction="row" spacing={1}>
        {previewUrl ? (
          <Button fullWidth variant="outlined" startIcon={<RefreshCw size={16} />} onClick={retake} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Retake
          </Button>
        ) : (
          <>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Camera size={16} />}
              onClick={takeSnapshot}
              disabled={!streamReady || starting}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: accentColor,
                '&:hover': { bgcolor: accentColor, filter: 'brightness(0.92)' },
              }}
            >
              Take snapshot
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              sx={{ textTransform: 'none', fontWeight: 700, minWidth: 120 }}
            >
              Phone camera
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
}
