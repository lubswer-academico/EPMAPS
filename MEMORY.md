# MEMORY.md – EPMAPS
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- Fase: Especificación de Requisitos (`sdd-spec`) para HU-004 completada.
- Documentos creados en [specs/004/decisiones.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/004/decisiones.md) (D1 a D4) y [specs/004/spec.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/004/spec.md) (Estado: borrador).
- Suite de pruebas completa: 9 suites, 86 pruebas pasando en verde (`npx jest`). Chequeo de tipos limpio (`npx tsc --noEmit`).
- Fronteras blindadas: HU-004 formaliza la bandeja local, el estado "Pendiente de verificar", la edición de no enviadas y la inmutabilidad de enviadas; la verificación diferida y sincronización automática quedan reservadas para HU-005.

## Decisiones (y por qué)
- Spec 001: AsyncStorage (ADR-001), NetInfo (ADR-002) y Jest-Expo (ADR-003).
- Spec 002: Axios (ADR-004) para llamadas HTTP a la oficina central.
- Spec 003: `expo-image-picker` (ADR-005) y `expo-file-system/legacy` (ADR-006). Wizard de captura desacoplado con borradores y guardado local.
- Spec 004: Bandeja unificada con estados (Pendiente de verificar, Pendiente de enviar, Enviada), edición in-place respetando unicidad mensual, ciclo de vida de fotos con limpieza de huérfanos e inmutabilidad estricta de enviadas.

## Aprendizajes y errores a evitar
- La verificación diferida contra la oficina al recuperar la red no debe incluirse en HU-004; pertenece estrictamente a HU-005.
- La edición de lecturas pendientes actualiza la misma entidad local (mismo id y código) para garantizar la regla de un solo registro mensual por medidor (R10).

## Próximos pasos
- Solicitar aprobación formal del usuario para pasar `specs/004/spec.md` de `borrador` a `aprobada`.
- Una vez aprobada la spec, invocar al subagente `sdd-plan` para diseñar la arquitectura y el desglose de tareas en `specs/004/plan.md`.
