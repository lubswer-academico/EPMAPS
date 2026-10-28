# Plan Técnico – Spec 002: Identificación y consulta de medidor con caché de jornada

*Estado del Plan: Pendiente de resolución de Decisiones ADR antes de iniciar la implementación.*

## 1. Responsabilidad de Archivos

Estructura modular directa bajo principios estrictos de simplicidad (KISS y YAGNI), sin interfaces dobles ni librerías adicionales:

### Dominio y Lógica Pura (`src/domain/meter/`)
- `src/domain/meter/types.ts`: Tipos puros de la entidad medidor (`MeterRecord`, `MeterStatus`, `MeterValidationResult`, `MonthlyDuplicateCheckResult`, `CachedMeterEntry`).
- `src/domain/meter/meterRules.ts`: Funciones puras de sanitización (recorte de espacios, conversión a mayúsculas), formateo con prefijo asistido `MED-`, validación estricta de formato `MED-XXXXXX`, expiración de caché de jornada (24 horas) y verificación de duplicidad mensual (R10).
- `src/domain/meter/__tests__/meterRules.test.ts`: Pruebas unitarias de las reglas de validación, asistencia de código, expiración de caché y verificación de duplicidad mensual.

### Servicio y Cliente de Oficina Remota (`src/services/`)
- `src/services/officeApi.ts`: Cliente de comunicación remota implementado con la solución acordada en ADR-REQ-01 para consultar el recurso remoto de medidores del sistema central. Realiza la búsqueda por código oficial del medidor y retorna los 7 campos de la ficha técnica/comercial o error controlado (404 no encontrado o falla de red).
- `src/services/__tests__/officeApi.test.ts`: Pruebas unitarias que simulan la respuesta exitosa de los 7 campos, medidor no encontrado (404 o arreglo vacío) y fallas de red/servidor según la herramienta acordada en ADR-REQ-01.

### Persistencia Directa (`src/storage/meter/`)
- `src/storage/meter/meterCacheStorage.ts`: Módulo de persistencia directa que almacena y recupera las fichas de medidores en el caché local de jornada usando `@react-native-async-storage/async-storage` (reutilizando ADR-001). Implementa serialización segura, purga automática al superar 24 horas y vaciado total al cerrar turno.
- `src/storage/meter/__tests__/meterCacheStorage.test.ts`: Pruebas unitarias de almacenamiento, recuperación instantánea, purga por caducidad (24h) y limpieza de caché.

### Estado y Controladores de Presentación (`src/presentation/meter/`)
- `src/presentation/meter/useMeterSearchController.ts`: Hook controlador de la pantalla de búsqueda y consulta de medidor. Coordina la normalización en tiempo real del código ingresado, la verificación de red con `networkMonitor`, la consulta prioritaria al caché de jornada local, la descarga remota vía `officeApi` cuando hay señal, la degradación elegante ante falta de señal (D3) y el bloqueo por duplicidad mensual R10 (D4).

### Interfaz en Obra Blanca (`src/app/` y vistas)
- `src/app/meter-search.tsx`: Pantalla de consulta de medidor en obra blanca con input asistido, botón de búsqueda con objetivo táctil >= 48x48 pt, panel de visualización de ficha técnica/comercial, advertencia de falta de señal con botón "Continuar a captura sin datos previos", y alertas de duplicidad mensual con redirección o bloqueo.
- `src/app/home.tsx`: Actualización de la pantalla principal para incluir el acceso directo a la búsqueda de medidor.

---

## 2. Dominio y Lógica Pura (`src/domain/meter/`)

Funciones puras deterministas, completamente desacopladas de React, React Native y almacenamiento:

1. **`sanitizeMeterCodeInput(rawInput: string): string`**:
   - Elimina espacios en blanco iniciales y finales.
   - Convierte todos los caracteres alfabéticos a mayúsculas.
   - Si el técnico escribe únicamente dígitos numéricos o letras sin guion (ej. `123456` o `MED123456`), asiste anteponiendo o normalizando el prefijo `MED-`.

2. **`validateMeterCode(code: string): MeterValidationResult`**:
   - Evalúa si el código cumple estrictamente con la expresión regular `^MED-\d{6}$` (longitud exacta de 10 caracteres).
   - Retorna `{ isValid: true, code }` si es válido.
   - Retorna `{ isValid: false, errorMessage: "El código debe contener el prefijo MED- seguido de 6 dígitos numéricos." }` si no coincide.

