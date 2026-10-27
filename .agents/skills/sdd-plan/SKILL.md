---
name: sdd-plan
description: Diseña el plan técnico y arquitectónico (plan.md) de una spec aprobada, definiendo lógica pura, contratos de storage y necesidades técnicas de librerías desacopladas.
---

# SDD - Plan Técnico y Arquitectura (`/sdd-plan`)

## Uso
`/sdd-plan <NNN-nombre>`

## Entradas Requeridas
- `specs/<id-spec>/spec.md` (debe tener `Estado: aprobada` y sin dudas pendientes).
- `specs/<id-spec>/decisiones.md`.
- `docs/constitution.md` y `AGENTS.md`.
- Lectura de `docs/historias/` para respetar fronteras de historias futuras.

## Contenido de `specs/<id-spec>/plan.md`

Genera únicamente `specs/<id-spec>/plan.md` cubriendo:

1. **Responsabilidad de Archivos:** Mapa de archivos a crear o modificar.
2. **Dominio y Lógica Pura (`src/domain/`):** Funciones deterministas sin React ni almacenamiento.
3. **Persistencia e Interfaces (`src/storage/`):** Contratos de repositorios y serialización tolerante a fallos.
4. **Contrato de Presentación y Estado:** Qué datos expone el motor y qué eventos recibe (hooks/controladores), **sin diseñar componentes visuales** (el diseño visual se posterga a la fase de diseño).
5. **Estrategia de Pruebas Automatizadas:** Casos y cobertura requisito por requisito.
6. **Sección Obligatoria `# Decisiones ADR`:**
   - Lista cada una de las necesidades técnicas que requieren una librería externa, **una por una** (nunca dos necesidades en una sola entrada).
   - **Regla estricta:** NO inventes ni menciones nombres de librerías comerciales o paquetes `npm` en este archivo.
   - Describe únicamente qué se quiere resolver, qué necesita que haga la librería y su trazabilidad:
     ```markdown
     # Decisiones ADR

     ### ADR-REQ-01: [Nombre descriptivo de la necesidad técnica]
     - Problema a resolver: [Qué necesidad del sistema se debe cubrir].
     - Capacidades requeridas: [Qué funciones o rendimiento debe aportar la librería].
     - Requisitos trazados: RF-x, RF-y; RNF-z.
     ```
   - **Regla de Aprobación:** El plan **NO** se considera aprobado si las Decisiones ADR no han sido resueltas formalmente por el evaluador de dependencias. Deja explícita la nota:
     > `*Estado del Plan: Pendiente de resolución de Decisiones ADR antes de iniciar la implementación.*`
7. **Trazabilidad hacia `tasks.md`:**
   - Toda tarea que involucre una librería pendiente de definir debe incluir el vínculo: `Requiere: ADR-REQ-XX de plan.md`.

## Prohibiciones Estrictas
- PROHIBIDO escribir código de producción o tests aquí.
- PROHIBIDO instalar paquetes (`npm`, `expo install`).
- PROHIBIDO diseñar pantallas finales o botones (eso pertenece a `/sdd-plan-design`).
