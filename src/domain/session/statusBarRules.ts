import { ConnectionStatus } from './types';

/**
 * Convierte el estado booleano de conectividad en los textos oficiales del sistema EPMAPS.
 */
export function formatConnectionStatus(isConnected: boolean | null | undefined): ConnectionStatus {
  return isConnected === true ? 'Con señal' : 'Sin señal';
}

/**
 * Retorna el conteo inicial constante de lecturas pendientes para HU-001.
 */
export function getInitialPendingReadingsLabel(): string {
  return '0 pendientes';
}
