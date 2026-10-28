# Plan Técnico – Spec 003: Captura multipantalla de lectura, anomalías, fotografía y recuperación de borrador

*Estado del Plan: Pendiente de resolución de Decisiones ADR antes de iniciar la implementación.*

## 1. Responsabilidad de Archivos

Estructura modular directa aplicando principios de simplicidad (KISS y YAGNI), separando estrictamente la lógica de dominio puro, la persistencia en almacenamiento local y la orquestación del flujo interactivo:

### Dominio y Lógica Pura (`src/domain/reading/`)
- `src/domain/reading/types.ts`: Tipos puros y modelos del dominio de lectura (`MeterCondition`, `ReadingDraft`, `ConsolidatedReading`, `ReadingValidationResult`, `ConsumptionCalculationResult`).
- `src/domain/reading/readingRules.ts`: Funciones deterministas puras para:
  - Cálculo matemático de consumo mensual (`actual - anterior`).
  - Validación de consistencia física (`actual >= anterior` y enteros positivos).
  - Detección determinista de consumo anómalo (`consumo > 3 * promedio`).
  - Matriz de obligatoriedad según condición física (`Normal`, `Inaccesible`, `Dañado`) para lectura, motivo/descripción, fotografía y confirmación.
  - Validación de completitud y transición entre pasos (Paso 1 -> Paso 2 -> Paso 3) y validación final para consolidación.
- `src/domain/reading/__tests__/readingRules.test.ts`: Pruebas unitarias completas de todas las reglas de negocio, fórmulas matemáticas, umbrales de anomalía y matriz de obligatoriedad.

### Persistencia Directa (`src/storage/reading/`)
- `src/storage/reading/readingDraftStorage.ts`: Módulo de persistencia atómica para el borrador activo en caliente y la cola local de lecturas consolidadas pendientes de envío utilizando `@react-native-async-storage/async-storage` (reutilizando ADR-001). Implementa:
  - `saveDraft(draft: ReadingDraft): Promise<void>`
  - `getDraft(meterCode: string): Promise<ReadingDraft | null>`
  - `clearDraft(meterCode: string): Promise<void>`
  - `saveConsolidatedReading(reading: ConsolidatedReading): Promise<void>` (almacena en cola local e incrementa el contador de pendientes).
- `src/storage/reading/__tests__/readingDraftStorage.test.ts`: Pruebas unitarias de serialización segura, recuperación íntegra de borrador, eliminación de borrador y guardado en cola local.

### Servicios de Plataforma (`src/services/photo/`)
- `src/services/photo/photoService.ts`: Módulo adaptador desacoplado para la captura interactiva con cámara fotográfica y la gestión duradera de archivos de imagen en el disco local de la aplicación (sujeto a las decisiones ADR-REQ-01 y ADR-REQ-02). Expone los métodos:
  - `requestCameraPermissions(): Promise<boolean>`
  - `takeMeterPhoto(): Promise<string | null>` (captura foto y retorna URI temporal/nativa).
  - `persistPhoto(tempUri: string, meterCode: string): Promise<string>` (mueve/copia la imagen a una ruta permanente duradera en disco local identificada por medidor y timestamp).
  - `deletePhoto(persistentUri: string): Promise<void>` (elimina archivos huérfanos al descartar borrador o reemplazar foto).

### Controladores y Estado de Presentación (`src/presentation/reading/`)
- `src/presentation/reading/useReadingWizardController.ts`: Hook controlador del flujo de captura multipantalla (Wizard de 3 pasos). Coordina:
  - Detección de borrador previo al iniciar (`hasExistingDraft`) con opciones "Reanudar" o "Descartar".
  - Auto-guardado en caliente ante cualquier cambio de estado o navegación de paso.
  - Evaluación reactiva de anomalías, consistencia física y obligatoriedad.
  - Solicitud de permisos de cámara y persistencia duradera del archivo fotográfico.
  - Consolidación final del registro en la cola local, purga del borrador y redirección a consulta.

