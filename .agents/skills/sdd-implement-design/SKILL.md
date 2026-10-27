---
name: sdd-implement-design
description: Implementa los componentes visuales de interfaz a partir del plan de diseño aprobado (design.md) y los verifica en pantalla real.
---

# SDD - Implementación de Diseño (`/sdd-implement-design`)

## Uso
`/sdd-implement-design <NNN-nombre>`

## Entradas Requeridas
- `specs/<id-spec>/design.md` (debe contar con aprobación explícita del usuario).
- Tokens de diseño en `src/ui/theme/tokens.ts` (o capa de tokens de diseño del proyecto).
- Contrato de lógica ya probado (hooks, controladores o store de estado del proyecto).

## Flujo de Construcción Atómica

1. **Tokens y Estilos Base:**
   - Asegura que todos los colores, espaciados y tamaños tipográficos provengan de la capa de tokens del proyecto. Prohibido usar cadenas hexadecimales o valores mágicos sueltos en los componentes.

2. **Componentes Atómicos y Moleculares (`src/ui/components/` o directorio de componentes):**
   - Construye o actualiza cada componente individual respetando las dimensiones y proporciones del mockup SVG aprobado.
   - Aplica estilos desacoplados y limpios sin librerías de estilos innecesarias.
   - Garantiza objetivos táctiles mínimos (ej. 48×48 pt) y accesibilidad con retroalimentación interactiva (estados activo, presionado, deshabilitado).

3. **Ensamblaje de Pantallas/Vistas (`src/app/` o directorio de vistas):**
   - Integra los componentes en las vistas correspondientes del proyecto.
   - Envuelve en contenedores que respeten las áreas seguras y la responsividad de pantalla.
   - En vistas con formularios, asegura que los campos no queden ocultos por teclados o modales.

4. **Verificación Estática:**
   - Ejecuta chequeo de tipos (`npx tsc --noEmit`).
   - Ejecuta linter (`npx expo lint`, `npm run lint` o equivalente del proyecto).
   - Ejecuta las pruebas automatizadas (`npx jest`) para asegurar que ningún test previo de dominio o persistencia se rompió.

5. **Lista de Verificación Manual:**
   - Entrega al usuario la lista numerada de puntos a comprobar en pantalla real (en Expo Go, emulador o navegador según la plataforma).
   - Espera la confirmación del usuario antes de dar por cerrada la fase de interfaz.
