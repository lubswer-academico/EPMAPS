import { ConsolidatedReading, OfficeSyncPayload } from '../reading/types';
import { MeterRecord } from '../meter/types';
import { DeferredEvaluationResult } from './types';

/**
 * Determina si una lectura es elegible para sincronizarse con la oficina.
 * Solo 'PENDING_SYNC' y 'PENDING_VERIFICATION' son elegibles.
 * 'REQUIRES_ATTENTION' y 'SUBMITTED' quedan excluidas.
 */
export function isReadingEligibleForSync(reading: ConsolidatedReading): boolean {
  return reading.status === 'PENDING_SYNC' || reading.status === 'PENDING_VERIFICATION';
}

/**
 * Evalúa una lectura capturada previamente sin datos previos frente a la ficha oficial fresca.
 * Calcula el consumo, valida consistencia y detecta anomalías > 3x promedio mensual.
 */
export function evaluateDeferredReading(
  reading: ConsolidatedReading,
  officeMeter: MeterRecord | null
): DeferredEvaluationResult {
  // 1. Si el medidor no existe en la oficina central, NO se puede sincronizar
  if (!officeMeter) {
    return {
      status: 'REQUIRES_ATTENTION',
      consumption: null,
      isAnomaly: false,
      anomalyConfirmed: false,
      hasNoPreviousData: true,
      requiresAttentionReason: 'Medidor inexistente en catastro',
    };
  }

  // 2. Si la condición es Inaccesible, no hay lectura actual ni consumo
  if (reading.condition === 'Inaccesible' || reading.currentReading == null) {
    return {
      status: 'PENDING_SYNC',
      consumption: null,
      isAnomaly: false,
      anomalyConfirmed: reading.anomalyConfirmed ?? false,
      hasNoPreviousData: officeMeter.lastReading?.value == null,
    };
  }

  // 3. Si en la oficina existe el medidor pero es nuevo sin lecturas anteriores ni promedio (primer registro)
  if (officeMeter.lastReading?.value == null || officeMeter.averageConsumption == null) {
    return {
      status: 'PENDING_SYNC',
      consumption: null,
      isAnomaly: false,
      anomalyConfirmed: false,
      hasNoPreviousData: true,
    };
  }

  const previousReading = officeMeter.lastReading.value;
  const averageConsumption = officeMeter.averageConsumption;

  // Incongruencia física: la lectura actual es menor que la anterior
  if (reading.currentReading < previousReading) {
    return {
      status: 'REQUIRES_ATTENTION',
      consumption: null,
      isAnomaly: false,
      anomalyConfirmed: false,
      hasNoPreviousData: false,
      requiresAttentionReason:
        'Incongruencia física: la lectura actual es inferior a la última registrada en oficina.',
    };
  }

  const consumption = reading.currentReading - previousReading;
  const isAnomaly = consumption > 3 * averageConsumption;

  if (isAnomaly) {
    // Si ya tenía foto capturada y confirmación explícita
    if (reading.photoUri && reading.anomalyConfirmed) {
      return {
        status: 'PENDING_SYNC',
        consumption,
        isAnomaly: true,
        anomalyConfirmed: true,
        hasNoPreviousData: false,
      };
    }

    // Si carece de foto o de confirmación, se retiene para atención en campo
    return {
      status: 'REQUIRES_ATTENTION',
      consumption,
      isAnomaly: true,
      anomalyConfirmed: false,
      hasNoPreviousData: false,
      requiresAttentionReason:
        'Lectura con consumo superior a 3 veces el promedio mensual (anomalía no confirmada). Requiere fotografía y confirmación.',
    };
  }

  // Consumo normal
  return {
    status: 'PENDING_SYNC',
    consumption,
    isAnomaly: false,
    anomalyConfirmed: false,
    hasNoPreviousData: false,
  };
}

/**
 * Construye el payload comercial para MockAPI con el id del cliente inmutable para idempotencia.
 */
export function buildCommercialPayload(
  reading: ConsolidatedReading,
  syncedAt: string = new Date().toISOString()
): OfficeSyncPayload {
  return {
    clientReadingId: reading.id,
    meterCode: reading.meterCode,
    condition: reading.condition,
    ...(reading.inaccessibilityReason ? { inaccessibilityReason: reading.inaccessibilityReason } : {}),
    ...(reading.damageDescription ? { damageDescription: reading.damageDescription } : {}),
    currentReading: reading.currentReading ?? null,
    consumption: reading.consumption ?? null,
    isAnomaly: reading.isAnomaly,
    anomalyConfirmed: reading.anomalyConfirmed,
    ...(reading.photoUri ? { localPhotoUri: reading.photoUri } : {}),
    capturedAt: reading.capturedAt,
    syncedAt,
  };
}
