# Plan Técnico de Implementación – Spec 004
Bandeja de lecturas offline, registro sin señal y corrección de lecturas no enviadas

## 1. Responsabilidad de Archivos y Arquitectura

El diseño sigue una separación pragmática (KISS / YAGNI) bajo la Constitución del Proyecto y `AGENTS.md`:

### Dominio y Lógica Pura (`src/domain/readingQueue/` y `src/domain/reading/`)
- `src/domain/reading/types.ts`: Ampliación de tipos para incluir los estados operativos de una lectura:
  - `ReadingStatus`: `'PENDING_VERIFICATION'` ("Pendiente de verificar"), `'PENDING_SYNC'` ("Pendiente de enviar"), `'SUBMITTED'` ("Enviada").
  - `QueueFilter`: `'all'` | `'pending'` | `'submitted'`.
  - Atributos en `ConsolidatedReading`: `status: ReadingStatus`, `updatedAt?: string`, `syncedAt?: string`.
- `src/domain/readingQueue/queueRules.ts`: Funciones deterministas puras libres de React o almacenamiento:
  - `filterReadings(readings: ConsolidatedReading[], filter: QueueFilter): ConsolidatedReading[]`: Filtrado por estado operativo (donde `'pending'` incluye `'PENDING_VERIFICATION'` y `'PENDING_SYNC'`).
  - `sortReadingsDesc(readings: ConsolidatedReading[]): ConsolidatedReading[]`: Ordenamiento cronológico descendente por fecha de registro (`capturedAt`).
  - `formatReadingStatusLabel(status: ReadingStatus): string`: Mapeo oficial en español ("Pendiente de verificar", "Pendiente de enviar", "Enviada").
  - `isReadingEditable(reading: ConsolidatedReading): boolean`: Retorna `true` si el estado es `'PENDING_VERIFICATION'` o `'PENDING_SYNC'`; `false` si es `'SUBMITTED'`.
  - `validateReadingUpdate(original: ConsolidatedReading, updateData: Partial<ConsolidatedReading>): ConsolidatedReading`: Aplica la inmutabilidad si el registro original está en `'SUBMITTED'` (lanza error o retorna fallo); preserva `id`, `meterCode` y `capturedAt`, y actualiza `updatedAt`.
  - `getPendingCount(readings: ConsolidatedReading[]): number`: Conteo de lecturas pendientes (`status !== 'SUBMITTED'`) para la barra superior de estado.
- `src/domain/readingQueue/__tests__/queueRules.test.ts`: Pruebas unitarias completas de todas las funciones puras de la cola.

### Persistencia Directa (`src/storage/reading/`)
- `src/storage/reading/readingDraftStorage.ts`:
  - Utiliza la clave persistente autorizada `epmaps_pending_readings_queue_v1` en `AsyncStorage` (ADR-001).
  - Funciones ampliadas:
    - `getReadingById(id: string): Promise<ConsolidatedReading | null>`
    - `getReadingByMeterCode(meterCode: string): Promise<ConsolidatedReading | null>`
    - `updateConsolidatedReading(reading: ConsolidatedReading): Promise<void>`: Actualización in-place en la lista preservando su identificador y posición.
- `src/storage/reading/__tests__/readingQueueStorage.test.ts`: Pruebas de almacenamiento, recuperación y actualización in-place.

### Contrato de Presentación y Estado (`src/presentation/readingQueue/`)
- `src/presentation/readingQueue/useReadingQueueController.ts`: Hook controlador de la bandeja:
  - Expone: `readings`, `filteredReadings`, `filter`, `setFilter`, `isLoading`, `pendingCount`, `loadQueue`, `openReadingDetail`, `openReadingEdit`.
- `src/presentation/reading/useReadingWizardController.ts`:
  - Adaptación para soportar modo edición (`isEditMode`): precargar `initialReading` si se pasa un `readingId` o lectura existente, persistiendo los cambios con `updateConsolidatedReading` en lugar de agregar un nuevo elemento.
  - Gestión del ciclo de vida de fotografías: eliminación de la foto anterior con `deletePhoto(previousPhotoUri)` al capturar un reemplazo o borrar la foto si no es requerida.
