export type MeterCondition = 'Normal' | 'Inaccesible' | 'Dañado';

export interface ConsumptionCalculationResult {
  hasPreviousReading: boolean;
  consumption: number | null;
  isValidConsistency: boolean;
  errorMessage?: string;
  isPendingVerification?: boolean;
}

export interface StepRequirements {
  conditionRequired: boolean;
  reasonRequired: boolean;
  damageDescriptionRequired: boolean;
  readingRequired: boolean;
  readingDisabled: boolean;
  photoRequired: boolean;
  anomalyConfirmationRequired: boolean;
}

export interface ReadingDraft {
  meterCode: string;
  condition: MeterCondition;
  inaccessibilityReason?: string;
  damageDescription?: string;
  currentReading?: number | null;
  previousReading?: number | null;
  averageConsumption?: number | null;
  hasNoPreviousData: boolean;
  consumption?: number | null;
  isAnomaly: boolean;
  anomalyConfirmed: boolean;
  photoUri?: string | null;
  currentStep: 1 | 2 | 3;
  createdAt: string;
  updatedAt: string;
}

export type ReadingStatus = 'PENDING_VERIFICATION' | 'PENDING_SYNC' | 'REQUIRES_ATTENTION' | 'SUBMITTED';

export interface OfficeSyncPayload {
  clientReadingId: string;
  meterCode: string;
  condition: MeterCondition;
  currentReading: number | null;
  consumption: number | null;
  inaccessibilityReason?: string;
  damageDescription?: string;
  isAnomaly: boolean;
  anomalyConfirmed: boolean;
  localPhotoUri?: string | null;
  capturedAt: string;
  syncedAt: string;
}

export type QueueFilter = 'all' | 'pending' | 'submitted';

export interface ConsolidatedReading {
  id: string;
  meterCode: string;
  condition: MeterCondition;
  inaccessibilityReason?: string;
  damageDescription?: string;
  currentReading?: number | null;
  previousReading?: number | null;
  averageConsumption?: number | null;
  consumption?: number | null;
  isAnomaly: boolean;
  anomalyConfirmed: boolean;
  photoUri?: string | null;
  hasNoPreviousData: boolean;
  capturedAt: string;
  status: ReadingStatus;
  requiresAttentionReason?: string;
  updatedAt?: string;
  syncedAt?: string;
}

export interface ReadingValidationResult {
  isValid: boolean;
  errorMessage?: string;
}
