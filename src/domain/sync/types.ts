import { ConsolidatedReading, OfficeSyncPayload } from '../reading/types';
import { MeterRecord } from '../meter/types';

export interface DeferredEvaluationResult {
  status: 'PENDING_SYNC' | 'REQUIRES_ATTENTION';
  consumption: number | null;
  isAnomaly: boolean;
  anomalyConfirmed: boolean;
  hasNoPreviousData: boolean;
  requiresAttentionReason?: string;
}

export interface SyncEngineSummary {
  total: number;
  sent: number;
  requiresAttention: number;
  failed: number;
}

export type SyncResultStatus = 'SUBMITTED' | 'REQUIRES_ATTENTION' | 'FAILED' | 'SKIPPED';

export interface SyncSingleResult {
  clientReadingId: string;
  meterCode: string;
  status: SyncResultStatus;
  errorMessage?: string;
}
