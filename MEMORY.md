# MEMORY.md – EPMAPS
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- Fase: Implementación técnica y obra blanca (`sdd-implement`) de Spec 001 completada al 100%.
- Tareas T1 a T6 de [tasks.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/001/tasks.md) finalizadas y marcadas.
- Pruebas unitarias Jest: 3 suites, 16 tests pasando en verde (`npx jest`).
- Verificación estática: `npx tsc --noEmit` y `npx eslint` completamente limpios.
- Contrato de diseño generado en [design.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/001/design.md).

## Decisiones (y por qué)
- Persistencia con `AsyncStorage` defensivo ante JSON corrupto (purga preventiva automática).
- Catálogo estático de 3 técnicos para validación offline instantánea.
- `GlobalStatusBar` conectada a eventos nativos de NetInfo ("Con señal" / "Sin señal") y conteo "0 pendientes".
- Interfaz en obra blanca garantizando área táctil mínima de 48x48 pt y textos oficiales en español.

## Aprendizajes y errores a evitar
- Instalar `@react-native/jest-preset@0.86.3` para paridad estricta con react-native 0.86.3 y jest-expo en Expo 57.
- Ejecutar `npx expo customize tsconfig.json` tras agregar rutas para que Expo Router genere los tipos tipados de rutas automáticas.
- Usar factory require dentro de `jest.mock` para compatibilidad con el linter de TypeScript.

## Próximos pasos
- El usuario puede probar el flujo funcional en Expo Go (`npx expo start`).
- Ejecutar subagente `/sdd-plan-design 001` (o pasar a `sdd-design`) para definir mockups SVG, paleta cromática y diseño final según [design.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/001/design.md).
