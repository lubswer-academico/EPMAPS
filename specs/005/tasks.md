# Tareas de Implementación – Spec 005
## Verificación diferida y sincronización automática sin duplicados

- [x] **T1. Modelo de datos y reglas de dominio para sincronización e idempotencia.** RF-5, RF-6, RF-7, RF-8, RF-10, RF-12
  - Extender el tipo `ReadingStatus` con `'REQUIRES_ATTENTION'` y definir `OfficeSyncPayload` en `src/domain/reading/types.ts`. Implementar funciones puras en `src/domain/sync/syncRules.ts`: `isReadingEligibleForSync`, `evaluateDeferredVerification` (cálculo de consumo contra histórico y retención por anomalía > 3x sin foto) y `buildOfficeSyncPayload` (idempotencia con `clientReadingId`).
  - Hecho cuando: Las pruebas unitarias en `src/domain/sync/__tests__/syncRules.test.ts` pasen en verde con `npx jest src/domain/sync/__tests__/syncRules.test.ts`.

- [x] **T2. Reglas de cola y soporte para lecturas que requieren atención.** RF-8, RF-9, RF-14
  - Adaptar `src/domain/readingQueue/queueRules.ts` para categorizar lecturas en estado `'REQUIRES_ATTENTION'` dentro de los filtros y conteos pendientes (`getPendingCount`), asociar su etiqueta en español ("Requiere atención") y permitir su edición in-place para subsanar la anomalía.
  - Hecho cuando: Las pruebas unitarias en `src/domain/readingQueue/__tests__/queueRules.test.ts` pasen en verde con `npx jest src/domain/readingQueue/__tests__/queueRules.test.ts`.

- [x] **T3. Persistencia de transiciones de sincronización en almacenamiento local.** RF-11, RF-13, RF-14, RNF-1
  - Extender `src/storage/reading/readingDraftStorage.ts` con funciones para actualizar el estado operativo de lecturas individuales (`markReadingAsSubmitted`, `markReadingAsRequiresAttention`, `markReadingAsVerifiedSync`) garantizando atomicidad y marca temporal de sincronización (`syncedAt`).
  - Hecho cuando: Las pruebas unitarias de persistencia en `src/storage/reading/__tests__/readingDraftStorage.test.ts` pasen en verde verificando las transiciones de estado y persistencia de `syncedAt`.

- [x] **T4. Servicio cliente de verificación diferida y envío HTTP a oficina.** RF-5, RF-6, RF-11, RF-12, RF-13
  - Implementar `src/services/syncService.ts` utilizando `officeHttpClient` (Axios) para consultar la ficha en `/medidores`, evaluar diferidamente el consumo y despachar el payload comercial consolidado a `/lecturas` con `clientReadingId` y la URI local de la fotografía.
  - Hecho cuando: Las pruebas de servicio en `src/services/__tests__/syncService.test.ts` pasen en verde simulando respuestas de MockAPI (200/201, microcortes, duplicados y 404).

- [x] **T5. Controlador hook y disparadores de sincronización con bloqueo mutex en UI.** RF-1, RF-2, RF-3, RF-4, RF-9, RF-14
  - Crear el hook `src/presentation/sync/useSyncEngine.ts` que escuche cambios de conexión en `networkMonitor` para sincronización reactiva automática e implemente disparo manual con mutex (`isSyncing`). Integrar el hook y el botón "Sincronizar ahora" con alerta visual de "Requiere atención" en `src/app/reading-queue.tsx`.
  - Hecho cuando: Las pruebas de integración del hook en `src/presentation/sync/__tests__/useSyncEngine.test.ts` pasen en verde y la interfaz en `reading-queue.tsx` actualice visualmente el contador a 0 y refleje las alertas.
