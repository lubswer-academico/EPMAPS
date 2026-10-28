# AGENTS.md – EPMAPS Toma de Lecturas en Campo

Aplicación móvil para técnicos de campo de la Empresa Pública Metropolitana de Agua Potable y Saneamiento (EPMAPS) de Quito: registro de lecturas de medidores de agua con operación sin conexión (offline-first), persistencia local tolerante a cortes o cierres y sincronización automática hacia los sistemas de oficina.

## Stack y estructura
- Expo (TypeScript y Expo Router).
- Persistencia desacoplada con contratos e interfaces: almacenamiento local en el dispositivo y sincronización remota idempotente.
- `src/domain/`: lógica pura sin React ni APIs de almacenamiento (validación de código `MED-XXXXXX`, cálculo de consumo, detección de anomalías > 3x promedio, reglas de obligatoriedad según condición del medidor y unicidad mensual).
- `src/storage/`: implementaciones y adaptadores de persistencia (cola offline, caché de consultas de jornada y repositorios locales).
- `src/app/`: pantallas y navegación con Expo Router.
- Pruebas unitarias junto a cada módulo en carpetas `__tests__/`.

## Comandos
- Ejecutar la app: `npx expo start` (si la red bloquea o estás en Expo Go remoto: `npx expo start --tunnel`)
- Pruebas automatizadas: `npx jest`
- Chequeo de tipos: `npx tsc --noEmit`
- Linter: `npx expo lint`

## Convenciones
- Código, variables y nombres de archivos en inglés; textos visibles de interfaz, mensajes al usuario y comentarios en español.
- Regla offline-first: toda captura se guarda de inmediato en cola local persistente antes de intentar cualquier sincronización remota.
- Las decisiones de diseño y comportamiento se toman en la spec de cada historia (`specs/<id-spec>/decisiones.md`), nunca se improvisan.
- Estilos con StyleSheet respetando áreas seguras y objetivos táctiles mínimos de 48x48 pt.

## Forma de trabajar
- Antes de escribir código, lee siempre `docs/constitution.md`, `MEMORY.md` y la spec activa (`specs/<id-spec>/decisiones.md`, `spec.md`, `plan.md`).
- Trabaja siguiendo el flujo de SDD evolucionado de Antigravity (`.agents/skills/` y `.agents/agents/`):
  - Subagente `sdd-spec`: Lectura global de historias (`docs/historias/`) para blindar el alcance en `spec.md` y `decisiones.md`.
  - Subagente `sdd-plan`: Lógica, persistencia, necesidades en `# Decisiones ADR` y desglose de `tasks.md`.
  - Subagente `sdd-adr`: Resolución técnica colaborativa de dependencias en `docs/adr/` extendiendo el plan.
  - Subagente `sdd-implement`: TDD con Jest, UI funcional en obra blanca y generación de `specs/<id-spec>/design.md`.
  - Subagente `sdd-design`: Lectura de todas las obras blancas (`specs/*/design.md`), mockup visual SVG y estilos limpios.
- Muestra el plan antes de escribir y pide confirmación. Si tienes dudas o ambigüedades, para y pregunta antes de asumir.

## Límites
- Siempre: pruebas primero en la lógica de dominio (`src/domain/`) con `npx jest` en rojo antes de codificar, y textos de interfaz en español.
- Pregunta antes de: instalar dependencias nuevas, crear archivos fuera de lo aprobado en `plan.md` o modificar interfaces de almacenamiento.
- Nunca: depender de conexión obligatoria para capturar lecturas, permitir duplicados de un mismo medidor en el mismo mes, ni alterar lecturas ya enviadas.

## Memoria
- Al empezar cada sesión con `/new`, lee `MEMORY.md`.
- Al culminar una fase o tarea, actualiza las 4 secciones estándar de `MEMORY.md` (`Estado actual`, `Decisiones`, `Aprendizajes y errores a evitar`, `Próximos pasos`), indicando exactamente el siguiente comando o agente a ejecutar.
- No copies decisiones completas ni especificaciones en `MEMORY.md`: remite al archivo correspondiente (`specs/<id-spec>/`). Mantén el archivo en ~50 líneas.

## Verificación
- Lógica de dominio, cálculos de consumo y reglas offline: `npx jest` con todas las pruebas en verde.
- Flujos multipantalla, fotos y estado de conectividad: verificación manual con lista de comprobación en Expo Go.
