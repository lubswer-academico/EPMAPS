# MEMORY.md – EPMAPS
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- Fase: Decisiones ADR (`sdd-adr`) de Spec 003 culminada con éxito.
- Documentos generados: [docs/adr/ADR-005-expo-image-picker-camara.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/docs/adr/ADR-005-expo-image-picker-camara.md) y [docs/adr/ADR-006-expo-file-system-fotos.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/docs/adr/ADR-006-expo-file-system-fotos.md).
- [plan.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/003/plan.md) pasa a `Estado del Plan: Aprobado`.
- [tasks.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/003/tasks.md) listo con 5 tareas atómicas trazadas.

## Decisiones (y por qué)
- Spec 001: AsyncStorage (ADR-001), NetInfo (ADR-002) y Jest-Expo (ADR-003).
- Spec 002 (ADR-004): `axios` como cliente HTTP oficial.
- Spec 003 (ADR-005): `expo-image-picker` para cámara nativa con flash/antorcha integrado para medidores oscuros.
- Spec 003 (ADR-006): `expo-file-system` para persistir fotos duraderas en `documentDirectory` sin saturar AsyncStorage.

## Aprendizajes y errores a evitar
- Instalar `@react-native/jest-preset@0.86.3` para paridad con react-native 0.86.3 y jest-expo en Expo 57.
- Recordar al usuario completar la sección `## Uso de IA` en cada ADR para su defensa técnica.
- Mantener diseño en obra blanca funcional sin sobrecargar estilos hasta tener el flujo completo.

## Próximos pasos
- Solicitar autorización de instalación de `expo-image-picker` y `expo-file-system`, y ejecutar `/sdd-implement 003` (subagente `sdd-implement`) para implementar las tareas T1 a T5 bajo TDD estricto en obra blanca.
