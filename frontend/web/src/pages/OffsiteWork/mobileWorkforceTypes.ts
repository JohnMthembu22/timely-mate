export type MobileWorkforceTool =
  | 'photo'
  | 'gps'
  | 'logistics'
  | 'inspection'
  | 'escalate';

export interface MobileToolSubmitPayload {
  tool: MobileWorkforceTool;
  siteId?: string;
  siteName?: string;
  summary: string;
  photoDataUrl?: string;
  capturedByUserId?: string;
  capturedByName?: string;
  signatureDataUrl?: string;
  /** Free-text site when no sites are deployed yet */
  fieldLocationLabel?: string;
}
