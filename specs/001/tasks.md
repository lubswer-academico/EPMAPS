# Tareas Técnicas – Spec 001: Inicio de sesión del técnico y barra de estado global

Desglose secuencial simplificado de 6 tareas indispensables (KISS / YAGNI), eliminando interfaces dobles o colas simuladas innecesarias:

- [x] **T1. Configuración del arnés de pruebas automatizadas con soporte TypeScript.** RNF-1, RNF-4
  - Requiere: ADR-REQ-03 de plan.md
  - Hecho cuando: Se instale `jest-expo`, `jest`, `@types/jest`, se configure `package.json` con `"test": "jest"` y `npx jest` se ejecute sin errores.

- [x] **T2. Tipos de datos puros y catálogo offline de técnicos.** RF-1, RF-2, RNF-1
  - Hecho cuando: `src/domain/session/types.ts` y `src/domain/session/credentialsCatalog.ts` definan los tipos (`TechnicianCredentials`, `AuthenticatedTechnician`, `SessionValidationResult`, `ConnectionStatus`) y el catálogo determinista sin dependencias externas.

- [x] **T3. Lógica pura de validación, sanitización y barra de estado con pruebas unitarias.** RF-1, RF-2, RF-5, RF-6, RNF-5
  - Hecho cuando: Las suites `sessionRules.test.ts` y `statusBarRules.test.ts` pasen al 100% en verde con `npx jest`, cubriendo recorte de espacios, mensajes de error en español, validación offline, etiquetas "Con señal"/"Sin señal" y retorno directo de "0 pendientes".

- [x] **T4. Módulo de persistencia directa de sesión con AsyncStorage y pruebas unitarias.** RF-1, RF-3, RF-4, RNF-2
  - Requiere: ADR-REQ-01 de plan.md
  - Hecho cuando: Se instale `@react-native-async-storage/async-storage`, `src/storage/session/sessionStorage.ts` implemente el guardado/recuperación/borrado con parseo seguro de JSON y la suite `sessionStorage.test.ts` pase en verde con `npx jest`.

- [x] **T5. Módulo de monitoreo de red y controladores de estado.** RF-5, RF-7, RNF-4
  - Requiere: ADR-REQ-02 de plan.md
  - Hecho cuando: Se instale `@react-native-community/netinfo`, `networkMonitor.ts` se suscriba a los eventos nativos, y los hooks `useSessionController` y `useGlobalStatusController` expongan el estado y acciones requeridas.

- [x] **T6. Vistas y navegación en obra blanca con barra de estado global.** RF-1, RF-3, RF-4, RF-5, RF-6, RNF-3
  - Hecho cuando: La pantalla `login.tsx` permita autenticarse, `home.tsx` muestre la bienvenida con botón para cerrar turno, `GlobalStatusBar.tsx` refleje en tiempo real la señal y "0 pendientes", cumpliendo el área táctil mínima de 48x48 pt.
