# MEMORY.md – EPMAPS
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- Fase: Especificación de requisitos (`sdd-spec`) para HU-005 culminada en estado borrador.
- Documentos: [specs/005/decisiones.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/005/decisiones.md) y [specs/005/spec.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/005/spec.md) creados.
- Con HU-005 se cubre la totalidad de los requisitos funcionales del producto v1.0 (HU-001 a HU-005).
- Pruebas y Tipos: 12 suites / 110 tests pasando en verde con Jest (`npx jest`) y 0 errores en TypeScript (`npx tsc --noEmit`).

## Decisiones (y por qué)
- Spec 001: AsyncStorage (ADR-001), NetInfo (ADR-002) y Jest-Expo (ADR-003).
- Spec 002: Axios (ADR-004) para llamadas HTTP a la oficina central.
- Spec 003: `expo-image-picker` (ADR-005) y `expo-file-system/legacy` (ADR-006). Wizard de captura desacoplado con borradores y guardado local.
- Spec 004: Bandeja unificada en `reading-queue.tsx`, detalle en `reading-detail.tsx`, inmutabilidad absoluta de lecturas enviadas (`SUBMITTED`) y edición in-place.
- Spec 005: Sincronización reactiva por eventos de red + botón manual (D1); verificación diferida con retención aislada si hay consumo anómalo > 3x sin foto/confirmación pasando a "Requiere atención" (D2); idempotencia estricta mediante UUID de captura unívoco (`clientReadingId`) (D3); y sincronización directa en una sola fase hacia MockAPI (/lecturas) referenciando la foto por su URI local según R7. Subida a Cloudinary/ImgBB descartada a "Fuera de alcance".

## Aprendizajes y errores a evitar
- Si un cotejo diferido descubre consumo anómalo, solo se retiene esa lectura puntual, permitiendo que el resto de lecturas válidas de la cola continúen su envío.
- Toda transmisión ante microcortes debe mantener inalterable el `clientReadingId` para que el backend o MockAPI no duplique registros.
- La foto se conserva físicamente en disco local permanente (`epmaps_photos/`) y viaja referenciada por su identificador/URI en el JSON comercial hacia la oficina.

## Próximos pasos
- Obtener la aprobación formal del usuario para Spec 005 (`Estado: aprobada`).
- Ejecutar el subagente `/sdd-plan 005` para diseñar el plan técnico, contratos de sincronización y necesidades de ADR.
