---
name: sdd-tasks
description: Divide el plan técnico en tareas atómicas y secuenciales de lógica y persistencia (máximo 10 tareas) con criterios verificables.
---

# SDD - Desglose en Tareas (`/sdd-tasks`)

## Uso
`/sdd-tasks <NNN-nombre>`

## Entradas Requeridas
- `specs/<id-spec>/spec.md` (Estado: aprobada).
- `specs/<id-spec>/plan.md` (incluyendo la sección `# Decisiones ADR`).

## Reglas Obligatorias

1. **Atomicidad:** Cada tarea debe representar un bloque de trabajo acotado (20 a 30 minutos).
2. **Límite Estricto:** Máximo 10 tareas por spec. Si se requieren más, propón dividir la spec en dos fases.
3. **Foco en Lógica y Contratos:** Las tareas se centran en dominio (`src/domain/`), persistencia (`src/storage/`) y hooks/controladores de estado (`src/session/` o similar). El diseño visual detallado se delega al flujo de diseño.
4. **Formato Obligatorio en `specs/<id-spec>/tasks.md`:**
   ```markdown
   - [ ] **Tn. <Descripción clara y acotada>.** RF-x, RF-y, RNF-z
     - Requiere: ADR-REQ-XX de plan.md (si la tarea depende de una librería externa pendiente de definir)
     - Hecho cuando: <condición verificable exacta>.
   ```
5. **Criterios de Verificación:**
   - Tareas de lógica/dominio: `npx jest ruta/del/test.test.ts` terminando en verde.
   - Tareas de persistencia/storage: pruebas unitarias de serialización y contrato contra almacenamiento desacoplado.
   - Tareas de dependencias/configuración: validación de configuración del framework (ej. `npx expo config`, manifest o scripts de entorno) y chequeo de tipos (`npx tsc --noEmit`).
