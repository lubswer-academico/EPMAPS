import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export type NetworkChangeCallback = (isConnected: boolean | null) => void;

/**
 * Consulta el estado actual de conectividad de forma asíncrona.
 */
export async function fetchCurrentNetworkStatus(): Promise<boolean | null> {
  const state: NetInfoState = await NetInfo.fetch();
  return state.isConnected;
}

/**
 * Se suscribe a los cambios de conectividad de red y notifica mediante el callback proporcionado.
 * Retorna la función de desuscripción.
 */
export function subscribeToNetworkStatus(callback: NetworkChangeCallback): () => void {
  const unsubscribe: NetInfoSubscription = NetInfo.addEventListener((state: NetInfoState) => {
    callback(state.isConnected);
  });

  return unsubscribe;
}
