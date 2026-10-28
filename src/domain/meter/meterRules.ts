import { MeterValidationResult, MonthlyDuplicateCheckResult } from './types';

const METER_CODE_REGEX = /^MED-\d{6}$/;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Sanitiza y asiste la entrada de texto del código del medidor:
 * - Elimina espacios en blanco en extremos.
 * - Convierte a mayúsculas.
 * - Si el técnico ingresa solo dígitos o prefijo sin guion (ej. "100201", "MED100201"), asiste con "MED-".
 */
export function sanitizeMeterCodeInput(rawInput: string): string {
  if (!rawInput) return '';

  let trimmed = rawInput.trim().toUpperCase();

  // Si solo son dígitos (ej: "100201")
  if (/^\d+$/.test(trimmed)) {
    return `MED-${trimmed}`;
  }

  // Si empieza con MED seguido directamente de dígitos o texto sin guion (ej: "MED100201")
  if (/^MED\d+$/.test(trimmed)) {
    return `MED-${trimmed.slice(3)}`;
  }

  return trimmed;
}

/**
 * Valida si el código cumple estrictamente la expresión regular ^MED-\d{6}$ (10 caracteres).
 */
export function validateMeterCode(code: string): MeterValidationResult {
  if (METER_CODE_REGEX.test(code)) {
    return {
      isValid: true,
      code,
    };
  }

  return {
    isValid: false,
    errorMessage: 'El código debe contener el prefijo MED- seguido de 6 dígitos numéricos.',
  };
}

/**
 * Determina si una entrada de caché de jornada ha expirado (más de 24 horas).
 */
export function isCacheEntryExpired(cachedAtTimestamp: number, currentTimestamp: number = Date.now()): boolean {
  return currentTimestamp - cachedAtTimestamp > TWENTY_FOUR_HOURS_MS;
}

/**
 * Valida la duplicidad mensual de lectura (Regla R10):
 * - No permite dos lecturas del mismo medidor en el mismo mes calendario.
 * - Si ya fue enviada a oficina (isSubmitted = true), bloqueo definitivo.
 * - Si está en cola local pendiente (isSubmitted = false), alerta con posibilidad de ver/editar.
 */
export function checkMonthlyDuplicate(
  lastReadingDateIso: string | null,
  isSubmitted: boolean,
  currentDate: Date = new Date()
): MonthlyDuplicateCheckResult {
  if (!lastReadingDateIso) {
    return { hasDuplicate: false };
  }

  const readingDate = new Date(lastReadingDateIso);
  if (isNaN(readingDate.getTime())) {
    return { hasDuplicate: false };
  }

  const isSameMonthAndYear =
    readingDate.getUTCFullYear() === currentDate.getUTCFullYear() &&
    readingDate.getUTCMonth() === currentDate.getUTCMonth();

  if (!isSameMonthAndYear) {
    return { hasDuplicate: false };
  }

  if (isSubmitted) {
    return {
      hasDuplicate: true,
      isSubmitted: true,
      message: 'Lectura mensual completada y enviada a oficina. No es posible registrar un nuevo valor este mes.',
    };
  }

  return {
    hasDuplicate: true,
    isSubmitted: false,
    canEditPending: true,
    message: 'Este medidor ya tiene una lectura registrada en este mes.',
  };
}
