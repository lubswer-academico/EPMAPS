import { useState, useEffect, useRef, useCallback } from 'react';
import { SyncEngineSummary } from '../../domain/sync/types';
import { syncAllPendingReadings } from '../../services/syncService';
import {
  subscribeToNetworkStatus,
  fetchCurrentNetworkStatus,
} from '../session/networkMonitor';

export interface UseSyncEngineReturn {
  isSyncing: boolean;
  syncSummary: SyncEngineSummary | null;
  syncError: string | null;
}

interface SyncEngineState {
  isSyncing: boolean;
  syncSummary: SyncEngineSummary | null;
  syncError: string | null;
}

/**
 * Esperas progresivas de reintento automático cuando un envío falla estando online
 * (p. ej. la red se reporta conectada antes de que el DNS/datos estén realmente disponibles).
 */
const RETRY_DELAYS_MS = [5000, 15000, 30000];

const INITIAL_STATE: SyncEngineState = { isSyncing: false, syncSummary: null, syncError: null };

// ─── Motor único compartido por toda la app (independiente de cuántas pantallas lo usen) ───
let engineState: SyncEngineState = { ...INITIAL_STATE };
const stateListeners = new Set<(state: SyncEngineState) => void>();
const completionListeners = new Set<() => void>();

let inFlight: Promise<void> | null = null; // Mutex global de envío
let rerunRequested = false; // Hubo una petición mientras se enviaba: repetir al terminar
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let retryAttempt = 0;

let networkUnsubscribe: (() => void) | null = null;
let subscriberCount = 0;
let lastConnected: boolean | null = null; // null = estado aún desconocido

function setEngineState(patch: Partial<SyncEngineState>) {
  engineState = { ...engineState, ...patch };
  stateListeners.forEach((listener) => listener(engineState));
}

function clearRetry() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

function scheduleRetry() {
  if (retryTimer || retryAttempt >= RETRY_DELAYS_MS.length) return;
  const delay = RETRY_DELAYS_MS[retryAttempt];
  retryAttempt += 1;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    void runSyncCycle();
  }, delay);
}

async function executeCycle(): Promise<void> {
  setEngineState({ isSyncing: true, syncError: null });
  try {
    do {
      rerunRequested = false;

      const isOnline = await fetchCurrentNetworkStatus();
      if (isOnline === false) {
        setEngineState({ syncError: 'Sin conexión a red. Conéctese a internet para sincronizar.' });
        return;
      }

      const summary = await syncAllPendingReadings();
      setEngineState({ syncSummary: summary });

      if (summary.failed > 0) {
        setEngineState({
          syncError: 'Algunas lecturas no pudieron enviarse. Se reintentará automáticamente.',
        });
        scheduleRetry();
        return;
      }

      // Ciclo exitoso: se reinicia la política de reintentos
      retryAttempt = 0;
      clearRetry();
    } while (rerunRequested);
  } catch (error: any) {
    setEngineState({ syncError: error?.message || 'Error durante la sincronización' });
    scheduleRetry();
  } finally {
    setEngineState({ isSyncing: false });
    completionListeners.forEach((listener) => listener());
  }
}

/**
 * Ejecuta un ciclo de sincronización garantizando que nunca haya dos en paralelo.
 * Si ya hay uno en curso, se agenda una repetición al terminar (para incluir lecturas nuevas).
 */
export function runSyncCycle(): Promise<void> {
  if (inFlight) {
    rerunRequested = true;
    return inFlight;
  }
  inFlight = executeCycle().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/**
 * Solicitud silenciosa de envío en segundo plano (p. ej. tras guardar una lectura con señal).
 * Si no hay conexión no hace nada: la lectura queda en cola hasta que vuelva la señal.
 */
export function requestBackgroundSync(): void {
  fetchCurrentNetworkStatus()
    .then((isOnline) => {
      if (isOnline === true) {
        void runSyncCycle();
      }
    })
    .catch(() => {
      // Sin acceso al estado de red: se espera al siguiente evento del listener
    });
}

function handleNetworkChange(isConnected: boolean | null) {
  const previous = lastConnected;
  lastConnected = isConnected;

  if (isConnected === true && previous !== true) {
    // Recuperación de conexión (o arranque con señal): envío automático desatendido
    retryAttempt = 0;
    clearRetry();
    void runSyncCycle();
  } else if (isConnected === false) {
    clearRetry();
  }
}

function acquireNetworkSubscription() {
  subscriberCount += 1;
  if (!networkUnsubscribe) {
    networkUnsubscribe = subscribeToNetworkStatus(handleNetworkChange);
  }
}

function releaseNetworkSubscription() {
  subscriberCount = Math.max(0, subscriberCount - 1);
  if (subscriberCount === 0 && networkUnsubscribe) {
    networkUnsubscribe();
    networkUnsubscribe = null;
    lastConnected = null;
    clearRetry();
  }
}

/** Solo para pruebas: reinicia el estado global del motor. */
export function __resetSyncEngineForTests() {
  clearRetry();
  if (networkUnsubscribe) networkUnsubscribe();
  networkUnsubscribe = null;
  subscriberCount = 0;
  lastConnected = null;
  inFlight = null;
  rerunRequested = false;
  retryAttempt = 0;
  engineState = { ...INITIAL_STATE };
  stateListeners.clear();
  completionListeners.clear();
}

/**
 * Hook del motor de sincronización.
 * - Envío 100% automático al recuperar conexión o al arrancar con señal (sin intervención del técnico).
 * - Reintentos automáticos con espera progresiva ante fallos estando online.
 * - Mutex y suscripción de red únicos para toda la app, aunque varias pantallas usen el hook.
 * - `syncNow()` queda como disparador manual opcional.
 */
export function useSyncEngine(onSyncComplete?: () => void): UseSyncEngineReturn {
  const [state, setState] = useState<SyncEngineState>(engineState);
  const onCompleteRef = useRef(onSyncComplete);
  onCompleteRef.current = onSyncComplete;

  useEffect(() => {
    const stateListener = (next: SyncEngineState) => setState(next);
    const completionListener = () => onCompleteRef.current?.();

    stateListeners.add(stateListener);
    completionListeners.add(completionListener);
    setState(engineState);
    acquireNetworkSubscription();

    return () => {
      stateListeners.delete(stateListener);
      completionListeners.delete(completionListener);
      releaseNetworkSubscription();
    };
  }, []);

  return {
    isSyncing: state.isSyncing,
    syncSummary: state.syncSummary,
    syncError: state.syncError,
  };
}
