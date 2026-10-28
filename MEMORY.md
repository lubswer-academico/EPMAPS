# MEMORY.md – EPMAPS
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- Fase: Planificación Técnica (`sdd-plan`) completada.
- HU activa: HU-001 (Inicio de sesión del técnico y barra de estado global).
- `specs/001/plan.md` y `specs/001/tasks.md` generados (máximo 10 tareas).

## Decisiones (y por qué)
- D1-D4 en `specs/001/decisiones.md`.
- Necesidades técnicas declaradas en `plan.md` (# Decisiones ADR): ADR-REQ-01 (almacenamiento clave-valor tolerante a reinicios), ADR-REQ-02 (monitoreo de conectividad en tiempo real) y ADR-REQ-03 (arnés de pruebas automatizadas con Jest).

## Aprendizajes y errores a evitar
- No nombrar librerías npm en `plan.md` ni `tasks.md`; mantener la selección formal en manos de `sdd-adr`.
- El plan permanece en estado pendiente hasta resolver las decisiones ADR con el usuario.

## Próximos pasos
- Invocar al subagente `/sdd-adr 001` para debatir y resolver formalmente ADR-REQ-01, ADR-REQ-02 y ADR-REQ-03 en `docs/adr/`.

