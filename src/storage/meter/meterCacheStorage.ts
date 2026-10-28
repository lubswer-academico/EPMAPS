import AsyncStorage from '@react-native-async-storage/async-storage';
import { MeterRecord, CachedMeterEntry } from '@/domain/meter/types';
import { isCacheEntryExpired } from '@/domain/meter/meterRules';

export const METER_CACHE_STORAGE_KEY = 'epmaps_meter_cache_v1';

type MeterCacheMap = Record<string, CachedMeterEntry>;

async function loadRawCacheMap(): Promise<MeterCacheMap> {
  try {
    const raw = await AsyncStorage.getItem(METER_CACHE_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as MeterCacheMap;
    }
    await AsyncStorage.removeItem(METER_CACHE_STORAGE_KEY);
    return {};
  } catch {
    await AsyncStorage.removeItem(METER_CACHE_STORAGE_KEY);
    return {};
  }
}

async function persistCacheMap(map: MeterCacheMap): Promise<void> {
  try {
    await AsyncStorage.setItem(METER_CACHE_STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('Error al persistir caché de medidores:', error);
  }
}

/**
 * Guarda o actualiza la ficha del medidor en el caché local de jornada con la marca de tiempo actual.
 */
export async function saveMeterToCache(meter: MeterRecord): Promise<void> {
  const cacheMap = await loadRawCacheMap();
  cacheMap[meter.code] = {
    record: meter,
    cachedAt: Date.now(),
  };
  await persistCacheMap(cacheMap);
}

/**
 * Recupera la ficha técnica y comercial del medidor si existe en el caché y no ha caducado (> 24h).
 */
export async function getMeterFromCache(code: string): Promise<MeterRecord | null> {
  const cacheMap = await loadRawCacheMap();
  const entry = cacheMap[code];

  if (!entry) {
    return null;
  }

  if (isCacheEntryExpired(entry.cachedAt)) {
    delete cacheMap[code];
    await persistCacheMap(cacheMap);
    return null;
  }

  return entry.record;
}

/**
 * Purga del almacenamiento local todas las entradas con antigüedad mayor a 24 horas.
 */
export async function purgeExpiredCache(): Promise<void> {
  const cacheMap = await loadRawCacheMap();
  const now = Date.now();
  let hasModifications = false;

  for (const [code, entry] of Object.entries(cacheMap)) {
    if (isCacheEntryExpired(entry.cachedAt, now)) {
      delete cacheMap[code];
      hasModifications = true;
    }
  }

  if (hasModifications) {
    await persistCacheMap(cacheMap);
  }
}

/**
 * Vacía completamente el almacenamiento de caché de medidores (por ejemplo al cerrar turno).
 */
export async function clearMeterCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(METER_CACHE_STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar el caché de medidores:', error);
  }
}
