import type { DragEvent } from 'react';

/** Shared HTML5 drag payload for week runway backlog → day columns */

export const BACKLOG_DRAG_TYPE = 'application/x-timely-mate-backlog';
export const BACKLOG_DRAG_FALLBACK = 'text/plain';

export interface BacklogDragPayload {
  id: string;
  title: string;
  duration: string;
  dept: string;
  borderColor: string;
}

let activeBacklogDrag: BacklogDragPayload | null = null;

export function setBacklogDragData(e: DragEvent, item: BacklogDragPayload) {
  const json = JSON.stringify(item);
  activeBacklogDrag = item;
  try {
    e.dataTransfer.setData(BACKLOG_DRAG_TYPE, json);
  } catch {
    /* Safari may reject custom types in some builds */
  }
  e.dataTransfer.setData(BACKLOG_DRAG_FALLBACK, json);
  e.dataTransfer.effectAllowed = 'move';
  if (e.dataTransfer.dropEffect) {
    e.dataTransfer.dropEffect = 'move';
  }
}

export function readBacklogDragData(e: DragEvent): BacklogDragPayload | null {
  try {
    const raw =
      e.dataTransfer.getData(BACKLOG_DRAG_TYPE) ||
      e.dataTransfer.getData(BACKLOG_DRAG_FALLBACK);
    if (raw) {
      return JSON.parse(raw) as BacklogDragPayload;
    }
  } catch {
    /* ignore */
  }
  return activeBacklogDrag;
}

export function clearBacklogDrag() {
  activeBacklogDrag = null;
}

/** Call on dragover targets so the browser allows drop */
export function allowBacklogDrop(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
}
