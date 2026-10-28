# MEMORY.md – EPMAPS
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- Fase: Planificación Técnica y Tareas de Spec 003 (`sdd-plan`) COMPLETADA.
- Artefactos: [specs/003/plan.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/003/plan.md) y [specs/003/tasks.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/003/tasks.md) generados.
- Suite automatizada base: 43/43 pruebas unitarias pasando en verde (`npx jest`) y chequeo de tipos limpio (`npx tsc --noEmit`).

## Decisiones (y por qué)
- Spec 001: AsyncStorage (ADR-001), NetInfo (ADR-002) y Jest-Expo (ADR-003).
- Spec 002 (ADR-004): `axios` como cliente HTTP oficial para consultas GET y sincronización futura.
- Spec 003: Arquitectura modular directa (`src/domain/reading/`, `src/storage/reading/`, `src/services/photo/`, `src/presentation/reading/`). Persistencia de borradores en caliente con AsyncStorage. Declaradas 2 necesidades ADR agnósticas (ADR-REQ-01 y ADR-REQ-02) pendientes de resolución técnica.

## Aprendizajes y errores a evitar
- Respetar el blindaje de fronteras: edición de cola en HU-004; sincronización masiva y subida externa de fotos en HU-005.
- Punto 6 de sdd-plan: Nunca nombrar librerías npm antes de resolver el ADR formal. Dejar el plan en estado pendiente de resolución ADR.

## Próximos pasos
- Ejecutar el subagente `/sdd-adr 003` para debatir y resolver formalmente ADR-REQ-01 (cámara) y ADR-REQ-02 (archivos de imagen locales).
