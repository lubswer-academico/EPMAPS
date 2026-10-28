import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthenticatedTechnician } from '@/domain/session/types';

export const ACTIVE_SESSION_KEY = 'epmaps_active_session';

/**
 * Guarda de forma no volátil la sesión del técnico autenticado.
 */
export async function saveSession(technician: AuthenticatedTechnician): Promise<void> {
  const serialized = JSON.stringify(technician);
  await AsyncStorage.setItem(ACTIVE_SESSION_KEY, serialized);
}

/**
 * Recupera la sesión activa. En caso de formato corrupto o error,
 * purga defensivamente la clave y retorna null.
 */
export async function getSession(): Promise<AuthenticatedTechnician | null> {
  try {
    const rawData = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
    if (!rawData) {
      return null;
    }

    const parsed = JSON.parse(rawData);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.employeeCode === 'string' &&
      typeof parsed.name === 'string'
    ) {
      return {
        employeeCode: parsed.employeeCode,
        name: parsed.name,
      };
    }

    // Datos inválidos o incompletos: purga preventiva
    await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    return null;
  } catch {
    // Error al parsear JSON corrupto
    try {
      await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch {
      // Ignorar fallas secundarias de purga
    }
    return null;
  }
}

/**
 * Elimina la sesión persistida (cierre de turno).
 */
export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
}
