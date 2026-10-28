import { useState, useEffect, useCallback } from 'react';
import { AuthenticatedTechnician } from '@/domain/session/types';
import { TECHNICIANS_CATALOG } from '@/domain/session/credentialsCatalog';
import { authenticateTechnician } from '@/domain/session/sessionRules';
import {
  saveSession,
  getSession,
  clearSession,
} from '@/storage/session/sessionStorage';

export interface UseSessionControllerResult {
  technician: AuthenticatedTechnician | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  login: (code: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useSessionController(): UseSessionControllerResult {
  const [technician, setTechnician] = useState<AuthenticatedTechnician | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function restoreSession() {
      try {
        const stored = await getSession();
        if (isMounted && stored) {
          setTechnician(stored);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (code: string, pin: string): Promise<boolean> => {
    setErrorMessage(null);
    const result = authenticateTechnician(code, pin, TECHNICIANS_CATALOG);

    if (!result.success || !result.technician) {
      setErrorMessage(result.errorMessage || 'Código de empleado o clave incorrectos.');
      return false;
    }

    await saveSession(result.technician);
    setTechnician(result.technician);
    return true;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await clearSession();
    setTechnician(null);
    setErrorMessage(null);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    technician,
    isAuthenticated: technician !== null,
    isLoading,
    errorMessage,
    login,
    logout,
    clearError,
  };
}
