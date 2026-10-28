import { ConsolidatedReading } from '../domain/reading/types';
import { SyncSingleResult, SyncEngineSummary } from '../domain/sync/types';
import {
  isReadingEligibleForSync,
  evaluateDeferredReading,
  buildCommercialPayload,
} from '../domain/sync/syncRules';
import { officeHttpClient, fetchMeterFromOffice } from './officeApi';
import {
  getPendingReadingsQueue,
  markReadingAsSubmitted,
  markReadingAsRequiresAttention,
  markReadingAsVerifiedSync,
} from '../storage/reading/readingDraftStorage';

/**
 * Sincroniza una lectura individual con el sistema central de oficina.
 * Maneja verificación diferida, cotejo con datos frescos de oficina,
 * construcción del payload comercial idempotente y actualización atómica local.
 */
export async function syncSingleReading(reading: ConsolidatedReading): Promise<SyncSingleResult> {
  try {
    let readingToSync = reading;

    // 1. Si la lectura estaba pendiente de verificación, consultar datos frescos de oficina
    if (reading.status === 'PENDING_VERIFICATION') {
      const officeMeter = await fetchMeterFromOffice(reading.meterCode);
      const evalResult = evaluateDeferredReading(reading, officeMeter);

      if (evalResult.status === 'REQUIRES_ATTENTION') {
        await markReadingAsRequiresAttention(reading.id, {
          consumption: evalResult.consumption,
          isAnomaly: evalResult.isAnomaly,
          anomalyConfirmed: evalResult.anomalyConfirmed,
          requiresAttentionReason: evalResult.requiresAttentionReason,
        });
        return {
          clientReadingId: reading.id,
          meterCode: reading.meterCode,
          status: 'REQUIRES_ATTENTION',
          errorMessage: evalResult.requiresAttentionReason,
        };
      }

      // Se verificó conforme: actualizamos localmente
      await markReadingAsVerifiedSync(reading.id, {
        consumption: evalResult.consumption,
        isAnomaly: evalResult.isAnomaly,
        anomalyConfirmed: evalResult.anomalyConfirmed,
        hasNoPreviousData: evalResult.hasNoPreviousData,
      });

      readingToSync = {
        ...reading,
        status: 'PENDING_SYNC',
        consumption: evalResult.consumption,
        isAnomaly: evalResult.isAnomaly,
        anomalyConfirmed: evalResult.anomalyConfirmed,
        hasNoPreviousData: evalResult.hasNoPreviousData,
      };
    }

    // 2. Construir payload comercial con clientReadingId inmutable
    const syncedAt = new Date().toISOString();
    const payload = buildCommercialPayload(readingToSync, syncedAt);

    // 3. Despachar a MockAPI
    try {
      const response = await officeHttpClient.post('/lecturas', payload);
      if (response.status === 200 || response.status === 201) {
        await markReadingAsSubmitted(reading.id, syncedAt);
        return {
          clientReadingId: reading.id,
          meterCode: reading.meterCode,
          status: 'SUBMITTED',
        };
      }
    } catch (httpError: any) {
      // Idempotencia: si el servidor responde 409 o indica duplicado, se asume enviada con éxito
      if (httpError?.response?.status === 409) {
        await markReadingAsSubmitted(reading.id, syncedAt);
        return {
          clientReadingId: reading.id,
          meterCode: reading.meterCode,
          status: 'SUBMITTED',
        };
      }
      throw httpError;
    }

    return {
      clientReadingId: reading.id,
      meterCode: reading.meterCode,
      status: 'FAILED',
      errorMessage: 'Respuesta inesperada del servidor de oficina',
    };
  } catch (error: any) {
    return {
      clientReadingId: reading.id,
      meterCode: reading.meterCode,
      status: 'FAILED',
      errorMessage: error?.message || 'Error de comunicación durante la sincronización',
    };
  }
}

/**
 * Sincroniza secuencialmente todas las lecturas elegibles en la cola local.
 * Detiene el procesamiento ante el primer fallo de conexión para no saturar reintentos en microcortes.
 */
export async function syncAllPendingReadings(): Promise<SyncEngineSummary> {
  const queue = await getPendingReadingsQueue();
  const eligibleReadings = queue.filter(isReadingEligibleForSync);

  const summary: SyncEngineSummary = {
    total: eligibleReadings.length,
    sent: 0,
    requiresAttention: 0,
    failed: 0,
  };

  for (const reading of eligibleReadings) {
    const result = await syncSingleReading(reading);

    if (result.status === 'SUBMITTED') {
      summary.sent += 1;
    } else if (result.status === 'REQUIRES_ATTENTION') {
      summary.requiresAttention += 1;
    } else if (result.status === 'FAILED') {
      summary.failed += 1;
      // Detención en microcorte para preservar batería y estado de cola
      break;
    }
  }

  return summary;
}
