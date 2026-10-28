import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveDraft,
  getDraft,
  clearDraft,
  saveConsolidatedReading,
  getPendingReadingsCount,
  getPendingReadingsQueue,
} from '../readingDraftStorage';
import { ReadingDraft, ConsolidatedReading } from '../../../domain/reading/types';

jest.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn(async (key: string) => store[key] || null),
    setItem: jest.fn(async (key: string, val: string) => {
      store[key] = val;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete store[key];
    }),
    clear: jest.fn(async () => {
      store = {};
    }),
  };
});

describe('Reading Draft & Queue Storage (readingDraftStorage)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  const mockDraft: ReadingDraft = {
    meterCode: 'MED-123456',
    condition: 'Normal',
    currentReading: 120,
    previousReading: 100,
    averageConsumption: 20,
    hasNoPreviousData: false,
    consumption: 20,
    isAnomaly: false,
    anomalyConfirmed: false,
    photoUri: null,
    currentStep: 2,
    createdAt: '2026-10-28T10:00:00Z',
    updatedAt: '2026-10-28T10:05:00Z',
  };

  it('saves draft and retrieves it successfully', async () => {
    await saveDraft(mockDraft);
    const retrieved = await getDraft('MED-123456');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.meterCode).toBe('MED-123456');
    expect(retrieved?.currentReading).toBe(120);
    expect(retrieved?.currentStep).toBe(2);
  });

  it('returns null when draft does not exist', async () => {
    const retrieved = await getDraft('MED-999999');
    expect(retrieved).toBeNull();
  });

  it('clears draft specifically for a meter', async () => {
    await saveDraft(mockDraft);
    await clearDraft('MED-123456');
    const retrieved = await getDraft('MED-123456');
    expect(retrieved).toBeNull();
  });

  it('saves consolidated reading into queue, increments count and removes draft', async () => {
    await saveDraft(mockDraft);

    const consolidated: ConsolidatedReading = {
      id: 'READING-1',
      meterCode: 'MED-123456',
      condition: 'Normal',
      currentReading: 120,
      previousReading: 100,
      averageConsumption: 20,
      consumption: 20,
      isAnomaly: false,
      anomalyConfirmed: false,
      photoUri: null,
      hasNoPreviousData: false,
      capturedAt: '2026-10-28T10:10:00Z',
      status: 'PENDING_SYNC',
    };

    expect(await getPendingReadingsCount()).toBe(0);

    await saveConsolidatedReading(consolidated);

    expect(await getPendingReadingsCount()).toBe(1);
    const draft = await getDraft('MED-123456');
    expect(draft).toBeNull(); // Draft was cleared upon consolidation

    const queue = await getPendingReadingsQueue();
    expect(queue.length).toBe(1);
    expect(queue[0].meterCode).toBe('MED-123456');
  });

  it('accumulates multiple consolidated readings in queue', async () => {
    const reading1: ConsolidatedReading = {
      id: 'READING-1',
      meterCode: 'MED-111111',
      condition: 'Normal',
      currentReading: 50,
      capturedAt: '2026-10-28T10:00:00Z',
      status: 'PENDING_SYNC',
      isAnomaly: false,
      anomalyConfirmed: false,
      hasNoPreviousData: false,
    };
    const reading2: ConsolidatedReading = {
      id: 'READING-2',
      meterCode: 'MED-222222',
      condition: 'Inaccesible',
      inaccessibilityReason: 'Perro bravo',
      capturedAt: '2026-10-28T10:15:00Z',
      status: 'PENDING_SYNC',
      isAnomaly: false,
      anomalyConfirmed: false,
      hasNoPreviousData: false,
    };

    await saveConsolidatedReading(reading1);
    await saveConsolidatedReading(reading2);

    expect(await getPendingReadingsCount()).toBe(2);
    const queue = await getPendingReadingsQueue();
    expect(queue).toHaveLength(2);
    expect(queue[1].inaccessibilityReason).toBe('Perro bravo');
  });
});
