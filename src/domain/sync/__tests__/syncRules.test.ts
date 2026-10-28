import { ConsolidatedReading } from '../../reading/types';
import { MeterRecord } from '../../meter/types';
import {
  isReadingEligibleForSync,
  evaluateDeferredReading,
  buildCommercialPayload,
} from '../syncRules';

describe('syncRules - Lógica pura de sincronización diferida e idempotencia (TDD)', () => {
  const baseReading: ConsolidatedReading = {
    id: 'reading-uuid-1234',
    meterCode: 'MED-123456',
    condition: 'Normal',
    currentReading: 150,
    previousReading: null,
    averageConsumption: null,
    consumption: null,
    isAnomaly: false,
    anomalyConfirmed: false,
    hasNoPreviousData: true,
    capturedAt: '2026-10-28T10:00:00.000Z',
    status: 'PENDING_VERIFICATION',
  };

  describe('isReadingEligibleForSync', () => {
    it('debe considerar elegibles lecturas en PENDING_SYNC y PENDING_VERIFICATION', () => {
      expect(isReadingEligibleForSync({ ...baseReading, status: 'PENDING_SYNC' })).toBe(true);
      expect(isReadingEligibleForSync({ ...baseReading, status: 'PENDING_VERIFICATION' })).toBe(true);
    });

    it('NO debe considerar elegibles lecturas en SUBMITTED o REQUIRES_ATTENTION', () => {
      expect(isReadingEligibleForSync({ ...baseReading, status: 'SUBMITTED' })).toBe(false);
      expect(isReadingEligibleForSync({ ...baseReading, status: 'REQUIRES_ATTENTION' })).toBe(false);
    });
  });

  describe('evaluateDeferredReading', () => {
    const baseOfficeMeter: MeterRecord = {
      code: 'MED-123456',
      address: 'Av. Amazonas',
      sector: 'Iñaquito',
      accountNumber: '12345678',
      status: 'active',
      lastReading: { value: 100, date: '2026-09-25T10:00:00Z' },
      averageConsumption: 30,
    };

    it('si el medidor no existe en el catastro de oficina (null), pasa a REQUIRES_ATTENTION y detiene el envío', () => {
      const result = evaluateDeferredReading(baseReading, null);

      expect(result.status).toBe('REQUIRES_ATTENTION');
      expect(result.requiresAttentionReason).toBe('Medidor inexistente en catastro');
      expect(result.isAnomaly).toBe(false);
      expect(result.consumption).toBeNull();
    });

    it('si el medidor existe pero no tiene lecturas anteriores ni promedio en oficina, pasa a PENDING_SYNC con hasNoPreviousData: true', () => {
      const officeMeter: MeterRecord = {
        ...baseOfficeMeter,
        lastReading: { value: null as any, date: '' },
        averageConsumption: null as any,
      };

      const result = evaluateDeferredReading(baseReading, officeMeter);

      expect(result.status).toBe('PENDING_SYNC');
      expect(result.hasNoPreviousData).toBe(true);
      expect(result.consumption).toBeNull();
      expect(result.isAnomaly).toBe(false);
    });

    it('si la lectura actual es menor que la anterior de oficina, pasa a REQUIRES_ATTENTION por incongruencia', () => {
      const officeMeter: MeterRecord = {
        ...baseOfficeMeter,
        lastReading: { value: 200, date: '2026-09-25T10:00:00Z' },
        averageConsumption: 20,
      };

      const result = evaluateDeferredReading({ ...baseReading, currentReading: 150 }, officeMeter);

      expect(result.status).toBe('REQUIRES_ATTENTION');
      expect(result.requiresAttentionReason?.toLowerCase()).toContain('incongruencia');
    });

    it('si el consumo calculado es normal (<= 3x promedio), pasa a PENDING_SYNC con consumo asignado', () => {
      const officeMeter: MeterRecord = {
        ...baseOfficeMeter,
        lastReading: { value: 100, date: '2026-09-25T10:00:00Z' },
        averageConsumption: 30, // Consumo = 150 - 100 = 50. 3x = 90. 50 <= 90
      };

      const result = evaluateDeferredReading({ ...baseReading, currentReading: 150 }, officeMeter);

      expect(result.status).toBe('PENDING_SYNC');
      expect(result.consumption).toBe(50);
      expect(result.isAnomaly).toBe(false);
    });

    it('si el consumo es anómalo (> 3x promedio) y no tiene foto ni confirmación, detiene el envío y pasa a REQUIRES_ATTENTION', () => {
      const officeMeter: MeterRecord = {
        ...baseOfficeMeter,
        lastReading: { value: 100, date: '2026-09-25T10:00:00Z' },
        averageConsumption: 10, // Consumo = 150 - 100 = 50. 3x = 30. 50 > 30 (Anomalía)
      };

      const result = evaluateDeferredReading(
        { ...baseReading, currentReading: 150, photoUri: null, anomalyConfirmed: false },
        officeMeter
      );

      expect(result.status).toBe('REQUIRES_ATTENTION');
      expect(result.isAnomaly).toBe(true);
      expect(result.consumption).toBe(50);
      expect(result.requiresAttentionReason).toContain('anomalía');
    });

    it('si el consumo es anómalo (> 3x promedio) pero ya contaba con foto y confirmación previa, pasa a PENDING_SYNC', () => {
      const officeMeter: MeterRecord = {
        ...baseOfficeMeter,
        lastReading: { value: 100, date: '2026-09-25T10:00:00Z' },
        averageConsumption: 10, // 50 > 30
      };

      const result = evaluateDeferredReading(
        {
          ...baseReading,
          currentReading: 150,
          photoUri: 'file:///data/photo.jpg',
          anomalyConfirmed: true,
        },
        officeMeter
      );

      expect(result.status).toBe('PENDING_SYNC');
      expect(result.isAnomaly).toBe(true);
      expect(result.anomalyConfirmed).toBe(true);
      expect(result.consumption).toBe(50);
    });

    it('si la condición es Inaccesible, lectura actual es null, pasa a PENDING_SYNC sin cálculo de consumo', () => {
      const officeMeter: MeterRecord = {
        ...baseOfficeMeter,
        lastReading: { value: 100, date: '2026-09-25T10:00:00Z' },
        averageConsumption: 10,
      };

      const result = evaluateDeferredReading(
        {
          ...baseReading,
          condition: 'Inaccesible',
          currentReading: null,
          inaccessibilityReason: 'Perro bravo en el predio',
        },
        officeMeter
      );

      expect(result.status).toBe('PENDING_SYNC');
      expect(result.consumption).toBeNull();
      expect(result.isAnomaly).toBe(false);
    });
  });

  describe('buildCommercialPayload', () => {
    it('construye el payload comercial exacto con clientReadingId inmutable y referencia a foto local', () => {
      const reading: ConsolidatedReading = {
        id: 'uuid-client-999',
        meterCode: 'MED-654321',
        condition: 'Dañado',
        damageDescription: 'Vidrio roto y empañado',
        currentReading: 210,
        previousReading: 200,
        averageConsumption: 15,
        consumption: 10,
        isAnomaly: false,
        anomalyConfirmed: false,
        photoUri: 'file:///local/storage/photos/med-654321.jpg',
        hasNoPreviousData: false,
        capturedAt: '2026-10-28T09:30:00.000Z',
        status: 'PENDING_SYNC',
      };

      const payload = buildCommercialPayload(reading, '2026-10-28T10:15:00.000Z');

      expect(payload).toEqual({
        clientReadingId: 'uuid-client-999',
        meterCode: 'MED-654321',
        condition: 'Dañado',
        damageDescription: 'Vidrio roto y empañado',
        currentReading: 210,
        consumption: 10,
        isAnomaly: false,
        anomalyConfirmed: false,
        localPhotoUri: 'file:///local/storage/photos/med-654321.jpg',
        capturedAt: '2026-10-28T09:30:00.000Z',
        syncedAt: '2026-10-28T10:15:00.000Z',
      });
    });
  });
});
