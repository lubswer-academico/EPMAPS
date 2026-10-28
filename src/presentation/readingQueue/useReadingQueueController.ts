import { useState, useEffect, useCallback, useMemo } from 'react';
import { ConsolidatedReading, QueueFilter } from '../../domain/reading/types';
import {
  filterReadings,
  sortReadingsDesc,
  getPendingCount,
  isReadingEditable,
} from '../../domain/readingQueue/queueRules';
import { getPendingReadingsQueue } from '../../storage/reading/readingDraftStorage';

export interface UseReadingQueueControllerReturn {
  readings: ConsolidatedReading[];
  filteredReadings: ConsolidatedReading[];
  filter: QueueFilter;
  isLoading: boolean;
  pendingCount: number;
  setFilter: (filter: QueueFilter) => void;
  loadQueue: () => Promise<void>;
  isReadingEditable: (reading: ConsolidatedReading) => boolean;
}

export function useReadingQueueController(): UseReadingQueueControllerReturn {
  const [readings, setReadings] = useState<ConsolidatedReading[]>([]);
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const queue = await getPendingReadingsQueue();
      const sorted = sortReadingsDesc(queue);
      setReadings(sorted);
    } catch (error) {
      console.error('Error al cargar la cola de lecturas:', error);
      setReadings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const filteredReadings = useMemo(() => {
    return filterReadings(readings, filter);
  }, [readings, filter]);

  const pendingCount = useMemo(() => {
    return getPendingCount(readings);
  }, [readings]);

  return {
    readings,
    filteredReadings,
    filter,
    isLoading,
    pendingCount,
    setFilter,
    loadQueue,
    isReadingEditable,
  };
}
