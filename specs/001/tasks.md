# Tareas Técnicas – Spec 001: Inicio de sesión del técnico y barra de estado global

Desglose secuencial de tareas atómicas (máximo 20-30 minutos cada una) enfocadas en lógica pura, persistencia e interfaces de estado.

- [ ] **T1. Configuración del arnés de pruebas automatizadas con soporte TypeScript.** RNF-1, RNF-4
  - Requiere: ADR-REQ-03 de plan.md
  - Hecho cuando: El comando `npx jest` se ejecute correctamente en el proyecto y detecte las suites de pruebas unitarias sin errores de tipado o módulos.

- [ ] **T2. Tipos de datos puros y catálogo de credenciales offline.** RF-1, RF-2, RNF-1
  - Hecho cuando: `src/domain/session/types.ts` y `src/domain/session/credentialsCatalog.ts` definan los tipos `TechnicianCredentials`, `AuthenticatedTechnician`, `SessionValidationResult`, `ConnectionStatus` y el catálogo local de técnicos autorizados sin dependencias externas.

- [ ] **T3. Lógica pura de validación de credenciales y recorte de espacios.** RF-1, RF-2, RNF-5
  - Hecho cuando: La suite `src/domain/session/__tests__/sessionRules.test.ts` pase al 100% en verde con `npx jest`, cubriendo recorte de espacios, obligatoriedad de campos y validación contra catálogo determinista.

- [ ] **T4. Lógica pura de formato de barra de estado y conteo de pendientes.** RF-5, RF-6, RNF-5
  - Hecho cuando: La suite `src/domain/session/__tests__/statusBarRules.test.ts` pase al 100% en verde con `npx jest`, verificando las salidas exactas de "Con señal", "Sin señal", "0 pendientes" y "N pendientes".

- [ ] **T5. Contratos e implementación en memoria de almacenamiento de sesión y cola.** RF-1, RF-3, RF-4, RF-6
  - Hecho cuando: `ISessionStorage` y `IQueueCountReader` estén definidos junto con sus adaptadores en memoria (`MemorySessionStorage.ts` y `MemoryQueueCountReader.ts`) y compilen sin errores con `npx tsc --noEmit`.

- [ ] **T6. Implementación de persistencia local tolerante a reinicios para sesión.** RF-1, RF-3, RF-4, RNF-2
  - Requiere: ADR-REQ-01 de plan.md
  - Hecho cuando: `src/storage/session/AsyncSessionStorage.ts` implemente `ISessionStorage` serializando a JSON seguro, y la suite `src/storage/session/__tests__/AsyncSessionStorage.test.ts` pase en verde probando guardado, recuperación, cierre y recuperación ante JSON corrupto.

- [ ] **T7. Adaptador y suscripción al monitor de red nativo.** RF-5, RF-7, RNF-4
  - Requiere: ADR-REQ-02 de plan.md
  - Hecho cuando: Se cree la implementación concreta de `INetworkMonitor` vinculada a los eventos de red del dispositivo y se valide su inicialización y desuscripción limpia.

- [ ] **T8. Controlador desacoplado de sesión de usuario.** RF-1, RF-2, RF-3, RF-4, RNF-2
  - Hecho cuando: `useSessionController` gestione el ciclo de vida (login, logout, restauración al inicio) usando la abstracción `ISessionStorage` y pase en verde su suite de pruebas unitarias `src/presentation/session/__tests__/useSessionController.test.ts`.

- [ ] **T9. Controlador desacoplado de barra de estado global.** RF-5, RF-6, RF-7, RNF-4
  - Hecho cuando: `useGlobalStatusController` sincronice el estado reactivo ante cambios emitidos por `INetworkMonitor` y `IQueueCountReader` con latencia <500 ms y su suite `src/presentation/session/__tests__/useGlobalStatusController.test.ts` pase en verde.

- [ ] **T10. Montaje funcional en obra blanca de pantallas y barra de estado.** RF-1, RF-3, RF-4, RF-5, RF-6, RNF-3
  - Hecho cuando: Las pantallas en obra blanca (`login.tsx`, `home.tsx` y `GlobalStatusBar.tsx`) permitan ingresar credenciales, navegar, visualizar "Con señal"/"Sin señal" y "0 pendientes", cerrar sesión y cumplir el área táctil mínima de 48x48 pt.
