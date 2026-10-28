# Plan Técnico – Spec 001: Inicio de sesión del técnico y barra de estado global

*Estado del Plan: Pendiente de resolución de Decisiones ADR antes de iniciar la implementación.*

## 1. Responsabilidad de Archivos

Estructura modular y limpia, respetando la arquitectura de capas desacopladas (`src/domain/`, `src/storage/`, `src/context/` o `src/hooks/` y `src/app/`):

### Dominio y Lógica Pura (`src/domain/session/`)
- `src/domain/session/types.ts`: Definición de tipos de datos puros (`TechnicianCredentials`, `AuthenticatedTechnician`, `SessionValidationResult`, `ConnectionStatus`, `GlobalStatusBarState`).
- `src/domain/session/credentialsCatalog.ts`: Catálogo determinista de técnicos autorizados para operación offline (código de empleado y credenciales predefinidas).
- `src/domain/session/sessionRules.ts`: Funciones puras de validación, sanitización (recorte de espacios), chequeo de obligatoriedad y verificación contra catálogo offline.
- `src/domain/session/statusBarRules.ts`: Funciones puras para cómputo de etiqueta de conectividad ("Con señal" / "Sin señal") y formateo de lecturas pendientes ("0 pendientes", "N pendientes").
- `src/domain/session/__tests__/sessionRules.test.ts`: Pruebas unitarias de las reglas de autenticación y sanitización.
- `src/domain/session/__tests__/statusBarRules.test.ts`: Pruebas unitarias del formateo y reglas de la barra de estado.

### Persistencia y Contratos de Almacenamiento (`src/storage/`)
- `src/storage/session/ISessionStorage.ts`: Interfaz del contrato de persistencia de sesión activa del técnico (`saveSession`, `getSession`, `clearSession`).
- `src/storage/session/AsyncSessionStorage.ts`: Implementación de `ISessionStorage` desacoplada utilizando el motor de clave-valor persistente local.
- `src/storage/session/MemorySessionStorage.ts`: Implementación en memoria de `ISessionStorage` para pruebas unitarias sin dependencias nativas.
- `src/storage/session/__tests__/AsyncSessionStorage.test.ts`: Pruebas de contrato y serialización tolerante a fallos/corrupción.
- `src/storage/queue/IQueueCountReader.ts`: Interfaz del contrato de solo lectura para consulta y suscripción del conteo de lecturas pendientes en cola (`getPendingCount`, `subscribePendingCount`).
- `src/storage/queue/MemoryQueueCountReader.ts`: Adaptador de lectura en memoria del contador de cola para pruebas y entorno desacoplado previo a la cola completa de HU-004.

### Contrato de Estado, Red y Presentación (`src/presentation/session/`)
- `src/presentation/session/INetworkMonitor.ts`: Interfaz para suscripción a cambios de conectividad de red (`isOnline`, `subscribeNetworkChange`).
- `src/presentation/session/useSessionController.ts`: Hook/controlador desacoplado de la lógica de sesión (expone: `technician`, `isAuthenticated`, `isLoading`, `errorMessage`, `login(code, password)`, `logout()`).
- `src/presentation/session/useGlobalStatusController.ts`: Hook/controlador desacoplado para la barra de estado (expone: `connectionStatus`, `pendingReadingsCount`, `statusLabel`, `pendingLabel`).
- `src/presentation/session/__tests__/useSessionController.test.ts`: Pruebas unitarias del flujo de estado de sesión usando adaptadores en memoria.
- `src/presentation/session/__tests__/useGlobalStatusController.test.ts`: Pruebas unitarias del flujo de actualización de barra de estado ante eventos de red y cambios de cola.

### Interfaz en Obra Blanca (`src/app/` y componentes funcionales)
- `src/app/index.tsx`: Redirección inicial basada en el estado de autenticación persistente.
- `src/app/login.tsx`: Pantalla de inicio de sesión del técnico (campos de texto, botón de acceso, mensaje de error).
- `src/app/(tabs)/_layout.tsx` o `src/app/home.tsx`: Vista operativa principal protegida que integra la barra de estado global en su cabecera o pie.
- `src/components/GlobalStatusBar.tsx`: Componente de interfaz en obra blanca que renderiza el estado de red y el conteo de lecturas pendientes.

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
5. **`formatPendingReadingsCount(count: number): string`**:
   - Si `count <= 0` retorna `"0 pendientes"`.
   - Si `count === 1` retorna `"1 pendiente"`.
   - Si `count > 1` retorna `"${count} pendientes"`.

---

## 3. Persistencia e Interfaces (`src/storage/`)

### Contrato de Almacenamiento de Sesión (`ISessionStorage`)
```typescript
export interface AuthenticatedTechnician {
  employeeCode: string;
  name: string;
  loggedInAt: string; // ISO string para trazabilidad determinista
}

export interface ISessionStorage {
  saveSession(technician: AuthenticatedTechnician): Promise<void>;
  getSession(): Promise<AuthenticatedTechnician | null>;
  clearSession(): Promise<void>;
}
```