3. **`isCacheEntryExpired(cachedAtTimestamp: number, currentTimestamp: number = Date.now()): boolean`**:
   - Evalúa la diferencia temporal en milisegundos entre `currentTimestamp` y `cachedAtTimestamp`.
   - Retorna `true` si han transcurrido más de 24 horas ($24 \times 60 \times 60 \times 1000$ ms = 86,400,000 ms), determinando que debe purgarse.

4. **`checkMonthlyDuplicate(lastReadingDateIso: string | null, isSubmitted: boolean, currentDate: Date = new Date()): MonthlyDuplicateCheckResult`**:
   - Si no hay fecha de última lectura registrada, retorna `{ hasDuplicate: false }`.
   - Extrae año y mes de `lastReadingDateIso` y los compara con el año y mes calendario de `currentDate`.
   - Si coinciden en el mismo mes y año:
     - Si `isSubmitted === true`: retorna `{ hasDuplicate: true, isSubmitted: true, message: "Lectura mensual completada y enviada a oficina. No es posible registrar un nuevo valor este mes." }`.
     - Si `isSubmitted === false`: retorna `{ hasDuplicate: true, isSubmitted: false, message: "Este medidor ya tiene una lectura registrada en este mes.", canEditPending: true }`.

---

## 3. Servicio de Oficina Remota (`src/services/officeApi.ts`)
*(Sujeto a la resolución de ADR-REQ-01)*

- **Objetivo:** Consultar la ficha técnica/comercial oficial del medidor al servidor central de oficina cuando el dispositivo cuenta con conexión de red.
- **Implementación:** Función asíncrona `fetchMeterFromOffice(meterCode: string): Promise<MeterRecord | null>` estructurada según la herramienta resuelta en ADR-REQ-01.
- **Parámetros y Recurso:** Consulta remota al recurso de medidores por código (`/medidores?code=...`).
- **Mapeo de los 7 campos obligatorios:**
  1. `code`: string (ej. `MED-100201`)
  2. `address`: string (Dirección del predio)
  3. `sector`: string (Sector o barrio de Quito)
  4. `accountNumber`: string (Número de cuenta de agua potable)
  5. `status`: `MeterStatus` (activo, suspendido, etc.)
  6. `lastReading`: número y fecha ISO (`{ value: number, date: string }`)
  7. `averageConsumption`: number (promedio mensual en $m^3$)
- **Manejo de Errores:** Retorna `null` en respuestas 404 o listas vacías; lanza error tipado descriptivo ante cortes de red o fallas de servidor.

---

## 4. Persistencia Directa (`src/storage/meter/`)

### Módulo de Caché de Jornada (`meterCacheStorage.ts`)
- Utiliza `@react-native-async-storage/async-storage` bajo la clave base `epmaps_meter_cache_v1`.
- Almacena un mapa serializado `Record<string, CachedMeterEntry>` donde cada entrada contiene `{ record: MeterRecord, cachedAt: number }`.
- Exporta funciones asíncronas directas:
  - `saveMeterToCache(meter: MeterRecord): Promise<void>`: Guarda o actualiza la ficha con `cachedAt = Date.now()`.
  - `getMeterFromCache(code: string): Promise<MeterRecord | null>`: Recupera la ficha si existe y no ha expirado (> 24h). Si expiró, la descarta.
  - `purgeExpiredCache(): Promise<void>`: Recorre el mapa y elimina entradas con más de 24h.
  - `clearMeterCache(): Promise<void>`: Vacía completamente el caché local (al invocar cierre de turno).
- **Enfoque KISS defensivo:** Envoltorios con `try/catch`. En caso de corrupción de datos, no interrumpe el flujo y purga la clave de forma transparente.

---

## 5. Contrato de Presentación y Estado

