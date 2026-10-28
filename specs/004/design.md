# Contrato de Diseño – Spec 004
Bandeja de lecturas offline, registro sin señal y corrección de lecturas no enviadas

Este documento define la estructura y elementos funcionales de las vistas en **obra blanca** implementadas en la Spec 004, sirviendo de insumo y contrato técnico para el agente de diseño (`sdd-design`).

---

## 1. Vistas y Pantallas (Nivel General)

### 1.1 Pantalla de Bandeja de Lecturas
- **Ruta de archivo:** `src/app/reading-queue.tsx`
- **Propósito funcional:** Permitir al técnico de campo consultar de manera centralizada la totalidad de lecturas capturadas durante el mes en el dispositivo, filtrar por su estado operativo (`Todas`, `Pendientes`, `Enviadas`), verificar si tienen foto adjunta e ingresar al detalle o edición de cada registro.
- **Acceso:** Desde el botón "📋 Bandeja de Lecturas" en `src/app/home.tsx` y desde el botón "Ver / Editar en Bandeja de Lecturas" ante detección de lecturas locales existentes en `src/app/meter-search.tsx`.

### 1.2 Pantalla de Detalle de Lectura
- **Ruta de archivo:** `src/app/reading-detail.tsx`
- **Propósito funcional:** Presentar la ficha completa y fidedigna de una lectura capturada, exhibiendo todos los campos registrados (condición, lecturas, consumo, anomalías, fechas y foto adjunta). Si la lectura está en estado `SUBMITTED` ("Enviada"), impone modo solo lectura con aviso de inmutabilidad y bloquea la edición; si está pendiente, provee acceso a la edición.
- **Acceso:** Al presionar cualquier tarjeta de lectura en `src/app/reading-queue.tsx`.

### 1.3 Pantalla de Captura y Edición (Wizard Adaptado)
- **Ruta de archivo:** `src/app/reading-wizard.tsx`
- **Propósito funcional:** Asistir en la captura paso a paso (Condición -> Lectura/Consumo -> Fotografía/Resumen) tanto para nuevos registros como para correcciones en caliente de lecturas pendientes precargadas vía parámetro `editingId`.

---

## 2. Secciones y Organismos

### 2.1 Barra Superior Global (`GlobalStatusBar`)
- **Cabecera persistente:** Muestra el logo de EPMAPS, el indicador de conectividad de red ("Con señal" / "Sin señal") y el contador reactivo de lecturas pendientes de la cola local (`${count} pendientes`).

### 2.2 Cabecera de Pantalla
- Botón de navegación contextual "← Regresar" con objetivo táctil >= 48x48 pt.
- Título jerárquico de pantalla (ej. "Bandeja de Lecturas", "Detalle de Lectura", "Editar Lectura").
- Subtítulo descriptivo o indicador del código del medidor consultado (`MED-XXXXXX`).

### 2.3 Contenedor de Filtros por Pestañas (En `reading-queue.tsx`)
- Selector segmentado horizontal compuesto por tres pestañas de estado: `Todas`, `Pendientes` y `Enviadas`.
- La pestaña activa resalta visualmente y filtra de manera síncrona el listado en memoria.

### 2.4 Listado de Tarjetas (`FlatList` en `reading-queue.tsx`)
- Tarjetas verticales independientes por lectura capturada, ordenadas descendentemente por fecha de captura.
- Estado vacío con ícono y mensaje explicativo cuando no hay lecturas para el filtro activo.

### 2.5 Panel de Alerta e Inmutabilidad (En `reading-detail.tsx`)
- Banner destacado en color verde/neutro cuando `status === 'SUBMITTED'`, informando que la lectura ya fue enviada a la oficina y no puede ser alterada ni eliminada.

### 2.6 Ficha de Datos del Registro (En `reading-detail.tsx`)
- Bloque contenedor con divisor de secciones y filas clave-valor con alineación derecha.

### 2.7 Visor de Fotografía Adjunta (En `reading-detail.tsx`)
- Contenedor rectangular para la imagen almacenada localmente con relación de aspecto adaptada y manejo de estado alternativo si no se capturó fotografía.

---

## 3. Componentes y Moléculas

### 3.1 Tarjeta de Lectura (`ReadingItemCard`)
- **Cabecera interna:**
  - Código oficial del medidor (`MED-XXXXXX`) en tipografía destacada.
  - Insignia de estado operativo (`StatusBadge`).
- **Cuerpo de datos:**
  - `Condición`: 'Normal', 'Inaccesible' o 'Dañado'.
  - `Lectura / Motivo`: Valor en `m³` o motivo de inaccesibilidad.
  - `Fecha de registro`: Formateada en fecha y hora local `es-EC`.
  - `Evidencia`: Indicador de fotografía adjunta ("📷 Con fotografía" o "Sin foto").
- **Interacción:** `TouchableOpacity` con respuesta táctil completa que redirige a `reading-detail.tsx?id=${item.id}`.

