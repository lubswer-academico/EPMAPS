import { ConsolidatedReading, QueueFilter, ReadingStatus } from '../reading/types';

/**
 * Filtra las lecturas por estado operativo.
 * - 'pending' agrupa 'PENDING_VERIFICATION' y 'PENDING_SYNC'.
 * - 'submitted' incluye 'SUBMITTED'.
 * - 'all' incluye todas.
 */
export function filterReadings(
  readings: ConsolidatedReading[],
  filter: QueueFilter
): ConsolidatedReading[] {
  if (filter === 'pending') {
    return readings.filter(
      r => r.status === 'PENDING_VERIFICATION' || r.status === 'PENDING_SYNC'
    );
  }
  if (filter === 'submitted') {
    return readings.filter(r => r.status === 'SUBMITTED');
  }
  return readings;
}

/**
 * Ordena las lecturas de forma cronológica descendente por fecha de captura.
 */
export function sortReadingsDesc(readings: ConsolidatedReading[]): ConsolidatedReading[] {
  return [...readings].sort(
    (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
  );
}

/**
 * Mapea el estado operativo a su etiqueta formal en español para visualización.
 */
export function formatReadingStatusLabel(status: ReadingStatus): string {
  switch (status) {
    case 'PENDING_VERIFICATION':
      return 'Pendiente de verificar';
    case 'PENDING_SYNC':
      return 'Pendiente de enviar';
    case 'SUBMITTED':
      return 'Enviada';
  }
}

/**
 * Determina si una lectura es editable (true si no ha sido enviada aún).
 */
export function isReadingEditable(reading: ConsolidatedReading): boolean {
  return reading.status !== 'SUBMITTED';
}

/**
 * Aplica cambios a una lectura existente validando inmutabilidad y preservando id, medidor y fecha de captura.
 */
export function applyReadingUpdate(
  original: ConsolidatedReading,
  changes: Partial<ConsolidatedReading>
): ConsolidatedReading {
  if (original.status === 'SUBMITTED') {
    throw new Error('No es posible modificar una lectura ya enviada a la oficina.');
  }

  return {
    ...original,
    ...changes,
    id: original.id,
    meterCode: original.meterCode,
    capturedAt: original.capturedAt,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Retorna el número total de lecturas pendientes de procesar o enviar.
 */
export function getPendingCount(readings: ConsolidatedReading[]): number {
  return readings.filter(
    r => r.status === 'PENDING_VERIFICATION' || r.status === 'PENDING_SYNC'
  ).length;
}
