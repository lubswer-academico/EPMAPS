# Plan Técnico y Arquitectura – Spec 005
## Verificación diferida y sincronización automática sin duplicados

### 1. Responsabilidad de Archivos

Mapa mínimo, modular y suficiente de archivos a crear y modificar, respetando KISS y YAGNI:

| Archivo | Capa | Rol y Responsabilidad Concreta |
| :--- | :--- | :--- |
| `src/domain/reading/types.ts` | Dominio (Tipos) | Ampliación del tipo `ReadingStatus` incorporando `'REQUIRES_ATTENTION'` y definición del tipo `OfficeSyncPayload` para despacho comercial idempotente. |
| `src/domain/sync/syncRules.ts` | Dominio (Puro) | Funciones matemáticas y deterministas sin React ni almacenamiento: evaluación de elegibilidad de lecturas para sincronizar, validación de reglas de verificación diferida (cálculo de consumo contra histórico de oficina, detección de anomalía > 3x sin foto que promueve a `REQUIRES_ATTENTION`), y construcción del payload comercial con `clientReadingId` para idempotencia. |
| `src/domain/sync/__tests__/syncRules.test.ts` | Dominio (Pruebas) | Pruebas unitarias de dominio puro cubriendo RF-5, RF-6, RF-7, RF-8, RF-10, RF-11 y RF-12. |
| `src/domain/readingQueue/queueRules.ts` | Dominio (Puro) | Actualización de filtros, etiquetas (`formatReadingStatusLabel`), editabilidad y conteo de pendientes para soportar lecturas en estado `'REQUIRES_ATTENTION'`. |
| `src/domain/readingQueue/__tests__/queueRules.test.ts` | Dominio (Pruebas) | Pruebas de filtros, conteos y transiciones con el nuevo estado `'REQUIRES_ATTENTION'`. |
| `src/services/syncService.ts` | Servicios (HTTP) | Orquestador de llamadas HTTP con `axios` (`officeHttpClient`): consulta diferida de medidor en `/medidores`, verificación de estado del medidor en la oficina y envío consolidado a `/lecturas` garantizando idempotencia directa en una sola fase. |
| `src/services/__tests__/syncService.test.ts` | Servicios (Pruebas) | Pruebas unitarias de integración de servicio con mocks de Axios (éxito 200/201, microcortes, respuestas duplicadas y manejo de errores 404/500). |
| `src/storage/reading/readingDraftStorage.ts` | Persistencia | Métodos complementarios de actualización de estado atómico en cola local (`markReadingAsSubmitted`, `markReadingAsRequiresAttention`, `markReadingAsVerifiedSync`). |
| `src/presentation/sync/useSyncEngine.ts` | Presentación (Hook) | Controlador de sincronización: suscripción reactiva a `networkMonitor` (transición a online), disparador manual bajo demanda, control de concurrencia con mutex en vuelo (`isSyncing`) y actualización reactiva de estados en cola. |
| `src/presentation/sync/__tests__/useSyncEngine.test.ts` | Presentación (Pruebas) | Pruebas unitarias del hook de sincronización: ejecución reactiva ante conexión, bloqueo de concurrencia simultánea, y manejo de excepciones en red. |
| `src/app/reading-queue.tsx` | Presentación (Pantalla) | Integración del hook `useSyncEngine`, botón de sincronización manual bajo demanda ("Sincronizar ahora"), aviso en caso de intento offline, y visualización de la alerta destacada para lecturas que "Requieren atención" (RF-2, RF-3, RF-9, RF-14). |

---

### 2. Dominio y Lógica Pura (`src/domain/sync/syncRules.ts`)

Funciones matemáticas y deterministas libres de dependencias de frameworks, APIs de red o almacenamiento local:

1. **Evaluación de elegibilidad (`isReadingEligibleForSync`)**:
   - Una lectura es elegible para ser procesada por el motor si su estado es `'PENDING_SYNC'` o `'PENDING_VERIFICATION'`.
   - Si su estado es `'REQUIRES_ATTENTION'` o `'SUBMITTED'`, NO es elegible para sincronización automática hasta que el técnico la subsane o ya haya culminado su ciclo.
