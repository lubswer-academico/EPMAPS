# Tareas Técnicas – Spec 002: Identificación y consulta de medidor con caché de jornada

Desglose secuencial de 5 tareas atómicas indispensables (KISS / YAGNI), garantizando lógica pura, cliente HTTP ligero nativo, persistencia directa y visualización en obra blanca:

- [x] **T1. Tipos de datos de medidor y cliente HTTP de oficina.** RF-3, RF-6
  - Requiere: ADR-REQ-01 de plan.md
  - Hecho cuando: `src/domain/meter/types.ts` defina las estructuras (`MeterRecord`, `MeterStatus`, `MeterValidationResult`, `MonthlyDuplicateCheckResult`, `CachedMeterEntry`), `src/services/officeApi.ts` implemente la consulta HTTP remota según la herramienta acordada en el ADR hacia el recurso `/medidores`, y la suite `officeApi.test.ts` pase al 100% en verde con `npx jest` probando los 7 campos del medidor, medidor no encontrado (404/vacío) y error de red.

- [x] **T2. Lógica pura de validación, normalización de código, expiración de caché y duplicidad mensual.** RF-1, RF-2, RF-5, RF-8
  - Hecho cuando: `src/domain/meter/meterRules.ts` implemente la normalización de mayúsculas, asistencia del prefijo `MED-`, validación estricta `^MED-\d{6}$`, expiración a las 24 horas y cálculo de duplicidad mensual R10, con la suite `meterRules.test.ts` pasando al 100% en verde con `npx jest`.

- [x] **T3. Módulo de persistencia directa de caché de jornada con AsyncStorage.** RF-3, RF-4, RF-8, RNF-2, RNF-3
  - Hecho cuando: `src/storage/meter/meterCacheStorage.ts` implemente guardado, recuperación, purga de >24h y vaciado total de caché usando `@react-native-async-storage/async-storage`, y la suite `meterCacheStorage.test.ts` pase al 100% en verde con `npx jest`.

- [x] **T4. Hook controlador de búsqueda de medidor integrando caché y MockAPI.** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7
  - Hecho cuando: `src/presentation/meter/useMeterSearchController.ts` orqueste la consulta priorizando el caché de jornada, consultando a MockAPI vía `officeApi` si hay señal y no estaba en caché, degradando a advertencia sin señal (D3) si está desconectado, bloqueando por duplicidad R10 (D4) y exponiendo el estado y acciones completas.

- [x] **T5. Pantalla de búsqueda de medidor en obra blanca y navegación.** RF-1, RF-2, RF-3, RF-4, RF-5, RF-6, RF-7, RNF-4, RNF-5
  - Hecho cuando: `src/app/meter-search.tsx` presente la interfaz funcional accesible (botones >= 48x48 pt, mensajes en español), permita buscar medidores, muestre la ficha técnica de 7 campos, degrade elegantemente sin señal ("Continuar a captura sin datos previos"), gestione el bloqueo R10 y se enlace desde la pantalla principal `home.tsx`.