### Controlador de Búsqueda de Medidor (`useMeterSearchController`)
- **Datos expuestos:**
  - `meterCodeInput: string`: Texto actual en el campo de búsqueda.
  - `isValidCode: boolean`: Indica si el código ingresado cumple estrictamente el formato `MED-XXXXXX`.
  - `validationError: string | null`: Mensaje de validación si el formato es inválido.
  - `isSearching: boolean`: Bandera de carga durante la consulta.
  - `meterData: MeterRecord | null`: Ficha técnica y comercial recuperada (de caché o descargada de la oficina remota).
  - `isFromCache: boolean`: Bandera que indica si la ficha proviene del caché local de jornada.
  - `noSignalNoDataWarning: boolean`: Bandera activa cuando no hay señal y el medidor no estaba en caché (D3).
  - `duplicateBlock: MonthlyDuplicateCheckResult | null`: Información de bloqueo por duplicidad mensual R10 (D4).
  - `errorMessage: string | null`: Mensaje descriptivo si el medidor no existe en oficina o falla la red.
- **Acciones recibidas:**
  - `handleCodeChange(text: string): void`: Normaliza y actualiza el texto en el input.
  - `searchMeter(): Promise<void>`: Ejecuta la consulta (priorizando caché local, luego consulta remota vía `officeApi` si hay red, o activando advertencia D3 si no hay red).
  - `proceedToCaptureWithoutData(): void`: Habilita el avance a captura identificando el registro como pendiente de contrastar.
  - `resetSearch(): void`: Limpia el formulario y los resultados.

---

## 6. Estrategia de Pruebas Automatizadas

Framework de pruebas: Jest con TypeScript (`jest-expo`), ejecutado con `npx jest`.

| Requisito | Archivo de Prueba | Casos Cubiertos |
| :--- | :--- | :--- |
| **RF-1, RF-2** | `src/domain/meter/__tests__/meterRules.test.ts` | - Normalización de minúsculas a mayúsculas y eliminación de espacios en blanco.<br>- Asistencia automática del prefijo `MED-` ante dígitos directos.<br>- Validación estricta `^MED-\d{6}$` y bloqueo con mensaje de error en español para códigos incompletos. |
| **RF-5** | `src/domain/meter/__tests__/meterRules.test.ts` | - Detección de duplicidad mensual para lecturas ya enviadas (bloqueo total).<br>- Detección de duplicidad mensual para lecturas locales pendientes (ofrece ver/editar).<br>- Permisión de registro cuando no hay lectura previa o es de un mes anterior. |
| **RF-8** | `src/domain/meter/__tests__/meterRules.test.ts` | - Identificación de expiración al superar 24 horas (86,400,000 ms).<br>- No expiración dentro del margen de 24 horas. |
| **RF-3, RF-6** | `src/services/__tests__/officeApi.test.ts` | - Recuperación exitosa de los 7 campos del medidor simulando la respuesta de red según ADR-REQ-01.<br>- Retorno nulo ante código inexistente o respuesta 404.<br>- Manejo controlado ante error de conexión de red. |
| **RF-3, RF-4, RF-8, RNF-2, RNF-3** | `src/storage/meter/__tests__/meterCacheStorage.test.ts` | - Guardado en caché con marca temporal.<br>- Recuperación instantánea sin llamadas a red.<br>- Purga automática de entradas con más de 24 horas.<br>- Vaciado completo del caché (`clearMeterCache`).<br>- Manejo tolerante ante datos corruptos. |

---

# Decisiones ADR

### ADR-REQ-01: Cliente de comunicación remota para consulta HTTP de oficina
- **Problema a resolver:** Consultar vía red el servidor de la oficina central para obtener la ficha técnica y comercial del medidor catastrado cuando el dispositivo cuenta con conectividad a internet (RF-3, RF-6; RNF-1, RNF-4).
- **Capacidades requeridas:** Capacidad de realizar peticiones HTTP GET asíncronas con parámetros de consulta o rutas codificadas, soporte de configuración de URL base, manejo de tiempos de espera (timeout), parseo de respuestas JSON, y captura defensiva de códigos de estado HTTP (200 éxito, 404 no encontrado, errores 5xx y fallas de red), sin sobrecargar el bundle ni añadir dependencias injustificadas.
- **Requisitos trazados:** RF-3, RF-6; RNF-1, RNF-4.
- **Se va a utilizar:** `axios` mediante una instancia configurada en `src/services/officeApi.ts`.
- **Trazabilidad:** Resuelto en docs/adr/ADR-004-axios-cliente-http.md.
- **Comando de instalación:** `npx expo install axios`

---

*Estado del Plan: Aprobado (todas las Decisiones ADR resueltas formalmente en docs/adr/). Listo para iniciar la implementación.*
