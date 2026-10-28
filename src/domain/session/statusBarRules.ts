import { ConnectionStatus } from './types';

/**
 * Convierte el estado booleano de conectividad en los textos oficiales del sistema EPMAPS.
 */
export function formatConnectionStatus(isConnected: boolean | null | undefined): ConnectionStatus {
  return isConnected === true ? 'Con señal' : 'Sin señal';
}

/**
 * Retorna la etiqueta con el conteo de lecturas pendientes formateada para la barra de estado.
 */
export function formatPendingReadingsLabel(count: number): string {
  return `${count} pendientes`;
}

/**
 * Retorna el conteo inicial constante de lecturas pendientes para HU-001.
 */
export function getInitialPendingReadingsLabel(): string {
  return formatPendingReadingsLabel(0);
}
