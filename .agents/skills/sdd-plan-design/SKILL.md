---
name: sdd-plan-design
description: Diseña la interfaz visual con Atomic Design, generando un mockup de proporciones en SVG y la extensión formal de estilos en design.md tras la aprobación del usuario.
---

# SDD - Plan de Diseño Visual (`/sdd-plan-design`)

## Uso
`/sdd-plan-design <NNN-nombre>`

## Propósito
Separar la lógica y la obra blanca del diseño visual final para evitar rediseños destructivos o código espagueti. Se ejecuta una vez que la interfaz funcional ha sido probada y verificada en pantalla real por el usuario. Permite visualizar y aprobar el resultado estético mediante un mockup SVG antes de escribir código de estilos.

## Entradas y Referencias
- `specs/*/design.md`: **Visión global de navegación**. Lectura de todas las obras blancas existentes en el repositorio para determinar si la interfaz requiere tabs, stack, drawers o desplegables y evitar colisiones entre pantallas.
- `specs/<id-spec>/design.md`: **Base de obra blanca activa**. Pantallas, secciones, componentes y datos funcionales ya documentados de lo general a lo atómico por `sdd-implement`.
- `specs/<id-spec>/spec.md` y `specs/<id-spec>/plan.md`.
- Capa de tokens del proyecto (ej. `src/ui/theme/tokens.ts` o equivalente) y directivas de accesibilidad.

## Protocolo de Diseño en Dos Fases

### Fase 1: Maqueta Visual de Proporciones en Chat (Mockup SVG)
1. **Generación del Mockup SVG:**
   - Genera un bloque SVG interactivo o diagrama de distribución espacial a escala que represente la pantalla o vista (ej. 390×844 pt o dimensiones target).
   - Debe reflejar con precisión:
     - Áreas seguras (superior e inferior) y contenedores responsivos.
     - Distribución espacial (`flexbox`, gaps, alineaciones, márgenes).
     - Proporciones relativas de botones, tarjetas, inputs y textos.
     - Tokens de color propuestos (fondos, superficies, acentos y textos).
     - Objetivos táctiles mínimos de accesibilidad (ej. 48×48 pt) y contrastes WCAG AA.
2. **Diálogo y Aprobación:**
   - Presenta la propuesta gráfica en el chat al usuario.
   - Ajusta detalles según su retroalimentación y **espera su confirmación explícita** antes de aplicar estilos en código.

### Fase 2: Aplicación de Estilos y Extensión de `design.md`
1. **Implementación Limpia:**
   - Aplica los estilos en los componentes de UI sin alterar los controladores ni la funcionalidad de obra blanca.
   - Utiliza exclusivamente la capa de tokens del proyecto (cero colores hexadecimales o estilos sueltos).
2. **Extensión Contractual (sin reescribir la obra blanca):**
   - Conserva intacta la estructura original de obra blanca (Vistas $\rightarrow$ Organismos $\rightarrow$ Moléculas $\rightarrow$ Átomos).
   - Agrega al final de `specs/<id-spec>/design.md` la sección:
     ```markdown
     ## Estilo y Diseño Aplicado
     - **Paleta y Tokens Asignados:** Qué tokens se usaron para fondos, superficies, botones y contrastes.
     - **Tipografía y Jerarquía:** Familias, tamaños, pesos y cifras tabulares asignadas.
     - **Márgenes, Radios y Bordes:** Espaciados y curvaturas aplicadas.
     - **Estados Interactivos:** Feedback visual de reposo, presionado y deshabilitado.
     - **Decisiones Estéticas Clave:** Justificación técnica de la propuesta aplicada.
     ```
