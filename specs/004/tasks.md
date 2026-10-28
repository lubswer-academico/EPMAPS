# Tareas de Implementación – Spec 004
Bandeja de lecturas offline, registro sin señal y corrección de lecturas no enviadas

Listado secuencial y atómico de tareas (KISS / YAGNI, máximo 10 tareas):

- [x] **T1. Lógica pura de filtrado, ordenamiento e inmutabilidad de la bandeja.** RF-1, RF-2, RF-3, RF-16, RF-18
  - Archivos: `src/domain/reading/types.ts`, `src/domain/readingQueue/queueRules.ts`, `src/domain/readingQueue/__tests__/queueRules.test.ts`
  - Hecho cuando: Las funciones puras de filtrado por estado (`all`, `pending`, `submitted`), orden descendente por `capturedAt`, cálculo del contador de pendientes, y bloqueo estricto de edición para lecturas con `status === 'SUBMITTED'` pasan todas las pruebas en Jest en verde (`npx jest queueRules.test.ts`).

- [x] **T2. Persistencia y actualización in-place de la cola local.** RF-5, RF-7, RF-11
  - Archivos: `src/storage/reading/readingDraftStorage.ts`, `src/storage/reading/__tests__/readingDraftStorage.test.ts`
  - Hecho cuando: Se implementan y prueban con éxito `updateConsolidatedReading`, `getReadingById` y `getReadingByMeterCode`, verificando que la edición actualiza el mismo registro manteniendo su `id` y fecha de captura original sin generar duplicados en AsyncStorage.

- [x] **T3. Controlador y ciclo de vida de edición y reemplazo de fotos.** RF-8, RF-10, RF-12, RF-13, RF-14, RF-15
  - Archivos: `src/presentation/reading/useReadingWizardController.ts`, `src/presentation/reading/__tests__/useReadingWizardController.test.ts`
  - Hecho cuando: El wizard permite inicializarse con una lectura existente precargada, valida reglas de consistencia física y anomalías al editar, invoca `deletePhoto` al reemplazar o desvincular una fotografía anterior, y guarda la actualización mediante `updateConsolidatedReading`.

- [x] **T4. Controlador de la bandeja y actualización en tiempo real del contador global.** RF-1, RF-3, RF-4, RF-6
  - Archivos: `src/presentation/readingQueue/useReadingQueueController.ts`, `src/presentation/session/useGlobalStatusController.ts`, `src/presentation/readingQueue/__tests__/useReadingQueueController.test.ts`
  - Hecho cuando: El hook controlador gestiona la carga de la cola, la alternancia de filtros (`all`, `pending`, `submitted`), y `useGlobalStatusController` refleja el conteo real y dinámico de lecturas pendientes de la cola en la barra superior `GlobalStatusBar`.

- [x] **T5. Pantallas de bandeja, detalle en solo lectura y enlace de navegación en obra blanca.** RF-1, RF-2, RF-4, RF-8, RF-9, RF-16, RF-17
  - Archivos: `src/app/reading-queue.tsx`, `src/app/reading-detail.tsx`, `src/app/home.tsx`, `src/app/meter-search.tsx`, `src/app/reading-wizard.tsx`
  - Hecho cuando: El técnico puede navegar desde `home` a la bandeja de lecturas, filtrar por estados, seleccionar una lectura pendiente para editarla en el wizard, abrir una lectura enviada en modo solo lectura bloqueando modificaciones, y acceder a la edición desde el aviso de duplicidad en `meter-search`.
