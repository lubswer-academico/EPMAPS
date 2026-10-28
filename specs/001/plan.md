# Plan Técnico – Spec 001: Inicio de sesión del técnico y barra de estado global

*Estado del Plan: Aprobado (todas las Decisiones ADR resueltas formalmente en docs/adr/). Listo para iniciar la implementación.*

## 1. Responsabilidad de Archivos

Estructura directa, limpia y simplificada bajo principios KISS y YAGNI, eliminando abstracciones innecesarias:

### Dominio y Lógica Pura (`src/domain/session/`)
- `src/domain/session/types.ts`: Tipos puros (`TechnicianCredentials`, `AuthenticatedTechnician`, `SessionValidationResult`, `ConnectionStatus`, `GlobalStatusBarState`).
- `src/domain/session/credentialsCatalog.ts`: Catálogo determinista de técnicos autorizados para operación offline (código y clave predefinidos).
- `src/domain/session/sessionRules.ts`: Funciones puras de validación, sanitización (recorte de espacios), chequeo de obligatoriedad y verificación contra catálogo offline.
- `src/domain/session/statusBarRules.ts`: Funciones puras para cómputo de etiqueta de conectividad ("Con señal" / "Sin señal") y conteo simple de pendientes (constante/función que retorna `"0 pendientes"` para HU-001).
- `src/domain/session/__tests__/sessionRules.test.ts`: Pruebas unitarias de las reglas de autenticación y sanitización.
- `src/domain/session/__tests__/statusBarRules.test.ts`: Pruebas unitarias del formateo y reglas de la barra de estado.

### Persistencia Directa (`src/storage/session/`)
- `src/storage/session/sessionStorage.ts`: Módulo directo de persistencia de sesión que usa `@react-native-async-storage/async-storage` (según ADR-001), con parseo defensivo de JSON y manejo seguro de errores.
- `src/storage/session/__tests__/sessionStorage.test.ts`: Pruebas unitarias de persistencia directa (guardar, leer, limpiar y tolerancia a JSON corrupto).

### Monitor de Red y Estado de Presentación (`src/presentation/session/`)
- `src/presentation/session/networkMonitor.ts`: Módulo de suscripción y consulta de conectividad de red usando `@react-native-community/netinfo` (según ADR-002).
- `src/presentation/session/useSessionController.ts`: Hook/controlador directo de la sesión (login, logout, restauración automática al inicio).
- `src/presentation/session/useGlobalStatusController.ts`: Hook/controlador directo para la barra de estado (estado de red y "0 pendientes" constante para HU-001).

### Interfaz en Obra Blanca (`src/app/` y componentes funcionales)
- `src/app/index.tsx`: Redirección inicial basada en si existe sesión activa guardada.
- `src/app/login.tsx`: Pantalla de inicio de sesión del técnico (campos de texto, botón de acceso, mensajes de error).
- `src/app/home.tsx`: Vista operativa principal protegida que incluye la barra de estado global y botón para cerrar turno.
- `src/components/GlobalStatusBar.tsx`: Componente visual en obra blanca que renderiza la conectividad ("Con señal" / "Sin señal") y el conteo de pendientes ("0 pendientes").

---

## 2. Dominio y Lógica Pura (`src/domain/session/`)

Funciones deterministas puras, sin imports de React, React Native ni APIs de almacenamiento:

1. **`sanitizeEmployeeCode(code: string): string`**:
   - Elimina espacios en blanco al inicio y al final de la cadena recibida.
2. **`validateCredentialsFormat(code: string, password: string): { isValid: boolean; errorMessage?: string }`**:
   - Verifica que ni el código (tras recorte) ni la clave sean cadenas vacías.
   - Retorna mensaje descriptivo en español: *"Debe ingresar el código de empleado y la clave."*
3. **`authenticateTechnician(code: string, password: string, catalog: TechnicianCredentials[]): SessionValidationResult`**:
   - Compara las credenciales ingresadas (con código recortado) contra el catálogo offline.
   - Si coincide, retorna `{ success: true, technician: { employeeCode, name } }`.
   - Si no coincide, retorna `{ success: false, errorMessage: "Código de empleado o clave incorrectos." }`.
4. **`formatConnectionStatus(isConnected: boolean | null): "Con señal" | "Sin señal"`**:
   - Transforma el estado booleano de conectividad en los textos oficiales del sistema.
5. **`getInitialPendingReadingsLabel(): string`**:
   - Retorna de forma directa y constante `"0 pendientes"` (KISS: sin colas simuladas ni lectores en memoria prematuros en HU-001).

---

## 3. Persistencia Directa (`src/storage/session/`)

### Módulo de Sesión (`sessionStorage.ts`)
- Utiliza directamente `@react-native-async-storage/async-storage` bajo la clave fija `epmaps_active_session`.
- Exporta funciones asíncronas directas:
  - `saveSession(technician: AuthenticatedTechnician): Promise<void>`
  - `getSession(): Promise<AuthenticatedTechnician | null>`
  - `clearSession(): Promise<void>`
