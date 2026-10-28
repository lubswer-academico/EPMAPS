# ADR-003: Usar jest-expo como arnés de pruebas automatizadas con soporte TypeScript

## Estado
Aceptado

## Fecha
2026-10-27

## Requisitos relacionados
RF-1 a RF-7; RNF-1 a RNF-4 (Constitución P4, AGENTS.md).

## Contexto
El desarrollo de la aplicación EPMAPS exige disciplina estricta de Desarrollo Guiado por Pruebas (TDD) en la lógica de dominio puro (`src/domain/`), persistencia desacoplada (`src/storage/`) y controladores de estado (`src/presentation/`). Se requiere un arnés de ejecución de pruebas automatizadas compatible con TypeScript y con el ecosistema de componentes y módulos de Expo/React Native, ejecutable desde la línea de comandos mediante `npx jest` con retroalimentación inmediata en el ciclo rojo-verde-refactorización.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **`jest-expo` + `jest` + `@types/jest`** | • Preset oficial preconfigurado por el equipo de Expo para React Native y TypeScript.<br>• Resuelve automáticamente los mocks y transformaciones de los módulos del SDK de Expo.<br>• Compatible de forma directa con el comando estipulado en `AGENTS.md` (`npx jest`).<br>• Fácil soporte para mocking de temporizadores y módulos asíncronos nativos. | • Añade múltiples paquetes a `devDependencies` en `package.json`. |
| **`jest` con `ts-jest` puro manual** | • Entorno ligero enfocado exclusivamente en pruebas de TypeScript puro. | • Falla al probar código que interactúe con el entorno React Native o módulos nativos de Expo (requiere mantenimiento manual de transformadores de Babel y mapeo de módulos). |
| **`Vitest`** | • Altísima velocidad y soporte ESM nativo en entornos modernos de Node/Web. | • Sin soporte oficial maduro dentro del ecosistema móvil de Expo/React Native; genera fricciones constantes al resolver dependencias móviles. |

## Decisión
Se decide adoptar **`jest-expo`**, **`jest`** y **`@types/jest`** como dependencias de desarrollo (`devDependencies`), configurando el script `"test": "jest"` en `package.json` y el archivo de configuración correspondiente de Jest con el preset oficial de Expo.

## Consecuencias
- **Lo que gana el proyecto:** Compatibilidad completa para ejecutar pruebas TDD unitarias y de integración en TypeScript sin lidiar con errores de configuración de transformación nativa de React Native.
- **Lo que pierde o arriesga (desventaja obligatoria):** Mayor tamaño del directorio `node_modules` local al incluir el arnés de Jest y sus dependencias de testing.
- **Obligaciones creadas en el código:** Configurar el script `"test": "jest"` en `package.json` y declarar `preset: "jest-expo"` para garantizar que `npx jest` funcione de manera homogénea en local y en entornos de CI.

## Verificación
- En `package.json` deben constar `jest-expo`, `jest` y `@types/jest` en `devDependencies`, y el script `"test": "jest"`.
- Al ejecutar `npx jest`, el ejecutor debe iniciar y evaluar las suites de pruebas en TypeScript.

## Uso de IA
No tuve encuenta esta dependencia, fue algo que se me pasó por alto y que gracias al flujo que arme de SDD de pudo encontrar y aclarar, con ayuda de la IA estuve definiendo lo que me podira servir en este caso, en parte ya tenia  un comando especifico de la dependencia par alas pruebas en SDD entonces elegir jest-expo fue necesario para esa parte, sin embargo las otras alternativas tambien me interesaron como jest con ts-jest que es más ligero y no añade multiples paquetes, sin embargo en cierto punto para exportaciones se convierte en algo manual y por el tiempo de desarrollo que tengo no es algo que pueda considerar en este momento.
