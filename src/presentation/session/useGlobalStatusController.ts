import { useState, useEffect } from 'react';
import { ConnectionStatus } from '@/domain/session/types';
import {
  formatConnectionStatus,
  getInitialPendingReadingsLabel,
} from '@/domain/session/statusBarRules';
import {
  fetchCurrentNetworkStatus,
  subscribeToNetworkStatus,
} from './networkMonitor';

export interface UseGlobalStatusControllerResult {
  isOnline: boolean;
  connectionLabel: ConnectionStatus;
  pendingLabel: string;
}

export function useGlobalStatusController(): UseGlobalStatusControllerResult {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    let isMounted = true;

    fetchCurrentNetworkStatus().then((initialStatus) => {
      if (isMounted) {
        setIsConnected(initialStatus);
      }
    });

    const unsubscribe = subscribeToNetworkStatus((status) => {
      if (isMounted) {
        setIsConnected(status);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const isOnline = isConnected === true;
  const connectionLabel = formatConnectionStatus(isConnected);
  const pendingLabel = getInitialPendingReadingsLabel();

  return {
    isOnline,
    connectionLabel,
    pendingLabel,
  };
}