- **Estrategia defensiva:** Serialización JSON protegida con `try/catch`. Si el valor almacenado es inválido o está corrupto, se purga la clave y se retorna `null` de forma segura.

---

## 4. Contrato de Presentación y Estado

### Controlador de Sesión (`useSessionController`)
- **Datos expuestos:**
  - `technician: AuthenticatedTechnician | null`
  - `isAuthenticated: boolean`
  - `isLoading: boolean`
  - `errorMessage: string | null`
- **Acciones recibidas:**
  - `login(code: string, password: string): Promise<boolean>`
  - `logout(): Promise<void>`
  - `clearError(): void`

### Controlador de Barra de Estado Global (`useGlobalStatusController`)
- **Datos expuestos:**
  - `isOnline: boolean`
  - `connectionLabel: "Con señal" | "Sin señal"`
  - `pendingLabel: string` (retorna permanentemente "0 pendientes" en HU-001)

---

## 5. Estrategia de Pruebas Automatizadas

Framework de pruebas: Jest con soporte de TypeScript (`jest-expo`).

| Requisito | Archivo de Prueba | Casos Cubiertos |
| :--- | :--- | :--- |
| **RF-1, RF-2** | `src/domain/session/__tests__/sessionRules.test.ts` | - Validación exitosa con credenciales válidas.<br>- Sanitización de espacios en blanco en código.<br>- Rechazo de campos vacíos con mensaje en español.<br>- Rechazo de credenciales inexistentes o clave incorrecta. |
| **RF-5, RF-6** | `src/domain/session/__tests__/statusBarRules.test.ts` | - Formateo de "Con señal" para online.<br>- Formateo de "Sin señal" para offline o null.<br>- Retorno de "0 pendientes" constante. |
| **RF-1, RF-3, RF-4** | `src/storage/session/__tests__/sessionStorage.test.ts` | - Guardado y recuperación íntegra de sesión de jornada con AsyncStorage.<br>- Eliminación total al cerrar sesión (`clearSession`).<br>- Tolerancia y purga automática ante JSON corrupto. |

---

# Decisiones ADR

### ADR-REQ-01: Persistencia local tolerante a reinicios para clave-valor
- **Problema a resolver:** Persistir la sesión activa del técnico en el almacenamiento no volátil del dispositivo móvil, de forma que sobreviva a cierres forzados de la aplicación, suspensión en segundo plano o reinicio del terminal, sin necesidad de conexión a internet (RNF-1, RNF-2).
- **Capacidades requeridas:** Almacenamiento asíncrono persistente de cadenas y objetos serializados en formato clave-valor, compatible con el entorno Expo / React Native, con soporte para operaciones atómicas de lectura, escritura y eliminación de claves.
- **Requisitos trazados:** RF-1, RF-3, RF-4; RNF-1, RNF-2.
- **Se va a utilizar:** `@react-native-async-storage/async-storage` a través de módulo directo en `src/storage/session/sessionStorage.ts`.
- **Trazabilidad:** Resuelto en docs/adr/ADR-001-async-storage-sesion.md.
- **Comando de instalación:** `npx expo install @react-native-async-storage/async-storage`

### ADR-REQ-02: Monitoreo en tiempo real del estado de conectividad a la red
- **Problema a resolver:** Detectar de manera proactiva y continua si el dispositivo móvil se encuentra conectado a una red o sin señal, emitiendo eventos de cambio instantáneos para reflejar el estado actual en la barra de estado global en tiempo real (RF-5, RF-7, RNF-4).
- **Capacidades requeridas:** API de consulta de conectividad actual y suscripción a eventos de cambio de red (online/offline) nativos del sistema operativo móvil, con baja latencia y sin bloquear el hilo principal.
- **Requisitos trazados:** RF-5, RF-7; RNF-1, RNF-4.
- **Se va a utilizar:** `@react-native-community/netinfo` a través del módulo `networkMonitor.ts`.
- **Trazabilidad:** Resuelto en docs/adr/ADR-002-netinfo-conectividad.md.
- **Comando de instalación:** `npx expo install @react-native-community/netinfo`

### ADR-REQ-03: Arnés de ejecución y aserciones para pruebas automatizadas unitarias
- **Problema a resolver:** Ejecutar de forma automatizada las pruebas unitarias de lógica pura y contratos de persistencia con soporte para TypeScript, garantizando la cobertura de los requisitos funcionales antes de iniciar la implementación (TDD) (Constitución P4, AGENTS.md).
- **Capacidades requeridas:** Motor de pruebas automatizadas compatible con TypeScript, tipado estático, capacidades de mocking para contratos de persistencia y temporizadores, ejecutable mediante `npx jest`.
- **Requisitos trazados:** RF-1 a RF-7; RNF-1, RNF-4.
- **Se va a utilizar:** `jest-expo`, `jest` y `@types/jest` como devDependencies.
- **Trazabilidad:** Resuelto en docs/adr/ADR-003-jest-expo-testing.md.
- **Comando de instalación:** `npx expo install -- --save-dev jest-expo jest @types/jest`

---

*Estado del Plan: Aprobado (todas las Decisiones ADR resueltas formalmente en docs/adr/). Listo para iniciar la implementación.*
