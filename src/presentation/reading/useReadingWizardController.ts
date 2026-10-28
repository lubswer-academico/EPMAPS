import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ConsumptionCalculationResult,
  MeterCondition,
  ReadingDraft,
  StepRequirements,
  ConsolidatedReading,
} from '../../domain/reading/types';
import {
  calculateConsumption,
  checkConsumptionAnomaly,
  getStepRequirements,
  validateStepCompletion,
  createInitialDraft,
} from '../../domain/reading/readingRules';
import {
  saveDraft,
  getDraft,
  clearDraft,
  saveConsolidatedReading,
} from '../../storage/reading/readingDraftStorage';
import {
  takeMeterPhoto,
  persistPhoto,
  deletePhoto,
  requestCameraPermissions,
} from '../../services/photo/photoService';

export interface UseReadingWizardControllerProps {
  meterCode: string;
  previousReading?: number | null;
  averageConsumption?: number | null;
  hasNoPreviousData?: boolean;
}

export function useReadingWizardController({
  meterCode,
  previousReading,
  averageConsumption,
  hasNoPreviousData = false,
}: UseReadingWizardControllerProps) {
  const [draft, setDraft] = useState<ReadingDraft>(() =>
    createInitialDraft(meterCode, previousReading, averageConsumption, hasNoPreviousData)
  );
  const [hasExistingDraft, setHasExistingDraft] = useState<boolean>(false);
  const [existingDraftData, setExistingDraftData] = useState<ReadingDraft | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState<boolean>(false);

  // Detección inicial de borrador previo para este medidor
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const saved = await getDraft(meterCode);
      if (saved && isMounted) {
        setHasExistingDraft(true);
        setExistingDraftData(saved);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [meterCode]);

  // Consumo y validación de consistencia en tiempo real
  const consumptionInfo: ConsumptionCalculationResult = useMemo(() => {
    if (draft.condition === 'Inaccesible') {
      return {
        hasPreviousReading: draft.previousReading !== null && draft.previousReading !== undefined,
        consumption: null,
        isValidConsistency: true,
      };
    }
    if (draft.currentReading === null || draft.currentReading === undefined) {
      return {
        hasPreviousReading: draft.previousReading !== null && draft.previousReading !== undefined,
        consumption: null,
        isValidConsistency: true,
        isPendingVerification: draft.hasNoPreviousData,
      };
    }
    return calculateConsumption(draft.currentReading, draft.previousReading);
  }, [draft.currentReading, draft.previousReading, draft.condition, draft.hasNoPreviousData]);

  // Detección determinista de anomalía (> 3x promedio)
  const isAnomaly = useMemo(() => {
    if (draft.condition === 'Inaccesible') return false;
    return checkConsumptionAnomaly(consumptionInfo.consumption, draft.averageConsumption);
  }, [consumptionInfo.consumption, draft.averageConsumption, draft.condition]);

  // Requisitos dinámicos por condición y anomalía
  const requirements: StepRequirements = useMemo(() => {
    return getStepRequirements(draft.condition, isAnomaly);
  }, [draft.condition, isAnomaly]);

  // Actualizar automáticamente consumo y flag isAnomaly en el borrador
  useEffect(() => {
    setDraft((prev) => {
      if (prev.consumption !== consumptionInfo.consumption || prev.isAnomaly !== isAnomaly) {
        return {
          ...prev,
          consumption: consumptionInfo.consumption,
          isAnomaly,
        };
      }
      return prev;
    });
  }, [consumptionInfo.consumption, isAnomaly]);

  // Auto-guardado en caliente en AsyncStorage ante mutaciones del borrador
  const persistDraftState = useCallback(async (updatedDraft: ReadingDraft) => {
    await saveDraft(updatedDraft);
  }, []);

  const setCondition = useCallback(
    (condition: MeterCondition) => {
      setValidationError(null);
      setDraft((prev) => {
        const updated: ReadingDraft = {
          ...prev,
          condition,
          currentReading: condition === 'Inaccesible' ? null : prev.currentReading,
          inaccessibilityReason: condition === 'Inaccesible' ? prev.inaccessibilityReason : '',
          damageDescription: condition === 'Dañado' ? prev.damageDescription : '',
          updatedAt: new Date().toISOString(),
        };
        persistDraftState(updated);
        return updated;
      });
    },
    [persistDraftState]
  );

  const setInaccessibilityReason = useCallback(
    (reason: string) => {
      setValidationError(null);
      setDraft((prev) => {
        const updated = { ...prev, inaccessibilityReason: reason, updatedAt: new Date().toISOString() };
        persistDraftState(updated);
        return updated;
      });
    },
    [persistDraftState]
  );

  const setDamageDescription = useCallback(
    (description: string) => {
      setValidationError(null);
      setDraft((prev) => {
        const updated = { ...prev, damageDescription: description, updatedAt: new Date().toISOString() };
        persistDraftState(updated);
        return updated;
      });
    },
    [persistDraftState]
  );

  const setCurrentReading = useCallback(
    (readingStr: string) => {
      setValidationError(null);
      const numericValue = readingStr.trim() === '' ? null : Number(readingStr);
      setDraft((prev) => {
        const updated = {
          ...prev,
          currentReading: isNaN(numericValue as number) ? null : numericValue,
          // Si cambia la lectura, resetear la confirmación de anomalía si no coincide
          anomalyConfirmed: false,
          updatedAt: new Date().toISOString(),
        };
        persistDraftState(updated);
        return updated;
      });
    },
    [persistDraftState]
  );

  const setAnomalyConfirmed = useCallback(
    (confirmed: boolean) => {
      setValidationError(null);
      setDraft((prev) => {
        const updated = { ...prev, anomalyConfirmed: confirmed, updatedAt: new Date().toISOString() };
        persistDraftState(updated);
        return updated;
      });
    },
    [persistDraftState]
  );

  const resumeExistingDraft = useCallback(() => {
    if (existingDraftData) {
      setDraft(existingDraftData);
    }
    setHasExistingDraft(false);
  }, [existingDraftData]);

  const discardExistingDraft = useCallback(async () => {
    if (existingDraftData?.photoUri) {
      await deletePhoto(existingDraftData.photoUri);
    }
    await clearDraft(meterCode);
    const freshDraft = createInitialDraft(
      meterCode,
      previousReading,
      averageConsumption,
      hasNoPreviousData
    );
    setDraft(freshDraft);
    setHasExistingDraft(false);
    setExistingDraftData(null);
  }, [existingDraftData, meterCode, previousReading, averageConsumption, hasNoPreviousData]);

  const goToNextStep = useCallback(() => {
    const validation = validateStepCompletion(draft.currentStep, draft, requirements);
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Verifique los campos requeridos');
      return;
    }
    setValidationError(null);

    setDraft((prev) => {
      const nextStep = Math.min(prev.currentStep + 1, 3) as 1 | 2 | 3;
      const updated = { ...prev, currentStep: nextStep, updatedAt: new Date().toISOString() };
      persistDraftState(updated);
      return updated;
    });
  }, [draft, requirements, persistDraftState]);

  const goToPreviousStep = useCallback(() => {
    setValidationError(null);
    setDraft((prev) => {
      const prevStep = Math.max(prev.currentStep - 1, 1) as 1 | 2 | 3;
      const updated = { ...prev, currentStep: prevStep, updatedAt: new Date().toISOString() };
      persistDraftState(updated);
      return updated;
    });
  }, [persistDraftState]);

  const capturePhoto = useCallback(async () => {
    setValidationError(null);
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      setCameraPermissionDenied(true);
      return;
    }
    setCameraPermissionDenied(false);

    const tempUri = await takeMeterPhoto();
    if (tempUri) {
      try {
        // Si ya había una foto previa, eliminar la anterior
        if (draft.photoUri) {
          await deletePhoto(draft.photoUri);
        }
        const permanentUri = await persistPhoto(tempUri, draft.meterCode);
        setDraft((prev) => {
          const updated = { ...prev, photoUri: permanentUri, updatedAt: new Date().toISOString() };
          persistDraftState(updated);
          return updated;
        });
      } catch (err) {
        console.error('Error al guardar la foto tomada:', err);
        setValidationError('Error al almacenar la fotografía en el dispositivo');
      }
    }
  }, [draft.photoUri, draft.meterCode, persistDraftState]);

  const removePhoto = useCallback(async () => {
    if (draft.photoUri) {
      await deletePhoto(draft.photoUri);
    }
    setDraft((prev) => {
      const updated = { ...prev, photoUri: null, updatedAt: new Date().toISOString() };
      persistDraftState(updated);
      return updated;
    });
  }, [draft.photoUri, persistDraftState]);

  const submitFinalReading = useCallback(async (): Promise<boolean> => {
    const validation = validateStepCompletion(3, draft, requirements);
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Complete los requisitos de la fotografía');
      return false;
    }

    setIsSaving(true);
    try {
      const consolidated: ConsolidatedReading = {
        id: `READ-${Date.now()}-${draft.meterCode}`,
        meterCode: draft.meterCode,
        condition: draft.condition,
        inaccessibilityReason: draft.inaccessibilityReason,
        damageDescription: draft.damageDescription,
        currentReading: draft.currentReading,
        previousReading: draft.previousReading,
        averageConsumption: draft.averageConsumption,
        consumption: draft.consumption,
        isAnomaly: draft.isAnomaly,
        anomalyConfirmed: draft.anomalyConfirmed,
        photoUri: draft.photoUri,
        hasNoPreviousData: draft.hasNoPreviousData,
        capturedAt: new Date().toISOString(),
        status: 'PENDING_SYNC',
      };

      await saveConsolidatedReading(consolidated);
      setIsSaving(false);
      return true;
    } catch (err) {
      console.error('Error al consolidar la lectura:', err);
      setIsSaving(false);
      setValidationError('No se pudo guardar la lectura en la cola local');
      return false;
    }
  }, [draft, requirements]);

  return {
    currentStep: draft.currentStep,
    draft,
    requirements,
    consumptionInfo,
    isAnomaly,
    hasExistingDraft,
    isSaving,
    cameraPermissionDenied,
    validationError,
    setCondition,
    setInaccessibilityReason,
    setDamageDescription,
    setCurrentReading,
    setAnomalyConfirmed,
    goToNextStep,
    goToPreviousStep,
    capturePhoto,
    removePhoto,
    resumeExistingDraft,
    discardExistingDraft,
    submitFinalReading,
  };
}
