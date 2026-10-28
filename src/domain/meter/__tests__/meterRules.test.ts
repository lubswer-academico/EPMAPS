import {
  sanitizeMeterCodeInput,
  validateMeterCode,
  isCacheEntryExpired,
  checkMonthlyDuplicate,
} from '../meterRules';

describe('meterRules - Dominio de Medidores', () => {
  describe('sanitizeMeterCodeInput', () => {
    it('debe recortar espacios en blanco iniciales y finales', () => {
      expect(sanitizeMeterCodeInput('  MED-100201  ')).toBe('MED-100201');
    });

    it('debe convertir letras a mayúsculas', () => {
      expect(sanitizeMeterCodeInput('med-100201')).toBe('MED-100201');
      expect(sanitizeMeterCodeInput('med100201')).toBe('MED-100201');
    });

    it('debe asistir anteponiendo el prefijo MED- si solo se ingresan dígitos numéricos', () => {
      expect(sanitizeMeterCodeInput('100201')).toBe('MED-100201');
    });

    it('debe normalizar MED sin guion insertando el guion separador', () => {
      expect(sanitizeMeterCodeInput('MED100201')).toBe('MED-100201');
      expect(sanitizeMeterCodeInput('med100201')).toBe('MED-100201');
    });
  });

  describe('validateMeterCode', () => {
    it('debe validar exitosamente códigos con formato estricto MED-XXXXXX (6 dígitos)', () => {
      const result = validateMeterCode('MED-100201');
      expect(result.isValid).toBe(true);
      expect(result.code).toBe('MED-100201');
      expect(result.errorMessage).toBeUndefined();
    });

    it('debe rechazar códigos con menos de 6 dígitos numéricos', () => {
      const result = validateMeterCode('MED-10020');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'El código debe contener el prefijo MED- seguido de 6 dígitos numéricos.'
      );
    });

    it('debe rechazar códigos con más de 6 dígitos numéricos', () => {
      const result = validateMeterCode('MED-1002012');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'El código debe contener el prefijo MED- seguido de 6 dígitos numéricos.'
      );
    });

    it('debe rechazar códigos con caracteres no numéricos tras el prefijo', () => {
      const result = validateMeterCode('MED-10020A');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'El código debe contener el prefijo MED- seguido de 6 dígitos numéricos.'
      );
    });

    it('debe rechazar códigos con prefijo incorrecto', () => {
      const result = validateMeterCode('AGU-100201');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(
        'El código debe contener el prefijo MED- seguido de 6 dígitos numéricos.'
      );
    });
  });

  describe('isCacheEntryExpired', () => {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    it('no debe marcar como expirada una entrada guardada hace menos de 24 horas', () => {
      const now = Date.now();
      const cachedAt = now - 5 * ONE_HOUR_MS;
      expect(isCacheEntryExpired(cachedAt, now)).toBe(false);
    });

    it('debe marcar como expirada una entrada guardada hace más de 24 horas', () => {
      const now = Date.now();
      const cachedAt = now - (TWENTY_FOUR_HOURS_MS + 1000);
      expect(isCacheEntryExpired(cachedAt, now)).toBe(true);
    });

    it('no debe expirar exactamente al límite de 24 horas', () => {
      const now = Date.now();
      const cachedAt = now - TWENTY_FOUR_HOURS_MS;
      expect(isCacheEntryExpired(cachedAt, now)).toBe(false);
    });
  });

  describe('checkMonthlyDuplicate (Regla R10)', () => {
    const referenceDate = new Date('2026-10-28T10:00:00.000Z');

    it('debe permitir la captura si no existe fecha de última lectura', () => {
      const result = checkMonthlyDuplicate(null, false, referenceDate);
      expect(result.hasDuplicate).toBe(false);
    });

    it('debe permitir la captura si la última lectura es de un mes o año anterior', () => {
      const resultPreviousMonth = checkMonthlyDuplicate('2026-09-15T08:30:00.000Z', true, referenceDate);
      expect(resultPreviousMonth.hasDuplicate).toBe(false);

      const resultPreviousYear = checkMonthlyDuplicate('2025-10-15T08:30:00.000Z', true, referenceDate);
      expect(resultPreviousYear.hasDuplicate).toBe(false);
    });

    it('debe bloquear completamente con advertencia si ya fue enviada a oficina en el mismo mes calendario', () => {
      const result = checkMonthlyDuplicate('2026-10-05T09:00:00.000Z', true, referenceDate);
      expect(result.hasDuplicate).toBe(true);
      expect(result.isSubmitted).toBe(true);
      expect(result.message).toBe(
        'Lectura mensual completada y enviada a oficina. No es posible registrar un nuevo valor este mes.'
      );
      expect(result.canEditPending).toBeFalsy();
    });

    it('debe alertar y permitir edición si ya existe lectura en el mismo mes pero sigue en cola local pendiente', () => {
      const result = checkMonthlyDuplicate('2026-10-05T09:00:00.000Z', false, referenceDate);
      expect(result.hasDuplicate).toBe(true);
      expect(result.isSubmitted).toBe(false);
      expect(result.canEditPending).toBe(true);
      expect(result.message).toBe(
        'Este medidor ya tiene una lectura registrada en este mes.'
      );
    });
  });
});