### 3.2 Insignia de Estado Operativo (`StatusBadge`)
- **Pendiente de verificar (`PENDING_VERIFICATION`):** Fondo púrpura claro, texto `#4527A0`. Asignado a capturas sin señal y sin datos previos de oficina.
- **Pendiente de enviar (`PENDING_SYNC`):** Fondo amarillo/ámbar claro, texto `#F57F17`. Asignado a capturas validadas en el terminal listas para sincronizar.
- **Enviada (`SUBMITTED`):** Fondo verde claro, texto `#2E7D32`. Asignado a registros transmitidos e inmutables.

### 3.3 Barra de Acciones Inferiores (En `reading-detail.tsx`)
- Botón "✏️ Editar Lectura" visible y habilitado exclusivamente cuando `isReadingEditable(reading)` es `true` (`status !== 'SUBMITTED'`).

---

## 4. Elementos Atómicos (Nivel Específico)

### 4.1 Botones y Accionadores
1. **Botón Regresar (`backButton`):**
   - Dispara `router.back()`.
   - Dimensiones: Área táctil mínima de 48x48 pt.
   - Estado: Siempre activo.
2. **Pestañas de Filtro (`tabButton`):**
   - Disparan `setFilter('all' | 'pending' | 'submitted')`.
   - Estado activo: Fondo contrastante `#005C8A`, texto blanco negrita.
   - Estado inactivo: Fondo neutro `#EAEAEA`, texto `#444444`.
3. **Botón de Edición (`editButton`):**
   - Etiqueta: "✏️ Editar Lectura".
   - Dispara redirección a `/reading-wizard?meterCode=...&editingId=...`.
   - Estado: Visible únicamente en lecturas pendientes; ausente en lecturas enviadas.
4. **Botón Bandeja de Lecturas (En `home.tsx`):**
   - Etiqueta: "📋 Bandeja de Lecturas".
   - Dispara redirección a `/reading-queue`.
   - Dimensiones: Altura mínima 48 pt, fondo `#0288D1`, texto blanco.

### 4.2 Etiquetas de Texto y Formatos de Datos
- **Contador en barra superior (`GlobalStatusBar`):** `${pendingCount} pendientes` (ej. `0 pendientes`, `3 pendientes`).
- **Código de medidor:** Formato estricto `MED-XXXXXX`.
- **Lectura numérica:** Entero o decimal formateado con sufijo `m³` (ej. `145 m³`).
- **Consumo calculado:** Formateado con sufijo `m³` o etiqueta explicativa `Pendiente de verificar (modo contingencia sin datos previos)`.
- **Fechas y horas:** Formato localizado `es-EC` (DD/MM/AAAA, HH:MM).

---

## 5. Estilo y Diseño Aplicado (Fase 2 - Contrato Visual Definitivo)

- **Paleta y Tokens Asignados (`src/constants/theme.ts`):**
  - `--epmaps-primary-dark` (`#153268`): Títulos principales ("Bandeja de Lecturas", "Detalle de Lectura"), títulos de secciones ("Información del Registro", "Fotografía Adjunta"), pestaña de filtro activa (`tabButtonActive`), códigos de medidor (`meterCode`), botón de retorno (`backButtonText`) y valores numéricos tabulares (`tabularValue`).
  - `--epmaps-primary` (`#2D72C0`): Botón principal de acción `"Editar Lectura"` (`editButton`) en `reading-detail.tsx` e indicadores de carga (`ActivityIndicator`).
  - `--epmaps-accent-dark` (`#3B766C`): Píldoras superiores de conteo y medidor (`countPill`, `meterPill`), etiquetas de categoría de tarjeta (`FICHA DE REGISTRO • AUDITORÍA`, `EVIDENCIA VISUAL • RESPALDO`) e indicador de evidencia fotográfica confirmada (`evidenceHighlightText` con ratio 5.26:1 WCAG AA sobre blanco).
  - `--epmaps-surface` (`#FFFFFF`): Tarjetas de lectura en bandeja (`card`), bloques de detalle (`reading-detail.tsx`) y pestañas de filtro en estado inactivo (`tabButton`).
  - `--epmaps-bg-light` (`#F8FAFC`): Fondo general de pantalla (`safeArea`) y contenedor informativo sin fotografía (`noPhotoBox`).
  - `--epmaps-bg-blue` (`#E1F2FB`): Cápsula del botón de retroceso (`backButtonBadge`), píldora de conteo de registros (`countPill`), píldora del código de medidor (`meterPill`) y círculo central del estado vacío (`emptyIconCircle`).
  - Tokens de Estados Operativos de Cola (WCAG 2.1 AA $\ge 4.5:1$ bajo luz solar directa):
    - **Pendiente de verificar (`PENDING_VERIFICATION`):** Fondo `verificationBg` (`#EDE7F6`), borde `verificationBorder` (`#D1C4E9`), texto e icono `shield-half-outline` en `verification` (`#4527A0`, contraste 8.62:1).
    - **Pendiente de enviar (`PENDING_SYNC`):** Fondo `pendingSyncBg` (`#FEF3C7`), borde `pendingSyncBorder` (`#FCD34D`), texto e icono `cloud-upload-outline` en `pendingSync` (`#B45309`, contraste 5.02:1).
    - **Enviada / Inmutable (`SUBMITTED`):** Fondo `successBg` (`#E8F5E9`), borde `successBorder` (`#A5D6A7`), título e icono `checkmark-circle` / `shield-checkmark` en `success` (`#2E7D32`) y cuerpo explicativo en `successDark` (`#1B5E20`, contraste 7.35:1).
    - **Acciones destructivas ("Descartar lectura"):** Fondo `dangerSoftBg` (`#FEF2F2`), borde `dangerSoftBorder` (`#FCA5A5`), texto e icono `trash-outline` en `danger` (`#C62828`).

