---
name: sdd-spec
description: Guía y plantilla para redactar especificaciones formales (spec.md) en sintaxis EARS y registros de decisiones (decisiones.md) con lectura global de historias y blindaje de fronteras.
---

# SDD - Especificación de Requisitos (`/sdd-spec`)

## Uso
`/sdd-spec <NNN-nombre> <HU-00X>` (o invocando al agente `sdd-spec`)

## Reglas Obligatorias

1. **Lectura Global de Historias (Contexto Panorámico):**
   - Lee **TODOS** los archivos de `docs/historias/` (`HU-001.md` hasta la última disponible).
   - Lee `docs/constitution.md` y `MEMORY.md`.
   - Entiende qué historia se está abordando hoy y qué historias vendrán después.

2. **Blindaje de Fronteras y Fuera de Alcance:**
   - Si una necesidad o comportamiento visible pertenece a una historia posterior (ej. configuración, notificaciones, rachas, rankings), **ESTÁ TERMINANTEMENTE PROHIBIDO** asumirlo o resolverlo anticipadamente.
   - Todo lo que corresponda a historias futuras debe declararse explícitamente en la sección `## Fuera de alcance` citando la historia exacta (ej. *"La personalización de duraciones queda fuera de esta spec. Origen: pertenece a HU-005"*).

3. **Formato EARS Estricto:**
   - Todo Requisito Funcional (RF) debe redactarse en español usando sintaxis EARS:
     - `CUANDO <evento>, EL SISTEMA <respuesta>.`
     - `SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>.`
     - `MIENTRAS <estado>, EL SISTEMA <respuesta>.`
     - `EL SISTEMA <comportamiento permanente>.`
   - Cada RF debe terminar obligatoriamente con `"Origen:"` citando el escenario de la HU o la decisión de `decisiones.md`.

4. **Prohibición de Código y Stack:**
   - La spec describe únicamente el **QUÉ** y el **POR QUÉ**. Prohibido mencionar React, hooks, SQLite, nombres de librerías, archivos o bases de datos.

5. **Dudas Abiertas:**
   - Si algo no está resuelto ni en las historias ni en `decisiones.md`, márcalo como `[NECESITA ACLARACIÓN]` y no lo inventes.

---

## Plantilla Oficial de `spec.md`

```markdown
# Spec NNN - <Nombre de la Característica>

Estado: borrador
HU de origen: docs/historias/HU-00X.md

## Contexto y objetivo

## Usuarios

## Historias de usuario

## Definiciones (solo si hay términos ambiguos)

## Requisitos funcionales (EARS)
- RF-1: CUANDO <evento>, EL SISTEMA <respuesta>. Origen: HU-00X, escenario 1.
- RF-2: SI <condición no deseada>, ENTONCES EL SISTEMA <respuesta>. Origen: Decisión D1.
- RF-3: MIENTRAS <estado>, EL SISTEMA <respuesta>. Origen: HU-00X, escenario 2.
- RF-4: EL SISTEMA <comportamiento continuo>. Origen: Decisión D2.

## Requisitos no funcionales
- RNF-1: <Criterio de rendimiento, accesibilidad o plataforma>.

## Casos límite

## Fuera de alcance
- <Funcionalidad futura>. Origen: pertenece a HU-00Y.

## Criterios de finalización

## Dudas abiertas
- [NECESITA ACLARACIÓN] <Duda no resuelta> (o "Ninguna pendiente")
```

---

## Plantilla Oficial de `decisiones.md`

```markdown
# Registro de Decisiones – Spec NNN

## D1: [Título de la decisión]
- **Contexto:** [Por qué surge la duda o necesidad].
- **Decisión acordada:** [Qué se decidió en el grill-me].
- **Alternativas descartadas:** [Qué opciones se evaluaron y por qué se descartaron].
- **Impacto:** [A qué requisitos de la spec afecta].
```