2. **Evaluación de verificación diferida (`evaluateDeferredVerification`)**:
   - Recibe la lectura capturada offline y la ficha técnica del medidor retornada por la oficina (`MeterRecord | null`).
   - Si el medidor no tiene historial previo (`previousReading == null` o `averageConsumption == null`): se valida como conforme, se asigna `hasNoPreviousData: true` y se promueve a `'PENDING_SYNC'`.
   - Si hay lectura anterior pero la lectura actual es menor que la anterior: se detecta incongruencia física y se promueve a `'REQUIRES_ATTENTION'` con motivo explicativo (RF-8, caso límite).
   - Cálculo del consumo: $\text{consumo} = \text{lectura actual} - \text{lectura anterior}$.
   - Detección de anomalía: Si $\text{consumo} > 3 \times \text{promedio mensual}$:
     * Si ya cuenta con `photoUri` y `anomalyConfirmed === true`: se valida automáticamente y se promueve a `'PENDING_SYNC'` (RF-7).
     * Si carece de `photoUri` o `anomalyConfirmed === false`: se detiene el envío, se promueve a `'REQUIRES_ATTENTION'` y se marca `isAnomaly: true` (RF-8).
   - Si $\text{consumo} \le 3 \times \text{promedio mensual}$: se valida automáticamente con su consumo calculado y se promueve a `'PENDING_SYNC'` (RF-6).
3. **Construcción de payload comercial con clave de idempotencia (`buildOfficeSyncPayload`)**:
   - Construye el objeto comercial tipado `OfficeSyncPayload`:
     * `clientReadingId`: id único asignado en la captura móvil (RF-10, RF-12).
     * `meterCode`: código oficial del medidor (`MED-XXXXXX`).
     * `condition`: condición operativa del medidor ('Normal', 'Inaccesible', 'Dañado').
     * `currentReading`: valor numérico digitado (o null si inaccesible).
     * `consumption`: consumo calculado.
     * `inaccessibilityReason` / `damageDescription`: justificaciones requeridas según condición.
     * `isAnomaly`: indicador booleano de anomalía.
     * `anomalyConfirmed`: confirmación explícita del técnico.
     * `localPhotoUri`: ruta o URI del archivo de foto persistido localmente según R7 (sin subida externa).
     * `capturedAt`: marca de tiempo ISO original de la captura en campo.
     * `syncedAt`: marca de tiempo ISO en la que se despacha a la oficina.

---

### 3. Persistencia Pragmática (`src/storage/reading/readingDraftStorage.ts`)

Conforme a KISS y YAGNI, se extiende el almacenamiento ya existente basado en AsyncStorage (`QUEUE_STORAGE_KEY`) sin agregar interfaces abstractas (`I...Storage`) ni dobles adaptadores innecesarios:

- **`updateReadingStatus(id: string, status: ReadingStatus, extra?: Partial<ConsolidatedReading>): Promise<void>`**:
  - Actualiza el estado operativo de una lectura en la cola local de forma atómica.
  - Si pasa a `'SUBMITTED'`, fija inmutablemente `syncedAt: new Date().toISOString()`.
  - Si pasa a `'REQUIRES_ATTENTION'` o `'PENDING_SYNC'`, actualiza los campos recalculados (`consumption`, `isAnomaly`, `updatedAt`).
- **`getPendingReadingsCount()`**:
  - Retorna el conteo de lecturas con estado `'PENDING_VERIFICATION'`, `'PENDING_SYNC'` o `'REQUIRES_ATTENTION'`.
  - Cuando todas se encuentran en `'SUBMITTED'`, retorna `0` de forma consistente.

---

### 4. Contrato de Presentación y Estado (`src/presentation/sync/useSyncEngine.ts`)

Hook desacoplado que centraliza el ciclo de vida del motor de sincronización:

- **Estado expuesto**:
  - `isSyncing: boolean`: indicador si hay un ciclo de envío activo en curso.
  - `syncSummary: { total: number; sent: number; requiresAttention: number; failed: number } | null`: reporte del último ciclo ejecutado.
  - `syncError: string | null`: mensaje de error descriptivo en español si ocurrió una falla global de red.
- **Acciones expuestas**:
  - `triggerSync(): Promise<void>`: disparo explícito bajo demanda (botón "Sincronizar ahora" en bandeja).
