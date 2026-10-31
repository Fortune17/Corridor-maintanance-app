import {
  Profile,
  MaintenanceRequest,
  RequestComment,
  RequestAttachment,
  RequestHistory,
  AppNotification
} from '../types/database';

/**
 * Production clean dataset.
 * All demo mock data, pre-seeded tickets, and sample resident accounts
 * have been permanently cleared for live customer deployment.
 */
export const SAMPLE_PROFILES: Profile[] = [];
export const SAMPLE_REQUESTS: MaintenanceRequest[] = [];
export const SAMPLE_COMMENTS: RequestComment[] = [];
export const SAMPLE_ATTACHMENTS: RequestAttachment[] = [];
export const SAMPLE_HISTORY: RequestHistory[] = [];
export const SAMPLE_NOTIFICATIONS: AppNotification[] = [];
