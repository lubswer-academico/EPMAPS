export interface TechnicianCredentials {
  employeeCode: string;
  pin: string;
  name: string;
}

export interface AuthenticatedTechnician {
  employeeCode: string;
  name: string;
}

export interface SessionValidationResult {
  success: boolean;
  technician?: AuthenticatedTechnician;
  errorMessage?: string;
}

export type ConnectionStatus = 'Con señal' | 'Sin señal';

export interface GlobalStatusBarState {
  connectionLabel: ConnectionStatus;
  pendingLabel: string;
}
