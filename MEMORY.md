# MEMORY.md – EPMAPS
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- Fase: Decisiones ADR (`sdd-adr`) de Spec 002 culminada con éxito.
- Documento generado: [docs/adr/ADR-004-axios-cliente-http.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/docs/adr/ADR-004-axios-cliente-http.md).
- [plan.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/002/plan.md) pasa a `Estado del Plan: Aprobado`.
- [tasks.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/002/tasks.md) listo con 5 tareas atómicas trazadas.

## Decisiones (y por qué)
- Spec 001: AsyncStorage (ADR-001), NetInfo (ADR-002) y Jest-Expo (ADR-003).
- Spec 002 (ADR-004): `axios` como cliente HTTP oficial para consultas GET y futura sincronización transaccional POST/PUT de lecturas en campo.
- Spec 002 (D1-D4): Formato `MED-XXXXXX`, caché 24h, degradación elegante sin señal y bloqueo estricto R10.

## Aprendizajes y errores a evitar
- Instalar `@react-native/jest-preset@0.86.3` para paridad con react-native 0.86.3 y jest-expo en Expo 57.
- Recordar al usuario completar la sección `## Uso de IA` en cada ADR para su defensa técnica.
- Mantener diseño en obra blanca funcional sin sobrecargar estilos hasta tener el flujo completo.

## Próximos pasos
- Solicitar autorización de instalación de `axios` y ejecutar `/sdd-implement 002` (subagente `sdd-implement`) para implementar las tareas T1 a T5 bajo TDD estricto en obra blanca.
