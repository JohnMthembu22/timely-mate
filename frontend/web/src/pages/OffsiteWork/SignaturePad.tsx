import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Stack, alpha } from '@mui/material';
import { Eraser, PenLine } from 'lucide-react';

export interface SignaturePadProps {
  accentColor?: string;
  onChange: (dataUrl: string | null, hasSignature: boolean) => void;
}

export function SignaturePad({ accentColor = '#8b5cf6', onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasSignatureRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#0f172a';
    }
  }, []);

  useEffect(() => {
    syncCanvasSize();
    const ro = new ResizeObserver(syncCanvasSize);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [syncCanvasSize]);

  const getPoint = (e: React.TouchEvent | React.MouseEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    if ('clientX' in e) {
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    return null;
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) e.preventDefault();
    const pt = getPoint(e);
    if (!pt) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!drawingRef.current) return;
    if ('touches' in e) e.preventDefault();
    const pt = getPoint(e);
    if (!pt) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    if (!hasSignatureRef.current) {
      hasSignatureRef.current = true;
      setHasSignature(true);
    }
  };

  const endDraw = () => {
    drawingRef.current = false;
    if (hasSignatureRef.current) emitChange(true);
  };

  const emitChange = (signed: boolean) => {
    const canvas = canvasRef.current;
    if (!signed || !canvas) {
      onChange(null, false);
      return;
    }
    onChange(canvas.toDataURL('image/png'), true);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    hasSignatureRef.current = false;
    setHasSignature(false);
    onChange(null, false);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <PenLine size={14} color={accentColor} />
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color: '#475569' }}>
            Sign with finger or stylus
          </Typography>
        </Stack>
        <Button size="small" startIcon={<Eraser size={14} />} onClick={clear} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.6875rem' }}>
          Clear
        </Button>
      </Stack>
      <Box
        sx={{
          borderRadius: 2,
          border: `2px solid ${hasSignature ? accentColor : '#cbd5e1'}`,
          bgcolor: '#fff',
          overflow: 'hidden',
          touchAction: 'none',
          boxShadow: hasSignature ? `0 0 0 3px ${alpha(accentColor, 0.12)}` : 'none',
        }}
      >
        <Box
          component="canvas"
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          sx={{
            display: 'block',
            width: '100%',
            height: 140,
            cursor: 'crosshair',
          }}
        />
      </Box>
      <Typography sx={{ fontSize: '0.5625rem', color: '#94a3b8', mt: 0.5, fontWeight: 600 }}>
        {hasSignature ? 'Signature captured' : 'Draw your signature in the box above'}
      </Typography>
    </Box>
  );
}
