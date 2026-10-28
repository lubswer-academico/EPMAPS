import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadingDraft, ConsolidatedReading } from '../../domain/reading/types';
import { applyReadingUpdate } from '../../domain/readingQueue/queueRules';

export const DRAFTS_STORAGE_KEY = 'epmaps_reading_drafts_v1';
export const QUEUE_STORAGE_KEY = 'epmaps_pending_readings_queue_v1';

/**
 * Obtiene todos los borradores almacenados como un mapa indexado por código de medidor.
 */
async function getAllDrafts(): Promise<Record<string, ReadingDraft>> {
  try {
    const raw = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al leer borradores de almacenamiento local:', error);
    return {};
  }
}

/**
 * Guarda en caliente el borrador activo asociado al medidor.
 */
export async function saveDraft(draft: ReadingDraft): Promise<void> {
  try {
    const drafts = await getAllDrafts();
    drafts[draft.meterCode] = {
      ...draft,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error(`Error al guardar borrador para el medidor ${draft.meterCode}:`, error);
  }
}

/**
 * Recupera el borrador activo para el código de medidor especificado.
 */
export async function getDraft(meterCode: string): Promise<ReadingDraft | null> {
  try {
    const drafts = await getAllDrafts();
    return drafts[meterCode] || null;
  } catch (error) {
    console.error(`Error al obtener borrador para ${meterCode}:`, error);
    return null;
  }
}

/**
 * Elimina el borrador activo asociado al medidor especificado.
 */
export async function clearDraft(meterCode: string): Promise<void> {
  try {
    const drafts = await getAllDrafts();
    if (drafts[meterCode]) {
      delete drafts[meterCode];
      await AsyncStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
    }
  } catch (error) {
    console.error(`Error al limpiar borrador para ${meterCode}:`, error);
  }
}

/**
 * Retorna la cola de lecturas consolidadas pendientes de sincronización.
 */
export async function getPendingReadingsQueue(): Promise<ConsolidatedReading[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al leer cola de lecturas pendientes:', error);
    return [];
  }
}

/**
 * Guarda una lectura consolidada en la cola persistente local y purga su borrador temporal.
 */
export async function saveConsolidatedReading(reading: ConsolidatedReading): Promise<void> {
  try {
    const queue = await getPendingReadingsQueue();
    queue.push(reading);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    await clearDraft(reading.meterCode);
  } catch (error) {
    console.error(`Error al encolar lectura consolidada para ${reading.meterCode}:`, error);
    throw error;
  }
}

/**
 * Retorna la cantidad total de lecturas pendientes de sincronización en la cola local (excluyendo SUBMITTED).
 */
export async function getPendingReadingsCount(): Promise<number> {
  try {
    const queue = await getPendingReadingsQueue();
    return queue.filter(r => r.status !== 'SUBMITTED').length;
  } catch (error) {
    console.error('Error al obtener conteo de lecturas pendientes:', error);
    return 0;
  }
}

/**
 * Recupera una lectura consolidada por su id único.
 */
export async function getReadingById(id: string): Promise<ConsolidatedReading | null> {
  try {
    const queue = await getPendingReadingsQueue();
    const found = queue.find(r => r.id === id);
    return found || null;
  } catch (error) {
    console.error(`Error al obtener lectura con id ${id}:`, error);
    return null;
  }
}

/**
 * Recupera una lectura consolidada por su código de medidor.
 */
export async function getReadingByMeterCode(meterCode: string): Promise<ConsolidatedReading | null> {
  try {
    const queue = await getPendingReadingsQueue();
    const found = queue.find(r => r.meterCode === meterCode);
    return found || null;
  } catch (error) {
    console.error(`Error al obtener lectura para medidor ${meterCode}:`, error);
    return null;
  }
}

/**
 * Actualiza una lectura existente in-place en la cola local, preservando su id, posición y capturedAt.
 * Lanza error si la lectura no existe o si se encuentra en estado 'SUBMITTED'.
 */
export async function updateConsolidatedReading(updated: ConsolidatedReading): Promise<void> {
  const queue = await getPendingReadingsQueue();
  const index = queue.findIndex(r => r.id === updated.id);

  if (index === -1) {
    throw new Error(`No se encontró la lectura con id ${updated.id} en la cola local.`);
  }

  const existing = queue[index];
  // applyReadingUpdate valida inmutabilidad (SUBMITTED) y preserva id y capturedAt (meterCode es subsanable)
  const updatedEntity = applyReadingUpdate(existing, updated);

  queue[index] = updatedEntity;
  await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

/**
 * Marca atómicamente una lectura como enviada (SUBMITTED) con su fecha de sincronización.
 */
export async function markReadingAsSubmitted(
  id: string,
  syncedAt: string = new Date().toISOString()
): Promise<void> {
  const queue = await getPendingReadingsQueue();
  const index = queue.findIndex(r => r.id === id);

  if (index === -1) {
    throw new Error(`No se encontró la lectura con id ${id} en la cola local.`);
  }

  queue[index] = {
    ...queue[index],
    status: 'SUBMITTED',
    syncedAt,
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

/**
 * Marca atómicamente una lectura como REQUIRES_ATTENTION actualizando motivos y consumo.
 */
export async function markReadingAsRequiresAttention(
  id: string,
  extra?: Partial<ConsolidatedReading>
): Promise<void> {
  const queue = await getPendingReadingsQueue();
  const index = queue.findIndex(r => r.id === id);

  if (index === -1) {
    throw new Error(`No se encontró la lectura con id ${id} en la cola local.`);
  }

  queue[index] = {
    ...queue[index],
    ...extra,
    status: 'REQUIRES_ATTENTION',
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

/**
 * Marca atómicamente una lectura como PENDING_SYNC tras verificación diferida exitosa.
 */
export async function markReadingAsVerifiedSync(
  id: string,
  extra?: Partial<ConsolidatedReading>
): Promise<void> {
  const queue = await getPendingReadingsQueue();
  const index = queue.findIndex(r => r.id === id);

  if (index === -1) {
    throw new Error(`No se encontró la lectura con id ${id} en la cola local.`);
  }

  queue[index] = {
    ...queue[index],
    ...extra,
    status: 'PENDING_SYNC',
    updatedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

/**
 * Elimina una lectura no enviada de la cola local (por ejemplo, registro huérfano con código inexistente).
 * Lanza un error si la lectura ya fue enviada (SUBMITTED).
 */
export async function deleteConsolidatedReading(id: string): Promise<void> {
  const queue = await getPendingReadingsQueue();
  const index = queue.findIndex(r => r.id === id);

  if (index === -1) {
    throw new Error(`No se encontró la lectura con id ${id} en la cola local.`);
  }

  if (queue[index].status === 'SUBMITTED') {
    throw new Error('No es posible eliminar una lectura ya enviada a la oficina.');
  }

  queue.splice(index, 1);
  await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}


