---
name: sdd-implement
description: Implementa tareas bajo TDD estricto, levanta la interfaz funcional en obra blanca para validación en pantalla real, y genera specs/NNN/design.md estructurado de lo general a lo atómico.
---

# SDD - Implementación y Obra Blanca (`/sdd-implement`)

## Uso
- `/sdd-implement <NNN-nombre> <T#>` (para ejecutar una tarea específica)
- Invocando al subagente `sdd-implement`

---

## Flujo Estricto de Ejecución

### 1. Lectura y Dependencias (ADR)
- Lee la tarea en `specs/<id-spec>/tasks.md` y su detalle en `plan.md`.
- Si la tarea indica `Requiere: ADR-REQ-XX`, revisa el ADR aceptado en `docs/adr/`.
- **Regla innegociable:** Si se requiere instalar un paquete externo, **PIDE AUTORIZACIÓN EXPRESA** al usuario antes de ejecutar el comando de instalación.

### 2. Lógica y Persistencia (TDD Estricto)
- Escribe primero las pruebas unitarias en `__tests__/` $\rightarrow$ verifica que fallen en rojo.
- Escribe el código mínimo necesario en dominio o persistencia hasta que las pruebas pasen en verde.
- Ejecuta `npx jest [ruta]` y comprueba tipos (`npx tsc --noEmit`).

### 3. Interfaz en "Obra Blanca" (Funcional Mínima)
- Si la tarea involucra pantallas o componentes visuales:
  - Construye la interfaz necesaria de forma puramente funcional (**obra blanca**).
  - Deja los botones conectados, los campos recibiendo datos y las navegaciones operativas.
  - **No pierdas tiempo en estilos decorativos finales ni paletas complejas.** El objetivo es que el usuario pueda probar el flujo en vivo en su pantalla o emulador.
- Entrega la lista de verificación manual para que el usuario confirme que la interacción funciona y marca la tarea como `[x]`.

### 4. Generación del Contrato de Diseño (`specs/<id-spec>/design.md`)
Al concluir las tareas funcionales de la spec, genera el archivo `specs/<id-spec>/design.md` documentando la base visual construida para que el diseñador trabaje sobre seguro:

```markdown
# Requerimientos de Diseño – Spec NNN

Base visual implementada en obra blanca para guiar la maquetación y diseño final.

## 1. Vistas y Pantallas (General)
- **Pantalla [Nombre]:** Ruta del archivo y propósito del flujo.

## 2. Secciones y Organismos
- **Cabecera / Barra Superior:** Controles presentes y comportamiento.
- **Área Central:** Contenedor y flujo de datos principales.
- **Panel Inferior:** Acciones y botones principales.

## 3. Componentes y Moléculas
- **[Grupo de datos/formulario]:** Campos que agrupa, etiquetas y validaciones visibles.

## 4. Elementos Atómicos (Específico)
- **Botón [Nombre]:** Acción que dispara, texto visible y estado habilitado/deshabilitado.
- **Textos e Indicadores:** Dato exacto que refleja (valores, contadores, estados) y formato.
```
