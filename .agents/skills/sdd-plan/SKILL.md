---
name: sdd-plan
description: Diseña el plan técnico y arquitectónico (plan.md) de una spec aprobada, definiendo lógica pura, persistencia pragmática y necesidades técnicas de librerías desacopladas sin sobreingeniería.
---

# SDD - Plan Técnico y Arquitectura (`/sdd-plan`)

## Uso
`/sdd-plan <NNN-nombre>`

## Entradas Requeridas
- `specs/<id-spec>/spec.md` (debe tener `Estado: aprobada` y sin dudas pendientes).
- `specs/<id-spec>/decisiones.md`.
- `docs/constitution.md` y `AGENTS.md`.
- Lectura de `docs/historias/` para respetar fronteras de historias futuras.

## Principios de Simplicidad Pragmática (KISS & YAGNI)
- **Cero anticipación (YAGNI):** Diseña única y exclusivamente para la historia actual. Prohibido crear contratos, adaptadores, tipos o suscriptores para entidades que pertenezcan a historias futuras (ej. no modelar colas ni lectores de sincronización en HU-001; usa un valor o función simple que devuelva `0`).
- **Abstracción justificada:** No crees interfaces abstractas (`I...Storage`) ni adaptadores dobles en memoria (`Memory...`) para operaciones clave-valor simples o lecturas triviales, a menos que un test unitario en Jest lo requiera estrictamente. Prefiere funciones utilitarias o wrappers limpios.
- **Enfoque en Dominio Testeable:** Concéntrate en extraer la lógica de cálculo, validación y formateo en funciones puras en `src/domain/` para lograr pruebas unitarias rápidas y directas con Jest.

## Contenido de `specs/<id-spec>/plan.md`

Genera únicamente `specs/<id-spec>/plan.md` cubriendo:

1. **Responsabilidad de Archivos:** Mapa mínimo y suficiente de archivos a crear o modificar.
2. **Dominio y Lógica Pura (`src/domain/`):** Funciones deterministas sin React ni almacenamiento.
3. **Persistencia y Almacenamiento (`src/storage/`):** Métodos concretos y serialización segura tolerante a fallos, evitando patrones de diseño excesivos para operaciones simples.
4. **Contrato de Presentación y Estado:** Qué datos expone el motor y qué eventos recibe (hooks/controladores), **sin diseñar componentes visuales** (el diseño visual se posterga a la fase de diseño).
5. **Estrategia de Pruebas Automatizadas:** Casos y cobertura requisito por requisito con Jest.
6. **Sección Obligatoria `# Decisiones ADR` (Cualquier Capacidad Técnica Nueva):**
   - **Principio Rector:** El objetivo NO es evitar dependencias a toda costa ni elegir APIs nativas en silencio, sino identificar qué capacidades técnicas nuevas requiere la historia y evaluar con qué resolverlas mediante un ADR formal.
   - **Prohibido pre-decidir APIs nativas o librerías:** Si una historia requiere por primera vez una capacidad técnica (ej. cliente HTTP para consultar un servidor, plataforma mock de backend, captura de cámara, geolocalización, subida de archivos), **ESTÁ PROHIBIDO** decidir en `plan.md` que se usará `fetch` nativo, catálogos en memoria o cualquier herramienta específica si no existe ya un archivo `docs/adr/ADR-XXX.md` que avale esa decisión.
   - **Obligación:** Toda capacidad técnica nueva no cubierta por los ADRs existentes en `docs/adr/` DEBE declararse como un `ADR-REQ-XX` agnóstico (sin mencionar nombres como `fetch`, `Axios`, `MockAPI`, etc.):
     ```markdown
     # Decisiones ADR

     ### ADR-REQ-01: [Nombre descriptivo de la necesidad técnica]
     - Problema a resolver: [Qué necesidad de comunicación, hardware o infraestructura se debe cubrir].
     - Capacidades requeridas: [Qué funciones, manejo de timeouts, errores o persistencia debe ofrecer la solución elegida, sea nativa o librería externa].
     - Requisitos trazados: RF-x, RF-y; RNF-z.
     ```
   - **Regla de Aprobación:** Mientras exista al menos un `ADR-REQ-XX` no resuelto en `docs/adr/`, el estado del plan DEBE ser:
     > `*Estado del Plan: Pendiente de resolución de Decisiones ADR antes de iniciar la implementación.*`
7. **Trazabilidad hacia `tasks.md`:**
   - Toda tarea que involucre una librería pendiente de definir debe incluir el vínculo: `Requiere: ADR-REQ-XX de plan.md`.

## Prohibiciones Estrictas
- PROHIBIDO la sobreingeniería: no inventes capas intermedias innecesarias para casos de uso triviales.
- PROHIBIDO diseñar contratos o estructuras de datos para requerimientos de historias futuras.
- PROHIBIDO escribir código de producción o tests aquí.
- PROHIBIDO instalar paquetes (`npm`, `expo install`).
- PROHIBIDO diseñar pantallas finales o botones (eso pertenece a `/sdd-plan-design`).