### Contrato de Consulta de Cola Pendiente (`IQueueCountReader`)
```typescript
export interface IQueueCountReader {
  getPendingCount(): Promise<number>;
  subscribePendingCount(listener: (count: number) => void): () => void;
}
```

### Estrategia de Serialización Tolerante a Fallos
- Almacenamiento bajo la clave fija `epmaps_active_session`.
- Serialización segura en formato JSON con bloque `try/catch` defensivo.
- Si los datos recuperados están corruptos o no cumplen el esquema `AuthenticatedTechnician`, se purga automáticamente la clave y se retorna `null` para forzar una identificación limpia y segura.

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
  - `pendingCount: number`
  - `pendingLabel: string` (ej. "0 pendientes", "3 pendientes")
- **Acciones recibidas:**
  - `refreshStatus(): Promise<void>`

---

## 5. Estrategia de Pruebas Automatizadas

Framework de pruebas: Jest con soporte de TypeScript.

| Requisito | Archivo de Prueba | Casos Cubiertos |
| :--- | :--- | :--- |
| **RF-1, RF-2** | `src/domain/session/__tests__/sessionRules.test.ts` | - Validación exitosa con credenciales válidas.<br>- Sanitización de espacios en blanco en código.<br>- Rechazo de campos vacíos con mensaje en español.<br>- Rechazo de credenciales inexistentes o clave incorrecta. |
| **RF-5, RF-6** | `src/domain/session/__tests__/statusBarRules.test.ts` | - Formateo de "Con señal" para online.<br>- Formateo de "Sin señal" para offline o null.<br>- Formateo exacto de conteo ("0 pendientes", "1 pendiente", "5 pendientes"). |
| **RF-1, RF-3, RF-4** | `src/storage/session/__tests__/AsyncSessionStorage.test.ts` | - Guardado y recuperación íntegra de sesión de jornada.<br>- Eliminación total al cerrar sesión (`clearSession`).<br>- Tolerancia a JSON corrupto sin provocar excepción no controlada. |
| **RF-7, RNF-4** | `src/presentation/session/__tests__/useGlobalStatusController.test.ts` | - Actualización inmediata (<500ms) de la barra ante emisión de cambio de red.<br>- Actualización inmediata ante cambio emitido por el lector de cola. |

---

# Decisiones ADR

### ADR-REQ-01: Persistencia local tolerante a reinicios para clave-valor
- **Problema a resolver:** Persistir la sesión activa del técnico en el almacenamiento no volátil del dispositivo móvil, de forma que sobreviva a cierres forzados de la aplicación, suspensión en segundo plano o reinicio del terminal, sin necesidad de conexión a internet (RNF-1, RNF-2).
- **Capacidades requeridas:** Almacenamiento asíncrono persistente de cadenas y objetos serializados en formato clave-valor, compatible con el entorno Expo / React Native, con soporte para operaciones atómicas de lectura, escritura y eliminación de claves.
- **Requisitos trazados:** RF-1, RF-3, RF-4; RNF-1, RNF-2.
- **Se va a utilizar:** `@react-native-async-storage/async-storage` a través de la interfaz `ISessionStorage`.
- **Trazabilidad:** Resuelto en docs/adr/ADR-001-async-storage-sesion.md.
- **Comando de instalación:** `npx expo install @react-native-async-storage/async-storage`

### ADR-REQ-02: Monitoreo en tiempo real del estado de conectividad a la red
- **Problema a resolver:** Detectar de manera proactiva y continua si el dispositivo móvil se encuentra conectado a una red o sin señal, emitiendo eventos de cambio instantáneos para reflejar el estado actual en la barra de estado global en tiempo real (RF-5, RF-7, RNF-4).
- **Capacidades requeridas:** API de consulta de conectividad actual y suscripción a eventos de cambio de red (online/offline) nativos del sistema operativo móvil, con baja latencia y sin bloquear el hilo principal.
- **Requisitos trazados:** RF-5, RF-7; RNF-1, RNF-4.
- **Se va a utilizar:** `@react-native-community/netinfo` a través de la interfaz `INetworkStatusService`.
- **Trazabilidad:** Resuelto en docs/adr/ADR-002-netinfo-conectividad.md.
- **Comando de instalación:** `npx expo install @react-native-community/netinfo`

### ADR-REQ-03: Arnés de ejecución y aserciones para pruebas automatizadas unitarias
- **Problema a resolver:** Ejecutar de forma automatizada las pruebas unitarias de lógica pura y contratos de persistencia con soporte para TypeScript, garantizando la cobertura de los requisitos funcionales antes de iniciar la implementación (TDD) (Constitución P4, AGENTS.md).
- **Capacidades requeridas:** Motor de pruebas automatizadas compatible con TypeScript, tipado estático, capacidades de mocking para contratos de persistencia y temporizadores, ejecutable mediante `npx jest`.
- **Requisitos trazados:** RF-1 a RF-7; RNF-1, RNF-4.
