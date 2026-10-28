export type MeterStatus = 'active' | 'suspended' | 'inactive';

export interface MeterLastReading {
  value: number;
  date: string; // Fecha ISO
}

export interface MeterRecord {
  code: string;               // Ej: "MED-100201"
  address: string;            // Dirección del predio
  sector: string;             // Sector o barrio de Quito
  accountNumber: string;      // Número de cuenta de agua potable
  status: MeterStatus;        // 'active' | 'suspended' | 'inactive'
  lastReading: MeterLastReading; // Última lectura registrada en oficina
  averageConsumption: number; // Promedio mensual en m³
}

export interface MeterValidationResult {
  isValid: boolean;
  code?: string;
  errorMessage?: string;
}

export interface MonthlyDuplicateCheckResult {
  hasDuplicate: boolean;
  isSubmitted?: boolean;
  message?: string;
  canEditPending?: boolean;
}

export interface CachedMeterEntry {
  record: MeterRecord;
  cachedAt: number; // Timestamp Unix ms
}