- `src/presentation/session/useGlobalStatusController.ts`:
  - Conectar el contador dinámico de lecturas pendientes (`getPendingReadingsCount()`) para actualizar en tiempo real el valor mostrado en `GlobalStatusBar`.

### Capa de Vistas y Pantallas (`src/app/`)
- `src/app/reading-queue.tsx`: Pantalla de la bandeja de lecturas locales con selector de filtros (`Todas`, `Pendientes`, `Enviadas`), lista de tarjetas de lecturas y estado vacío si no hay coincidencias.
- `src/app/reading-detail.tsx`: Pantalla de detalle en solo lectura para registros `'SUBMITTED'` (o para consulta de cualquier lectura), sin acciones de edición ni borrado.
- `src/app/reading-wizard.tsx`: Adaptación para recibir parámetro opcional `readingId` para abrir en modo edición cuando se invoca desde la bandeja o desde el bloqueo preventivo de `meter-search.tsx`.
- `src/app/home.tsx`: Acceso directo a la "Bandeja de Lecturas" y visualización del avance del turno.
- `src/app/meter-search.tsx`: Conexión de la acción "Ver / Editar lectura pendiente" para abrir directamente la edición de la lectura encontrada en cola.

---

## 2. Dominio y Lógica Pura

Todas las reglas de negocio de la bandeja y cola se implementan como funciones puras y deterministas en `queueRules.ts`:

```typescript
// src/domain/readingQueue/queueRules.ts

export type QueueFilter = 'all' | 'pending' | 'submitted';

export function filterReadings(readings: ConsolidatedReading[], filter: QueueFilter): ConsolidatedReading[] {
  if (filter === 'pending') {
    return readings.filter(r => r.status === 'PENDING_VERIFICATION' || r.status === 'PENDING_SYNC');
  }
  if (filter === 'submitted') {
    return readings.filter(r => r.status === 'SUBMITTED');
  }
  return readings;
}

export function sortReadingsDesc(readings: ConsolidatedReading[]): ConsolidatedReading[] {
  return [...readings].sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
}

export function formatReadingStatusLabel(status: ReadingStatus): string {
  switch (status) {
    case 'PENDING_VERIFICATION':
      return 'Pendiente de verificar';
    case 'PENDING_SYNC':
      return 'Pendiente de enviar';
    case 'SUBMITTED':
      return 'Enviada';
  }
}

export function isReadingEditable(reading: ConsolidatedReading): boolean {
  return reading.status !== 'SUBMITTED';
}

export function applyReadingUpdate(
  original: ConsolidatedReading,
  changes: Partial<ConsolidatedReading>
): ConsolidatedReading {
  if (original.status === 'SUBMITTED') {
    throw new Error('No es posible modificar una lectura ya enviada a la oficina.');
  }
  return {
    ...original,
    ...changes,
    id: original.id, // Preservar identificador original
    meterCode: original.meterCode, // Preservar código de medidor
    capturedAt: original.capturedAt, // Preservar fecha original de captura
    updatedAt: new Date().toISOString(), // Registrar fecha de edición
  };
}

export function getPendingCount(readings: ConsolidatedReading[]): number {
  return readings.filter(r => r.status === 'PENDING_VERIFICATION' || r.status === 'PENDING_SYNC').length;
}
```

---

## 3. Persistencia Pragmática (KISS / YAGNI)

- Se mantiene una sola estructura plana en `AsyncStorage` bajo la clave `epmaps_pending_readings_queue_v1`.
- Para evitar sobreingeniería y clases intermedias, se agregan funciones directas en `src/storage/reading/readingDraftStorage.ts`:
  - `updateConsolidatedReading(updated: ConsolidatedReading)`: Busca el índice por `updated.id`, reemplaza la entidad in-place y serializa el arreglo completo.
  - `getReadingById(id: string)`: Encuentra la lectura por ID en la cola.
  - `getReadingByMeterCode(meterCode: string)`: Encuentra la lectura por código de medidor (para validar si ya está en cola desde la pantalla de búsqueda de medidores).
