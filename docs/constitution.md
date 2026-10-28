# Constitución del Proyecto

Principios innegociables. Toda spec, plan, implementación y diseño debe cumplirlos.

1. **Simplicidad y dependencias justificadas**: Solo se admiten dependencias esenciales acordadas formalmente mediante el diálogo técnico `/sdd-adr` (registradas en `docs/adr/` y extendidas en `plan.md`) o autorizadas en `AGENTS.md`. Prohibidas librerías improvisadas, publicidad o dependencias no discutidas.
2. **Ciclo SDD por fases desacopladas**:
   - `sdd-spec`: Blinda el alcance de las historias y las fronteras de negocio en `spec.md` y `decisiones.md`.
   - `sdd-plan` y `sdd-adr`: Resuelven contratos, arquitectura, selección técnica justificada y el desglose en `tasks.md`.
   - `sdd-implement`: Construye la lógica con TDD estricto, levanta la interfaz interactiva en **obra blanca** para validación humana de flujos en pantalla real (Expo Go) y genera `specs/<id-spec>/design.md` con las necesidades estructurales.
   - `sdd-design`: Lee transversalmente todas las obras blancas (`specs/*/design.md`) para garantizar coherencia global, propone mockups en SVG bajo Atomic Design y aplica los estilos visuales definitivos sin alterar la lógica.
3. **Lógica desacoplada de persistencia e interfaz**: Las reglas de negocio, validaciones y cálculos residen en funciones puras en `src/domain/`, completamente libres de React y mecanismos de almacenamiento. La persistencia se comunica a través de contratos e interfaces en `src/storage/`.
4. **TDD como puerta y validación en pantalla real**: La lógica de dominio se construye mediante pruebas unitarias en Jest (rojo -> verde -> refactor). Prohibido avanzar con pruebas en rojo. La interfaz en obra blanca y los componentes estilizados se validan en dispositivo real mediante la lista de verificación en Expo Go.
5. **Determinismo y tolerancia a condiciones reales**: Ningún cálculo o estado crítico depende del ciclo de renderizado o de la pantalla activa. Los cálculos temporales y de sincronización operan sobre marcas de tiempo absolutas y almacenamiento seguro para tolerar bloqueos de pantalla, reinicios o cortes de conectividad.
6. **Evolución visual guiada por la obra blanca**: El diseño estético no interrumpe ni condiciona la lógica funcional previa. Toda decisión visual se origina en la experiencia interactiva probada de `specs/NNN/design.md`, respetando accesibilidad, áreas táctiles mínimas (48x48 pt) y consistencia entre pantallas.

## Principios de Simplicidad y Arquitectura Pragmática (KISS & YAGNI)

- **Prohibido anticipar requerimientos futuros (YAGNI):** Diseña única y exclusivamente para la historia actual. No crees interfaces, contratos vacíos ni adaptadores de lectura para entidades de historias futuras (ej. no crear colas ni sincronizadores en HU-001 si corresponden a HU-004/005).
- **Evitar abstracción prematura:** No crees interfaces (`I...Storage`) ni clases adaptadoras en memoria (`Memory...`) a menos que sean estrictamente indispensables para una prueba de Jest. Si una función utilitaria o un hook directo resuelve la necesidad, prefiérelo frente a patrones de diseño complejos.
- **Minimizar dependencias y boilerplate:** Respeta la restricción del cliente: *"Cada dependencia no justificada resta puntos"*. Prefiere APIs directas y estándar de Expo/React Native.
- **Enfoque en Dominio Testeable:** La separación de capas se limita a extraer la lógica de cálculo y validación matemática/negocio en funciones puras (`src/domain/`) fáciles de probar con Jest, sin sobrecargar la capa de almacenamiento con patrones empresariales excesivos.