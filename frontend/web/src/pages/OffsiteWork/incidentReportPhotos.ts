export interface IncidentPhotoAttachment {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  uploadedAt: string;
}

export const MAX_INCIDENT_PHOTOS = 6;
const MAX_INPUT_BYTES = 12 * 1024 * 1024;
const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.72;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load image.'));
    img.src = src;
  });
}

export async function compressImageToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be attached.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('Each photo must be under 12 MB before compression.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not process image.');
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function fileToIncidentPhoto(file: File): Promise<IncidentPhotoAttachment> {
  const dataUrl = await compressImageToDataUrl(file);
  return {
    id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name.replace(/\.[^.]+$/, '') || 'photo',
    mimeType: 'image/jpeg',
    dataUrl,
    uploadedAt: new Date().toISOString(),
  };
}

export async function filesToIncidentPhotos(
  files: FileList | File[],
  existing: IncidentPhotoAttachment[]
): Promise<{ photos: IncidentPhotoAttachment[]; error?: string }> {
  const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
  if (list.length === 0) {
    return { photos: existing, error: 'No valid image files selected.' };
  }

  const slots = MAX_INCIDENT_PHOTOS - existing.length;
  if (slots <= 0) {
    return { photos: existing, error: `Maximum ${MAX_INCIDENT_PHOTOS} photos per report.` };
  }

  const toAdd = list.slice(0, slots);
  const added: IncidentPhotoAttachment[] = [];
  for (const file of toAdd) {
    try {
      added.push(await fileToIncidentPhoto(file));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to attach photo.';
      return { photos: [...existing, ...added], error: message };
    }
  }

  if (list.length > slots) {
    return {
      photos: [...existing, ...added],
      error: `Only ${slots} more photo(s) added (max ${MAX_INCIDENT_PHOTOS}).`,
    };
  }

  return { photos: [...existing, ...added] };
}
