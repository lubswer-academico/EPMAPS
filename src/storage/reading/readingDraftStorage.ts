import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadingDraft, ConsolidatedReading } from '../../domain/reading/types';

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
 * Retorna la cantidad total de lecturas pendientes de sincronización en la cola local.
 */
export async function getPendingReadingsCount(): Promise<number> {
  try {
    const queue = await getPendingReadingsQueue();
    return queue.length;
  } catch (error) {
    console.error('Error al obtener conteo de lecturas pendientes:', error);
    return 0;
  }
}
