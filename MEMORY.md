# MEMORY.md – EPMAPS
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- Fase: Implementación técnica (`sdd-implement`) y Obra Blanca de la Spec 005 completadas.
- Tareas: T1 a T5 completadas `[x]` en [specs/005/tasks.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/005/tasks.md).
- Contrato de diseño generado en [specs/005/design.md](file:///C:/Users/usuario/Desktop/Movil/prueba1/EPMAPS/specs/005/design.md).
- Calidad: 15 suites / 151 tests pasando 100% en verde con Jest (`npx jest`) y 0 errores en TypeScript (`npx tsc --noEmit`).
- Regla negocio post-005: si la verificación diferida falla por 404 (medidor inexistente), transiciona a `REQUIRES_ATTENTION` con motivo exacto 'Medidor inexistente en catastro' sin POST a `/lecturas`.
- Acción 'Descartar lectura' habilitada en bandeja (`reading-queue.tsx`) y detalle (`reading-detail.tsx`): elimina de AsyncStorage, purga archivo de foto en `expo-file-system` y descuenta el contador de pendientes.
- Sincronización 100% autónoma y desatendida (HU-005 Escenario 1): eliminado botón manual redundante (KISS/YAGNI). Disparo automático al recuperar red, reintentos progresivos ante fallos y envío de fondo al capturar con red.

## Decisiones (y por qué)
- Spec 001: AsyncStorage (ADR-001), NetInfo (ADR-002) y Jest-Expo (ADR-003).
- Spec 002: Axios (ADR-004) para llamadas HTTP a la oficina central.
- Spec 003: `expo-image-picker` (ADR-005) y `expo-file-system/legacy` (ADR-006). Wizard de captura desacoplado con borradores y guardado local.
- Spec 004: Bandeja unificada en `reading-queue.tsx`, detalle en `reading-detail.tsx`, inmutabilidad absoluta de lecturas enviadas (`SUBMITTED`) y edición in-place.
- Spec 005: Sincronización reactiva 100% autónoma al detectar red montada en raíz (`_layout.tsx`) y sin intervención del técnico; verificación diferida (D2); idempotencia por UUID comercial (`clientReadingId`) (D3); y persistencia local de fotos bajo R7.

## Aprendizajes y errores a evitar
- Sincronización autónoma: un único listener global coordina la cola y reintentos, evitando colisiones de envío entre pantallas.
- Si un cotejo diferido descubre consumo anómalo o código inexistente, solo se retiene esa lectura puntual, permitiendo que el resto de lecturas válidas de la cola continúen su envío.
- Toda transmisión ante microcortes mantiene inalterable el `clientReadingId` para que el backend o MockAPI no duplique registros.

## Próximos pasos
- Ejecutar el subagente de diseño `/sdd-plan-design 005` (o `/sdd-design`) para la estilización visual definitiva sobre la obra blanca.

