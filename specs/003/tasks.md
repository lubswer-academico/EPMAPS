# Tareas de Implementación – Spec 003: Captura multipantalla de lectura, anomalías, fotografía y recuperación de borrador

Total de tareas atómicas: 5 (máximo permitido: 10). Enfoque estricto en lógica de dominio, persistencia local y orquestación de estado bajo KISS/YAGNI.

---

- [ ] **T1. Tipos de dominio y reglas puras de cálculo de consumo, consistencia y anomalías.** RF-5, RF-6, RF-7, RF-8, RF-9
  - Ubicación: `src/domain/reading/types.ts` y `src/domain/reading/readingRules.ts`
  - Hecho cuando: Las pruebas unitarias en `src/domain/reading/__tests__/readingRules.test.ts` verifiquen la fórmula de consumo (`actual - anterior`), rechazo por consistencia cuando `actual < anterior`, detección de anomalía (> 3x promedio), obligatoriedad de confirmación y lectura opcional en condición Dañado, finalizando en verde con `npx jest src/domain/reading/__tests__/readingRules.test.ts`.

- [ ] **T2. Matriz de obligatoriedad según condición física y validación de pasos del wizard.** RF-1, RF-2, RF-3, RF-4, RF-10
  - Ubicación: `src/domain/reading/readingRules.ts`
  - Hecho cuando: Las pruebas unitarias en `src/domain/reading/__tests__/readingRules.test.ts` verifiquen la obligatoriedad de motivo en Inaccesible, descripción en Dañado, lectura en Normal, y foto condicional (obligatoria en Dañado o Anomalía; opcional en Normal o Inaccesible), finalizando en verde con `npx jest src/domain/reading/__tests__/readingRules.test.ts`.

- [ ] **T3. Persistencia directa de borrador en caliente y cola local de lecturas consolidadas.** RF-13, RF-14, RF-15, RNF-1, RNF-3
  - Ubicación: `src/storage/reading/readingDraftStorage.ts`
  - Hecho cuando: Las pruebas unitarias en `src/storage/reading/__tests__/readingDraftStorage.test.ts` validen el guardado y recuperación de borrador con AsyncStorage, eliminación atómica de borrador, guardado en cola local persistente e incremento del contador de pendientes, finalizando en verde con `npx jest src/storage/reading/__tests__/readingDraftStorage.test.ts`.

- [ ] **T4. Adaptador de servicio de captura fotográfica y persistencia de archivos en disco local.** RF-10, RF-11, RF-12, RNF-2
  - Ubicación: `src/services/photo/photoService.ts`
  - Requiere: ADR-REQ-01 y ADR-REQ-02 de `specs/003/plan.md`
  - Hecho cuando: El módulo implemente la solicitud de permisos, captura de foto, copia duradera a almacenamiento permanente con identificador de medidor y eliminación de archivos huérfanos, con chequeo de tipos limpio (`npx tsc --noEmit`).

- [ ] **T5. Controlador de estado y flujo multipantalla (Wizard) con auto-guardado y detección de borrador.** RF-1, RF-2, RF-3, RF-4, RF-7, RF-11, RF-12, RF-13, RF-14, RF-15
  - Ubicación: `src/presentation/reading/useReadingWizardController.ts`
  - Requiere: ADR-REQ-01 y ADR-REQ-02 de `specs/003/plan.md`
  - Hecho cuando: El hook orqueste la detección/reanudación/descarte de borrador al inicio, el auto-guardado en caliente ante cambios, la transición reactiva entre pasos según validaciones, la captura fotográfica y la consolidación final en cola, verificable con chequeo de tipos limpio (`npx tsc --noEmit`).
