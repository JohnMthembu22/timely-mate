import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography, Button, Stack, Alert, CircularProgress, alpha } from '@mui/material';
import { Camera, RefreshCw, ScanLine, SwitchCamera } from 'lucide-react';
import jsQR from 'jsqr';

export type FieldScannerMode = 'qr' | 'object';

export interface FieldScanResult {
  data: string;
  format: string;
  imageDataUrl?: string;
}

export interface FieldScannerCaptureProps {
  active: boolean;
  mode: FieldScannerMode;
  userName: string;
  accentColor?: string;
  onScan: (result: FieldScanResult) => void;
}

type FacingMode = 'environment' | 'user';

const OBJECT_FORMATS = [
  'qr_code',
  'code_128',
  'code_39',
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'data_matrix',
] as const;

type BarcodeDetection = { rawValue: string; format: string };

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats: readonly string[] }) => {
      detect: (source: ImageBitmapSource) => Promise<BarcodeDetection[]>;
    };
  }
}

function formatLabel(mode: FieldScannerMode): string {
  return mode === 'qr' ? 'QR code' : 'barcode / QR';
}

export function FieldScannerCapture({
  active,
  mode,
  userName,
  accentColor = '#6366f1',
  onScan,
}: FieldScannerCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastScanRef = useRef<string | null>(null);
  const decodingRef = useRef(false);

  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamReady, setStreamReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [detectorSupported, setDetectorSupported] = useState(false);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current != null) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreamReady(false);
    setScanning(false);
  }, []);

  const getFrameSnapshot = useCallback((): { imageData: ImageData; dataUrl: string } | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return {
      imageData: ctx.getImageData(0, 0, w, h),
      dataUrl: canvas.toDataURL('image/jpeg', 0.85),
    };
  }, []);

  const decodeWithJsQr = useCallback((imageData: ImageData): string | null => {
    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });
    return result?.data ?? null;
  }, []);

  const decodeWithBarcodeDetector = useCallback(
    async (source: ImageBitmapSource): Promise<BarcodeDetection | null> => {
      if (!window.BarcodeDetector) return null;
      try {
        const formats = mode === 'qr' ? ['qr_code'] : [...OBJECT_FORMATS];
        const detector = new window.BarcodeDetector({ formats });
        const codes = await detector.detect(source);
        return codes[0] ?? null;
      } catch {
        return null;
      }
    },
    [mode]
  );

  const commitScan = useCallback(
    (data: string, format: string, imageDataUrl?: string) => {
      if (lastScanRef.current === data) return;
      lastScanRef.current = data;
      stopCamera();
      onScan({ data, format, imageDataUrl });
    },
    [onScan, stopCamera]
  );

  const tryDecodeFrame = useCallback(async () => {
    if (decodingRef.current) return false;
    decodingRef.current = true;
    try {
    const frame = getFrameSnapshot();
    if (!frame) return false;

    const canvas = canvasRef.current;
    if (!canvas) return false;

    const native = await decodeWithBarcodeDetector(canvas);
    if (native?.rawValue) {
      commitScan(native.rawValue, native.format, frame.dataUrl);
      return true;
    }

    const qr = decodeWithJsQr(frame.imageData);
    if (qr) {
      commitScan(qr, mode === 'qr' ? 'qr_code' : 'qr_code', frame.dataUrl);
      return true;
    }

    return false;
    } finally {
      decodingRef.current = false;
    }
  }, [commitScan, decodeWithBarcodeDetector, decodeWithJsQr, getFrameSnapshot, mode]);

  const startCamera = useCallback(async () => {
    if (!active) return;
    setError(null);
    setStarting(true);
    lastScanRef.current = null;
    stopCamera();
    setDetectorSupported(Boolean(window.BarcodeDetector));

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API not available. Use a phone or tablet with a camera.');
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
      setError(null);
      lastScanRef.current = null;
      return;
    }
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, facingMode]);

  useEffect(() => {
    if (!active || !streamReady) return;
    setScanning(true);
    scanIntervalRef.current = setInterval(() => {
      void tryDecodeFrame();
    }, 400);
    return () => {
      if (scanIntervalRef.current != null) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      setScanning(false);
    };
  }, [active, streamReady, tryDecodeFrame]);

  const handleManualCapture = async () => {
    const found = await tryDecodeFrame();
    if (!found) {
      const frame = getFrameSnapshot();
      const prefix = mode === 'qr' ? 'SITE-QR' : 'MAT';
      const fallback = `${prefix}-${Date.now().toString(36).toUpperCase()}`;
      commitScan(
        fallback,
        mode === 'qr' ? 'manual_qr' : 'manual_material',
        frame?.dataUrl
      );
    }
  };

  const decodeFromFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

        const native = await decodeWithBarcodeDetector(canvas);
        if (native?.rawValue) {
          commitScan(native.rawValue, native.format, dataUrl);
          return;
        }
        const qr = decodeWithJsQr(imageData);
        if (qr) {
          commitScan(qr, 'qr_code', dataUrl);
          return;
        }
        const prefix = mode === 'qr' ? 'SITE-QR' : 'MAT';
        commitScan(`${prefix}-IMG-${Date.now().toString(36).toUpperCase()}`, 'image_capture', dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) decodeFromFile(file);
    e.target.value = '';
  };

  const switchCamera = () => {
    setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'));
  };

  if (!active) return null;

  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b' }}>
        {formatLabel(mode)} scanner ·{' '}
        <Box component="span" sx={{ color: '#0f172a', fontWeight: 800 }}>
          {userName}
        </Box>
        {streamReady && (
          <Box component="span" sx={{ color: accentColor, ml: 0.5 }}>
            · camera live
          </Box>
        )}
      </Typography>

      <Box
        sx={{
          position: 'relative',
          aspectRatio: '4/3',
          borderRadius: 2,
          overflow: 'hidden',
          border: `2px solid ${alpha(accentColor, 0.4)}`,
          bgcolor: '#0f172a',
        }}
      >
        {starting && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ position: 'absolute', inset: 0, zIndex: 2, bgcolor: 'rgba(15,23,42,0.85)' }}
          >
            <CircularProgress size={32} sx={{ color: accentColor }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#e2e8f0', mt: 1, fontWeight: 600 }}>
              Starting camera…
            </Typography>
          </Stack>
        )}

        <Box
          component="video"
          ref={videoRef}
          autoPlay
          playsInline
          muted
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: streamReady ? 'block' : 'none' }}
        />

        {!streamReady && !starting && (
          <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0, p: 2 }}>
            <ScanLine size={40} color={accentColor} />
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 1, textAlign: 'center', fontWeight: 600 }}>
              Point your phone at the {formatLabel(mode)}
            </Typography>
          </Stack>
        )}

        {streamReady && (
          <>
            <Box
              sx={{
                position: 'absolute',
                inset: '12%',
                border: `2px dashed ${alpha(accentColor, 0.7)}`,
                borderRadius: 2,
                pointerEvents: 'none',
              }}
            />
            {scanning && (
              <Box
                sx={{
                  position: 'absolute',
                  left: '12%',
                  right: '12%',
                  height: 2,
                  bgcolor: accentColor,
                  boxShadow: `0 0 12px ${accentColor}`,
                  animation: 'fieldScanLine 2s ease-in-out infinite',
                  '@keyframes fieldScanLine': {
                    '0%, 100%': { top: '12%' },
                    '50%': { top: '88%' },
                  },
                }}
              />
            )}
          </>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Box>

      <Typography sx={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>
        {mode === 'qr'
          ? 'Align the QR code inside the frame — it will log automatically when detected.'
          : 'Align material labels, barcodes, or QR tags — auto-detect when in focus.'}
        {detectorSupported ? ' Native scanner enabled.' : ' Using camera + JS decode.'}
      </Typography>

      {error && (
        <Alert
          severity="warning"
          sx={{ borderRadius: 2, fontSize: '0.8125rem' }}
          action={
            <Button color="inherit" size="small" onClick={() => fileInputRef.current?.click()} sx={{ fontWeight: 700 }}>
              Use phone camera
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
        <Button
          fullWidth
          variant="contained"
          startIcon={<ScanLine size={16} />}
          onClick={handleManualCapture}
          disabled={!streamReady || starting}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            bgcolor: accentColor,
            '&:hover': { bgcolor: accentColor, filter: 'brightness(0.92)' },
          }}
        >
          Scan now
        </Button>
        <Button
          variant="outlined"
          onClick={switchCamera}
          disabled={!streamReady}
          startIcon={<SwitchCamera size={16} />}
          sx={{ textTransform: 'none', fontWeight: 700, minWidth: 100 }}
        >
          Flip
        </Button>
        <Button
          variant="outlined"
          onClick={() => fileInputRef.current?.click()}
          sx={{ textTransform: 'none', fontWeight: 700, minWidth: 100 }}
        >
          Native
        </Button>
      </Stack>

      <Button
        size="small"
        startIcon={<RefreshCw size={14} />}
        onClick={startCamera}
        disabled={starting}
        sx={{ textTransform: 'none', fontWeight: 700, alignSelf: 'center' }}
      >
        Restart camera
      </Button>
    </Stack>
  );
}