- Gestión del ciclo de vida de fotos:
  - Cuando se sustituye una foto o se borra una foto durante la edición, se invoca `deletePhoto(oldPhotoUri)` del servicio `photoService.ts` (basado en `expo-file-system/legacy`, ADR-006) eliminando los archivos huérfanos del almacenamiento.

---

## 4. Contrato de Presentación y Estado

### Hook `useReadingQueueController`:
- **Estado:**
  - `readings: ConsolidatedReading[]`: Lista completa ordenada.
  - `filter: QueueFilter`: Filtro seleccionado (`'all'`, `'pending'`, `'submitted'`).
  - `filteredReadings: ConsolidatedReading[]`: Lista filtrada y ordenada descendentemente.
  - `isLoading: boolean`: Estado de lectura de almacenamiento.
  - `pendingCount: number`: Total de lecturas con estado pendiente.
- **Acciones:**
  - `setFilter(filter: QueueFilter)`: Actualiza el filtro de visualización.
  - `reloadQueue()`: Recarga los datos de AsyncStorage.
  - `handleSelectReading(reading: ConsolidatedReading)`: Redirige a `/reading-wizard?readingId=...` si `isReadingEditable(reading)` es true, o a `/reading-detail?readingId=...` si es `'SUBMITTED'`.

---

## 5. Estrategia de Pruebas Automatizadas (Jest)

Mapeo de pruebas unitarias por Requisito Funcional:

| Requisito Funcional | Módulo a Probar | Escenario de Prueba en Jest |
| :--- | :--- | :--- |
| **RF-1, RF-2** | `queueRules.test.ts` | Ordenamiento cronológico descendente y mapeo de etiquetas de tarjetas. |
| **RF-3, RF-4** | `queueRules.test.ts` | Filtrado correcto por `all`, `pending` (agrupa `PENDING_VERIFICATION` y `PENDING_SYNC`) y `submitted`, detectando arrays vacíos. |
| **RF-5, RF-6, RF-7** | `readingRules.test.ts` / `readingDraftStorage.test.ts` | Guardado de lectura con estado `'PENDING_VERIFICATION'` cuando `hasNoPreviousData = true`; incremento de contador de pendientes. |
| **RF-8, RF-9, RF-10, RF-11** | `queueRules.test.ts` / `readingDraftStorage.test.ts` | Validación de edición: actualización in-place manteniendo `id`, `capturedAt` y actualizando `updatedAt` sin crear duplicados. |
| **RF-12, RF-13, RF-14, RF-15** | `useReadingWizardController.test.ts` | Precarga de foto existente, llamada a `deletePhoto` al reemplazarla o desvincularla, y bloqueo si la foto se vuelve obligatoria. |
| **RF-16, RF-17, RF-18** | `queueRules.test.ts` | Inmutabilidad de lecturas `SUBMITTED`: `isReadingEditable` retorna falso y `applyReadingUpdate` arroja excepción. |

---

## 6. # Decisiones ADR

### Análisis de Necesidades Técnicas Externas
En la Spec 004 se cubren:
1. Consulta y filtrado de la bandeja de lecturas locales del mes.
2. Actualización in-place y preservación de inmutabilidad en la cola persistente.
3. Precarga de datos para edición en el wizard existente.
4. Gestión del ciclo de vida y limpieza de fotos huérfanas en disco.

**Evaluación técnica:**
- El almacenamiento y recuperación de la cola local se realiza mediante `@react-native-async-storage/async-storage` (aprobado en **ADR-001**).
- La gestión y borrado de archivos de fotografías huérfanas se realiza mediante `expo-file-system/legacy` (aprobado en **ADR-006**) y `expo-image-picker` (aprobado en **ADR-005**).
- La ejecución de pruebas unitarias de dominio y persistencia se realiza con `jest-expo` (aprobado en **ADR-003**).

**Conclusión:**
No surgen capacidades técnicas externas nuevas no cubiertas por las dependencias ya autorizadas del proyecto. Por tanto, no se requieren nuevos paquetes npm ni decisiones ADR adicionales para esta historia.

*Estado del Plan: Aprobado (No se requieren nuevos ADRs; dependencias autorizadas suficientes).*