### Interfaz en Obra Blanca (`src/app/`)
- `src/app/reading-wizard.tsx`: Pantalla de captura multipantalla en obra blanca estructurada en los 3 pasos, respetando accesibilidad y objetivos táctiles mínimos de 48x48 pt.
- `src/app/meter-search.tsx`: Conexión de navegación desde la consulta de medidor hacia `reading-wizard.tsx` pasando los parámetros del medidor (código, lectura anterior, promedio de consumo y modo sin datos previos).

---

## 2. Dominio y Lógica Pura (`src/domain/reading/`)

Funciones deterministas puras sin dependencias de React, APIs de dispositivo ni AsyncStorage:

1. **`calculateConsumption(currentReading: number, previousReading?: number | null): ConsumptionCalculationResult`**:
   - Si no se proporciona `previousReading` o es nulo/indefinido (modo sin datos previos), retorna `{ hasPreviousReading: false, consumption: null, isValidConsistency: true }`.
   - Si `currentReading < previousReading`: retorna `{ hasPreviousReading: true, consumption: currentReading - previousReading, isValidConsistency: false, errorMessage: "La lectura actual no puede ser menor a la lectura anterior registrada" }`.
   - Si `currentReading >= previousReading`: retorna `{ hasPreviousReading: true, consumption: currentReading - previousReading, isValidConsistency: true }`.

2. **`checkConsumptionAnomaly(consumption: number | null, averageConsumption?: number | null): boolean`**:
   - Si `consumption === null` o `averageConsumption === null` o `averageConsumption === undefined` o `averageConsumption <= 0`, retorna `false`.
   - Evalúa si `consumption > 3 * averageConsumption`. Retorna `true` si excede estrictamente el triple; de lo contrario `false`.

3. **`getStepRequirements(condition: MeterCondition, isAnomaly: boolean): StepRequirements`**:
   - Determina la obligatoriedad de campos para cada estado:
     - `Normal`: motivo no aplica (`disabled`); lectura numérica obligatoria; confirmación de anomalía obligatoria solo si `isAnomaly === true`; foto obligatoria solo si `isAnomaly === true` (de lo contrario opcional).
     - `Inaccesible`: motivo obligatorio (texto no vacío tras `trim()`); lectura no aplica (`disabled`); confirmación de anomalía no aplica; foto opcional.
     - `Dañado`: descripción de daño obligatoria (texto no vacío tras `trim()`); lectura numérica opcional; confirmación de anomalía obligatoria solo si hay lectura ingresada y `isAnomaly === true`; foto **estrictamente obligatoria**.

4. **`validateStepCompletion(step: 1 | 2 | 3, draft: Partial<ReadingDraft>, requirements: StepRequirements): ReadingValidationResult`**:
   - **Paso 1:** Valida selección de condición válida y presencia de texto descriptivo no vacío si es `Inaccesible` o `Dañado`.
   - **Paso 2:** Valida lectura numérica según condición (rechaza negativos o no numéricos; si es `Normal`, es obligatoria; si hay lectura anterior, exige consistencia física; si hay anomalía, exige confirmación de revisión marcada).
   - **Paso 3:** Valida presencia de fotografía si `requirements.photoRequired === true`. Valida que el registro esté íntegro para consolidación.

5. **`createInitialDraft(meterCode: string, previousReading?: number | null, averageConsumption?: number | null, hasNoPreviousData: boolean = false): ReadingDraft`**:
   - Genera la estructura inicial de borrador en Paso 1 con campos limpios y marca de tiempo.

---

## 3. Persistencia Directa (`src/storage/reading/`)

### Módulo de Borrador y Cola Local (`readingDraftStorage.ts`)
- Utiliza `@react-native-async-storage/async-storage` bajo dos claves delimitadas:
  - `epmaps_reading_drafts_v1`: Mapa clave-valor serializado `Record<string, ReadingDraft>` indexado por código de medidor (`MED-XXXXXX`). Permite mantener borradores aislados por medidor.
  - `epmaps_pending_readings_queue_v1`: Arreglo de lecturas consolidadas `ConsolidatedReading[]` pendientes de envío remoto (consumido también para el contador global).