- **Tipografía y Jerarquía (`design-taste-frontend` & `EPMAPS_TYPOGRAPHY`):**
  - Títulos de pantalla en 22 pt (`EPMAPS_TYPOGRAPHY.sizes.xl`), peso `800` (`extrabold`) y tracking `-0.3 pt`.
  - Etiquetas de categoría de sección (`FICHA DE REGISTRO • AUDITORÍA`, `EVIDENCIA VISUAL • RESPALDO`) en 11 pt (`xs`), mayúsculas, peso `800` y `letterSpacing: 0.6 pt`.
  - Código de medidor en tarjeta de bandeja en 18 pt (`lg`), peso `800` y `fontVariant: ['tabular-nums']`.
  - Cifras tabulares (`tabular-nums`) aplicadas rigurosamente en: contador global de pendientes (`GlobalStatusBar`), píldora de total de registros (`countPillText`), códigos `MED-XXXXXX`, lecturas en `m³`, consumos calculados y marcas de tiempo (`capturedAt`, `updatedAt`, `syncedAt`).
  - Reemplazo absoluto de emojis por iconografía vectorial de `@expo/vector-icons` (`Ionicons`): `layers-outline`, `time-outline`, `cloud-done-outline`, `speedometer-outline`, `camera`, `camera-outline`, `shield-checkmark`, `create-outline`, `trash-outline` y `file-tray-outline`.

- **Márgenes, Radios y Espaciado (`emil-design-eng`):**
  - Objetivos táctiles exteriores: mínimo 48 pt (`EPMAPS_TOUCH.minHeight`) en botón de regreso (`backButton`), pestañas de filtro (`tabButton`) y botón de descarte en tarjeta; 52 pt (`EPMAPS_TOUCH.buttonHeight`) en los botones de acción del detalle (`editButton` y `deleteButton`).
  - Ritmo vertical y espaciado gobernado por `EPMAPS_SPACING`: padding horizontal de 16 pt (`lg`), separación entre tarjetas de 12 pt (`md`), relleno interno de tarjetas de 16 pt (`lg`) y margen inferior de seguridad de 32–40 pt (`hero`).
  - Radios de curvatura consistentes con `EPMAPS_RADII`: 12 pt (`lg`) en tarjetas principales y banners de estado; 8 pt (`md`) en pestañas de filtro, contenedor de fotografía y botones de acción; 6 pt (`sm`) en insignias de estado operativo y cápsula de retorno; `full` (`9999`) en píldoras de cabecera y círculo de estado vacío.

- **Estados Interactivos:**
  - **Reposo:** Tarjetas blancas sobre fondo `bgLight` (`#F8FAFC`) delimitadas por bordes `borderLight` (`#E2E8F0`) sin sombras pesadas ni hexadecimales sueltos.
  - **Pulsación:** Respuesta táctil con `activeOpacity={0.85}` en tarjetas de bandeja, pestañas de filtro y botones de edición/descarte.
  - **Filtro seleccionado:** Conmutación inmediata a fondo `primaryDark` (`#153268`) con icono y etiqueta en `textInverse` (`#FFFFFF`).
  - **Inmutabilidad (`SUBMITTED`):** Ocultación total de controles de edición/descarte y despliegue del banner `immutableBanner` con icono `shield-checkmark`.

- **Decisiones Estéticas Clave:**
  - **Coherencia con el Asistente de Captura (Spec 003):** Se unificó la cabecera (`backButtonBadge` + título + píldora derecha en `bgBlue`) y las etiquetas superiores de categoría en las tarjetas de detalle para que la transición entre captura, bandeja y auditoría se sienta parte de un único sistema institucional.
  - **Diferenciación Semántica de Evidencia Fotográfica:** En la bandeja de lecturas, los registros con fotografía destacan mediante el icono `camera` y texto en `accentDark` (`#3B766C`), mientras que los registros sin foto se atenúan en `textMuted` con `camera-outline` para facilitar el escaneo visual rápido en terreno.

