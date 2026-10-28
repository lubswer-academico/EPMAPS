# MEMORY.md – EPMAPS
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- Fase: Decisiones ADR (`sdd-adr`) culminada con éxito.
- HU activa: HU-001 (Inicio de sesión del técnico y barra de estado global).
- `specs/001/plan.md` pasa a `Estado del Plan: Aprobado`.
- Documentos generados: `docs/adr/ADR-001`, `ADR-002` y `ADR-003`.

## Decisiones (y por qué)
- ADR-001: `@react-native-async-storage/async-storage` para persistencia clave-valor ligera de sesión.
- ADR-002: `@react-native-community/netinfo` para suscripción nativa instantánea sin gasto de batería/datos.
- ADR-003: `jest-expo` + `jest` como arnés de pruebas TDD unitarias con soporte TypeScript.

## Aprendizajes y errores a evitar
- SQLite y React Query Persist descartados para HU-001 por sobreingeniería y naturaleza de estado local de sesión.
- Recordar al usuario completar la sección `## Uso de IA` en cada ADR para su defensa técnica.

## Próximos pasos
- Ejecutar `/sdd-implement 001` (subagente `sdd-implement`) para instalar dependencias aprobadas y ejecutar las tareas T1 a T10 bajo TDD estricto en obra blanca.