- Métodos exportados:
  - `saveDraft(draft: ReadingDraft): Promise<void>`: Guarda de forma atómica el borrador en caliente tras cada mutación.
  - `getDraft(meterCode: string): Promise<ReadingDraft | null>`: Recupera el borrador activo para el medidor consultado.
  - `clearDraft(meterCode: string): Promise<void>`: Remueve el borrador activo asociado al medidor especificado.
  - `saveConsolidatedReading(reading: ConsolidatedReading): Promise<void>`: Añade la lectura a la cola persistente local y elimina el borrador temporal atómicamente.
  - `getPendingReadingsCount(): Promise<number>`: Retorna la cantidad total de registros encolados pendientes de envío.
- Enfoque defensivo y tolerante a fallos: Envoltorio en bloques `try/catch` para garantizar que errores de serialización no congelen la interfaz del técnico.

---

## 4. Contrato de Presentación y Estado

### Controlador de Captura (`useReadingWizardController`)
- **Parámetros de entrada:**
  - `meterCode: string`
  - `previousReading?: number | null`
  - `averageConsumption?: number | null`
  - `hasNoPreviousData?: boolean`
- **Datos expuestos:**
  - `currentStep: 1 | 2 | 3`: Paso activo del flujo de captura.
  - `draft: ReadingDraft`: Estado en memoria del borrador en edición.
  - `requirements: StepRequirements`: Reglas dinámicas de obligatoriedad según la condición seleccionada y consumo.
  - `consumptionInfo: ConsumptionCalculationResult`: Consumo calculado y estado de consistencia física.
  - `isAnomaly: boolean`: Bandera indicadora de consumo anómalo (> 3x promedio).
  - `hasExistingDraft: boolean`: Bandera modal/banner que indica si se detectó un borrador previo sin completar al abrir la pantalla.
  - `isSaving: boolean`: Bandera indicadora de procesamiento en almacenamiento.
  - `cameraPermissionDenied: boolean`: Bandera de aviso cuando el permiso de cámara no fue concedido.
  - `validationError: string | null`: Mensaje de error para retroalimentación visual si se intenta avanzar sin cumplir los requisitos del paso.
- **Acciones recibidas:**
  - `setCondition(condition: MeterCondition): void`
  - `setInaccessibilityReason(reason: string): void`
  - `setDamageDescription(description: string): void`
  - `setCurrentReading(readingStr: string): void`
  - `setAnomalyConfirmed(confirmed: boolean): void`
  - `goToNextStep(): void`
  - `goToPreviousStep(): void`
  - `capturePhoto(): Promise<void>` (solicita permisos y dispara captura con cámara mediante el servicio).
  - `removePhoto(): Promise<void>` (remueve la foto del borrador y elimina el archivo local).
  - `resumeExistingDraft(): void` (restaura el borrador persistido).
  - `discardExistingDraft(): Promise<void>` (elimina el borrador y borra el archivo de foto asociado si existía).
  - `submitFinalReading(): Promise<boolean>` (valida integridad, consolida en cola, limpia borrador y habilita retorno).

---

## 5. Estrategia de Pruebas Automatizadas

Framework de pruebas: Jest con TypeScript (`jest-expo`), ejecutado con `npx jest`.