- **Mecanismos internos**:
  - Suscripción al monitor de red (`networkMonitor.ts`): ante la transición de desconectado a conectado (`wasOffline && isOnline`), ejecuta automáticamente `triggerSync()` en segundo plano (RF-1).
  - Mutex de protección (`isSyncingRef`): bloquea ejecuciones concurrentes o llamadas redundantes si un ciclo ya está en vuelo (RF-3).
  - Tolerancia a desconexión en vuelo: ante fallas de red durante la transmisión, detiene el ciclo de forma segura y preserva los registros intactos para el siguiente reintento (RF-4, RNF-1).

---

### 5. Estrategia de Pruebas Automatizadas (Jest)

Mapeo de pruebas unitarias y de integración requisito por requisito:

| Requisito | Escenario de Prueba | Archivo de Prueba |
| :--- | :--- | :--- |
| **RF-1, RF-3** | Disparo reactivo al transicionar a online y bloqueo con mutex ante llamadas concurrentes | `src/presentation/sync/__tests__/useSyncEngine.test.ts` |
| **RF-2, RF-4** | Disparo manual con conexión y suspensión segura si se interrumpe la red en vuelo | `src/presentation/sync/__tests__/useSyncEngine.test.ts` |
| **RF-5, RF-6** | Verificación diferida exitosa: consumo $\le 3\times$ promueve a `PENDING_SYNC` y asigna consumo | `src/domain/sync/__tests__/syncRules.test.ts` |
| **RF-7** | Verificación diferida con consumo $> 3\times$ que ya poseía foto y confirmación previa promueve a `PENDING_SYNC` | `src/domain/sync/__tests__/syncRules.test.ts` |
| **RF-8, RF-9** | Verificación diferida con consumo $> 3\times$ sin foto ni confirmación detiene envío y pasa a `REQUIRES_ATTENTION` | `src/domain/sync/__tests__/syncRules.test.ts` |
| **RF-10, RF-12** | Inmutabilidad de `clientReadingId` en la construcción del payload comercial para reintentos idempotentes | `src/domain/sync/__tests__/syncRules.test.ts` |
| **RF-11, RF-13** | Despacho HTTP consolidado a `/lecturas` con referencia a URI local y transición a `SUBMITTED` | `src/services/__tests__/syncService.test.ts` |
| **RF-14** | Actualización reactiva del contador global a 0 pendientes tras enviar la cola completa | `src/domain/readingQueue/__tests__/queueRules.test.ts` |

---

# Decisiones ADR

En estricto cumplimiento de la Constitución del Proyecto, la skill `sdd-plan` y los principios de simplicidad arquitectónica (KISS y YAGNI):

- **Capacidades técnicas requeridas y librerías autorizadas:**
  * **Comunicación HTTP remota con MockAPI:** Se reutiliza `axios` formalizado en [ADR-004](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/docs/adr/ADR-004-axios-cliente-http.md) para consultas a `/medidores` y envíos a `/lecturas`.
  * **Detección reactiva de conectividad de red:** Se reutiliza `networkMonitor` basado en `@react-native-community/netinfo` formalizado en [ADR-002](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/docs/adr/ADR-002-netinfo-conectividad.md).
  * **Persistencia local de cola de lecturas:** Se reutiliza `@react-native-async-storage/async-storage` formalizado en [ADR-001](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/docs/adr/ADR-001-async-storage-sesion.md).
  * **Tenencia local de fotografías según R7:** Se reutiliza `expo-file-system/legacy` formalizado en [ADR-006](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/docs/adr/ADR-006-expo-file-system-fotos.md), descartando subidas a servidores externos de imágenes (Cloudinary/ImgBB) y despachando la referencia local directa en una sola fase.
  * **Automatización de pruebas:** Se reutiliza `jest-expo` formalizado en [ADR-003](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/docs/adr/ADR-003-jest-expo-testing.md).

- **Evaluación de dependencias nuevas:**
  * **NO se requieren librerías externas adicionales ni paquetes npm nuevos.** Toda la funcionalidad de la especificación queda completamente respaldada por los 6 ADRs vigentes.

*Estado del Plan: Aprobado (todas las capacidades técnicas se encuentran cubiertas por ADRs autorizados).*
