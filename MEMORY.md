# MEMORY.md – EPMAPS
Memoria del proyecto entre sesiones. Máximo ~50 líneas.

## Estado actual
- Fase: Diseño visual institucional completado al 100% en todas las specs (`001` a `005`) y formalizado en sus respectivos `specs/*/design.md`.
- UI Aplicada: Todas las pantallas (`login`, `home`, `meter-search`, `reading-wizard`, `reading-queue`, `reading-detail`) y `GlobalStatusBar` adaptadas a `EPMAPS_COLORS`, `EPMAPS_RADII`, `EPMAPS_SPACING`, `EPMAPS_TOUCH`, `EPMAPS_TYPOGRAPHY` e `Ionicons`, con contraste WCAG AA bajo luz solar directa y objetivos táctiles ≥ 48 pt.
- Iconografía: Integrada librería oficial `@expo/vector-icons` (`Ionicons`), eliminando todos los emojis en todas las vistas de la app.
- Calidad: 15 suites / 151 tests pasando 100% en verde con Jest (`npx jest`) y 0 errores en TypeScript (`npx tsc --noEmit`).

## Decisiones (y por qué)
- Refactorización de estilos limpios global (Specs 001 a 005): Reemplazados todos los colores hexadecimales hardcodeados por tokens de `src/constants/theme.ts` (incluyendo tokens de estado operativo `PENDING_VERIFICATION`, `PENDING_SYNC`, `REQUIRES_ATTENTION`, `SUBMITTED` y `EPMAPS_TYPOGRAPHY.tabularNums`).
- Bandeja y Detalle de Lectura accesibles en campo: Insignias e iconos semánticos con contraste ≥ 4.5:1, banners diferenciados de inmutabilidad (`SUBMITTED`) y atención requerida (`REQUIRES_ATTENTION`), y cifras tabulares en lecturas, consumos y fechas.
- Ver detalles en `specs/002/design.md`, `specs/003/design.md`, `specs/004/design.md` y `specs/005/design.md`.

## Aprendizajes y errores a evitar
- Los iconos vectoriales en botones con texto deben acompañarse de `flexDirection: 'row'`, `alignItems: 'center'` y espaciado consistente (`gap: 6` o márgenes laterales de 6-8 pt) para conservar el centrado vertical estricto de 48-52 pt.
- Al exponer contadores en tarjetas de inicio, vincularlos con interacción táctil hacia la bandeja correspondiente agiliza el flujo de trabajo del operador.

## Próximos pasos
- El usuario puede verificar el flujo completo de la aplicación en vivo ejecutando `npx expo start`.
- Todas las historias de usuario (HU-001 a HU-005) cuentan con implementación funcional, pruebas en verde y diseño visual institucional cerrado.