| Requisito | Archivo de Prueba | Casos Cubiertos |
| :--- | :--- | :--- |
| **RF-1, RF-2, RF-3, RF-4** | `src/domain/reading/__tests__/readingRules.test.ts` | - Matriz de obligatoriedad para condición `Normal`, `Inaccesible` y `Dañado`.<br>- Validación de motivo y descripción de daño no vacíos (rechazo de espacios en blanco).<br>- Habilitación de avance del Paso 1 al Paso 2 solo cuando los requisitos se cumplen. |
| **RF-5, RF-6, RF-7, RF-8, RF-9** | `src/domain/reading/__tests__/readingRules.test.ts` | - Cálculo de consumo mensual (`actual - anterior`).<br>- Rechazo por inconsistencia física cuando `actual < anterior`.<br>- Detección estricta de consumo anómalo cuando `consumo > 3 * promedio`.<br>- Exigencia de confirmación física obligatoria ante anomalía.<br>- Comportamiento en modo sin datos previos (omite cálculo y marca "Pendiente de verificar").<br>- Manejo de lectura opcional en condición `Dañado`. |
| **RF-10, RF-11, RF-12, RF-13** | `src/domain/reading/__tests__/readingRules.test.ts` | - Evaluación de obligatoriedad de foto (opcional en normal sin anomalía e inaccesible; obligatoria en dañado o con anomalía).<br>- Validación integral de campos previa a la consolidación del registro. |
| **RF-13, RF-14, RF-15, RNF-1, RNF-3** | `src/storage/reading/__tests__/readingDraftStorage.test.ts` | - Guardado en caliente del borrador activo y recuperación íntegra.<br>- Detección y reanudación de borrador existente.<br>- Eliminación total del borrador al descartar.<br>- Consolidación exitosa en la cola de lecturas pendientes y eliminación atómica del borrador temporal.<br>- Incremento y consulta del contador de lecturas pendientes. |

---

# Decisiones ADR

### ADR-REQ-01: Captura fotográfica asistida mediante cámara del dispositivo
- **Problema a resolver:** Permitir al técnico de campo capturar evidencia fotográfica nítida del medidor de agua (estado físico del visor o avería) directamente desde la pantalla de captura del terminal móvil en condiciones de campo (RF-10, RF-11, RF-12; RNF-1, RNF-4).
- **Capacidades requeridas:** Interfaz para solicitar y verificar permisos nativos de cámara en tiempo de ejecución (iOS/Android); invocación modal o visor de cámara para captura de fotografía; soporte para seleccionar resolución balanceada sin saturar la memoria del terminal; retorno de referencia unívoca a la imagen capturada en almacenamiento local temporal; manejo de cancelación voluntaria del usuario y retroalimentación clara ante permisos denegados.
- **Requisitos trazados:** RF-10, RF-11, RF-12; RNF-1, RNF-4.
- **Se va a utilizar:** `expo-image-picker` mediante el servicio `src/services/photo/cameraService.ts`.
- **Trazabilidad:** Resuelto en docs/adr/ADR-005-expo-image-picker-camara.md.
- **Comando de instalación:** `npx expo install expo-image-picker`

---

### ADR-REQ-02: Gestión y persistencia duradera de archivos de imagen en disco local
- **Problema a resolver:** Garantizar la tenencia, archivo seguro y persistencia ininterrumpida de las fotografías tomadas en el almacenamiento interno duradero de la aplicación en el dispositivo, evitando que el sistema operativo purgue las imágenes de carpetas de caché temporal durante jornadas de varios días sin conexión hasta su futura transmisión remota (RF-12, RF-13; RNF-1, RNF-2, RNF-3).
- **Capacidades requeridas:** Acceso seguro al sistema de archivos local de la aplicación (directorio de documentos permanentes); capacidad de copiar o mover archivos de imágenes desde ubicaciones temporales a rutas protegidas permanentes con nombres unívocos vinculados al código de medidor y fecha; capacidad de lectura y eliminación atómica de archivos huérfanos cuando el usuario descarta un borrador o sustituye una fotografía; compatibilidad con el entorno de ejecución móvil y pruebas unitarias.
- **Requisitos trazados:** RF-12, RF-13, RF-15; RNF-1, RNF-2, RNF-3.

---

*Estado del Plan: Pendiente de resolución de Decisiones ADR antes de iniciar la implementación.*
