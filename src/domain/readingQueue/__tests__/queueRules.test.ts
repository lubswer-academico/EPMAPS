import {
  filterReadings,
  sortReadingsDesc,
  formatReadingStatusLabel,
  isReadingEditable,
  applyReadingUpdate,
  getPendingCount,
} from '../queueRules';
import { ConsolidatedReading, QueueFilter } from '../types';

describe('Queue Rules Domain Logic (queueRules)', () => {
  const sampleReadings: ConsolidatedReading[] = [
    {
      id: 'read-1',
      meterCode: 'MED-100001',
      condition: 'Normal',
      currentReading: 120,
      previousReading: 100,
      consumption: 20,
      isAnomaly: false,
      anomalyConfirmed: false,
      photoUri: null,
      hasNoPreviousData: false,
      capturedAt: '2026-10-25T10:00:00.000Z',
      status: 'PENDING_SYNC',
    },
    {
      id: 'read-2',
      meterCode: 'MED-100002',
      condition: 'Normal',
      currentReading: 250,
      previousReading: null,
      consumption: null,
      isAnomaly: false,
      anomalyConfirmed: false,
      photoUri: null,
      hasNoPreviousData: true,
      capturedAt: '2026-10-27T15:30:00.000Z',
      status: 'PENDING_VERIFICATION',
    },
    {
      id: 'read-3',
      meterCode: 'MED-100003',
      condition: 'Inaccesible',
      inaccessibilityReason: 'Perro bravo en el predio',
      currentReading: null,
      previousReading: 50,
      consumption: null,
      isAnomaly: false,
      anomalyConfirmed: false,
      photoUri: null,
      hasNoPreviousData: false,
      capturedAt: '2026-10-26T08:00:00.000Z',
      status: 'SUBMITTED',
      syncedAt: '2026-10-26T09:00:00.000Z',
    },
  ];

  describe('filterReadings', () => {
    it('returns all readings when filter is "all"', () => {
      const result = filterReadings(sampleReadings, 'all');
      expect(result).toHaveLength(3);
      expect(result).toEqual(sampleReadings);
    });

    it('returns both PENDING_VERIFICATION and PENDING_SYNC when filter is "pending"', () => {
      const result = filterReadings(sampleReadings, 'pending');
      expect(result).toHaveLength(2);
      expect(result.map(r => r.id)).toEqual(['read-1', 'read-2']);
    });

    it('returns only SUBMITTED when filter is "submitted"', () => {
      const result = filterReadings(sampleReadings, 'submitted');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('read-3');
    });

    it('returns empty array when no readings match the filter', () => {
      const onlySubmitted = [sampleReadings[2]];
      const result = filterReadings(onlySubmitted, 'pending');
      expect(result).toEqual([]);
    });
  });

  describe('sortReadingsDesc', () => {
    it('orders readings chronologically descending by capturedAt', () => {
      const sorted = sortReadingsDesc(sampleReadings);
      expect(sorted.map(r => r.id)).toEqual(['read-2', 'read-3', 'read-1']);
    });

    it('does not mutate the original array', () => {
      const originalCopy = [...sampleReadings];
      sortReadingsDesc(sampleReadings);
      expect(sampleReadings).toEqual(originalCopy);
    });
  });

  describe('formatReadingStatusLabel', () => {
    it('maps PENDING_VERIFICATION to "Pendiente de verificar"', () => {
      expect(formatReadingStatusLabel('PENDING_VERIFICATION')).toBe('Pendiente de verificar');
    });

    it('maps PENDING_SYNC to "Pendiente de enviar"', () => {
      expect(formatReadingStatusLabel('PENDING_SYNC')).toBe('Pendiente de enviar');
    });

    it('maps SUBMITTED to "Enviada"', () => {
      expect(formatReadingStatusLabel('SUBMITTED')).toBe('Enviada');
    });

    it('maps REQUIRES_ATTENTION to "Requiere atención"', () => {
      expect(formatReadingStatusLabel('REQUIRES_ATTENTION')).toBe('Requiere atención');
    });
  });

  describe('isReadingEditable (Inmutabilidad)', () => {
    it('returns true for PENDING_SYNC reading', () => {
      expect(isReadingEditable(sampleReadings[0])).toBe(true);
    });

    it('returns true for PENDING_VERIFICATION reading', () => {
      expect(isReadingEditable(sampleReadings[1])).toBe(true);
    });

    it('returns true for REQUIRES_ATTENTION reading', () => {
      const attentionReading: ConsolidatedReading = {
        ...sampleReadings[0],
        status: 'REQUIRES_ATTENTION',
      };
      expect(isReadingEditable(attentionReading)).toBe(true);
    });

    it('returns false for SUBMITTED reading', () => {
      expect(isReadingEditable(sampleReadings[2])).toBe(false);
    });
  });

  describe('applyReadingUpdate', () => {
    it('applies changes while preserving id, meterCode and original capturedAt, adding updatedAt', () => {
      const original = sampleReadings[0];
      const updated = applyReadingUpdate(original, {
        currentReading: 135,
        consumption: 35,
      });

      expect(updated.id).toBe(original.id);
      expect(updated.meterCode).toBe(original.meterCode);
      expect(updated.capturedAt).toBe(original.capturedAt);
      expect(updated.currentReading).toBe(135);
      expect(updated.consumption).toBe(35);
      expect(updated.updatedAt).toBeDefined();
    });

    it('ignora cambios en meterCode preservando el original del registro', () => {
      const original = sampleReadings[0];
      const updated = applyReadingUpdate(original, {
        meterCode: 'MED-999999',
      });

      expect(updated.id).toBe(original.id);
      expect(updated.meterCode).toBe(original.meterCode);
      expect(updated.capturedAt).toBe(original.capturedAt);
    });

    it('throws error if attempting to update a SUBMITTED reading', () => {
      const submitted = sampleReadings[2];
      expect(() => {
        applyReadingUpdate(submitted, { currentReading: 999 });
      }).toThrow('No es posible modificar una lectura ya enviada a la oficina.');
    });
  });

  describe('getPendingCount', () => {
    it('counts all readings with status !== SUBMITTED including REQUIRES_ATTENTION', () => {
      const readingsWithAttention: ConsolidatedReading[] = [
        ...sampleReadings,
        { ...sampleReadings[0], id: 'read-4', status: 'REQUIRES_ATTENTION' },
      ];
      expect(getPendingCount(readingsWithAttention)).toBe(3);
    });

    it('counts all readings with status !== SUBMITTED', () => {
      expect(getPendingCount(sampleReadings)).toBe(2);
    });

    it('returns 0 if all readings are SUBMITTED', () => {
      expect(getPendingCount([sampleReadings[2]])).toBe(0);
    });

    it('returns 0 for empty array', () => {
      expect(getPendingCount([])).toBe(0);
    });
  });
});
