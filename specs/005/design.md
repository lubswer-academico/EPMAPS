# Contrato de Diseño – Spec 005
## Verificación diferida y sincronización automática sin duplicados

Documento de transferencia técnica hacia el agente de diseño (`sdd-design`). Detalla la jerarquía visual de la obra blanca implementada y operativa, estructurada estrictamente de lo general a lo atómico.

---

### 1. Vistas y Pantallas (Nivel General)

| Pantalla | Archivo Fuente | Propósito Funcional |
| :--- | :--- | :--- |
| **Bandeja de Lecturas** | `src/app/reading-queue.tsx` | Visualización general de capturas del mes, control manual de sincronización hacia MockAPI de oficina, feedback de conexión y alertas de atención requerida. |
| **Detalle de Lectura** | `src/app/reading-detail.tsx` | Consulta exhaustiva de una lectura individual, visualización del estado sincronizado/enviado, banner de inmutabilidad o alerta de anomalía diferida. |
| **Barra de Estado Global** | `src/components/GlobalStatusBar.tsx` | Cabecera persistente en toda la aplicación con semáforo de conectividad ("Con señal" / "Sin señal") y contador reactivo de lecturas pendientes. |

---

### 2. Secciones y Organismos (Estructura y Contenedores)

#### 2.1. Panel de Sincronización Manual (`reading-queue.tsx` > `styles.syncActionContainer`)
- **Contenedor principal:** Bloque superior dispuesto sobre el selector de pestañas.
- **Botón maestro de sincronización:** Botón ancho táctil de acción principal con estado activo/inactivo según conectividad y mutex en vuelo.
- **Sub-panel de avisos informativos y de error:** Mensaje de advertencia cuando no hay conexión a internet y tarjeta de resumen post-sincronización con resultados cuantitativos.

#### 2.2. Tarjeta de Lectura con Anomalía / Requiere Atención (`reading-queue.tsx` > `styles.cardAttention`)
- **Contenedor destacado:** Tarjeta con borde resaltado y fondo diferenciado para medidores en estado `REQUIRES_ATTENTION`.
- **Aviso de atención integrada (`styles.attentionNotice`):** Píldora de alerta superior dentro de la tarjeta indicando al técnico que debe completar la fotografía y la confirmación in-situ.

#### 2.3. Banner de Atención en Detalle (`reading-detail.tsx` > `styles.attentionBanner`)
- **Contenedor de advertencia:** Banner ubicado en la parte superior del detalle que orienta al técnico sobre el motivo del bloqueo de envío y lo incita a presionar "Editar Lectura".

---

### 3. Componentes y Moléculas (Grupos de Campos y Tarjetas)

#### 3.1. Selector de Filtros de Cola (`reading-queue.tsx` > `styles.tabContainer`)
- **Pestañas operativas:** "Todas", "Pendientes" (agrupa `PENDING_VERIFICATION`, `PENDING_SYNC` y `REQUIRES_ATTENTION`), "Enviadas" (`SUBMITTED`).
- **Estado activo:** Resaltado de la pestaña seleccionada.

#### 3.2. Fila de Datos Clave (`reading-queue.tsx` / `reading-detail.tsx` > `styles.dataRow`)
- Par etiqueta-valor: "Condición", "Lectura / Motivo", "Fecha de registro", "Evidencia", "Fecha de envío".

#### 3.3. Píldoras de Estado Operativo (`styles.statusBadge`)
- **Pendiente de verificar (`PENDING_VERIFICATION`):** Fondo púrpura claro `#EDE7F6`, texto púrpura oscuro `#4527A0`.
- **Pendiente de enviar (`PENDING_SYNC`):** Fondo ámbar claro `#FFF8E1`, texto ámbar oscuro `#F57F17`.
- **Requiere atención (`REQUIRES_ATTENTION`):** Fondo naranja suave `#FFF3E0`, texto naranja oscuro `#E65100`.
- **Enviada (`SUBMITTED`):** Fondo verde menta `#E8F5E9`, texto verde oscuro `#2E7D32`.

---

### 4. Elementos Atómicos (Nivel Específico)

#### 4.1. Botones y Disparadores Táctiles
1. **Botón "🔄 Sincronizar Ahora":**
   - **Evento:** `syncNow()` de `useSyncEngine`.
   - **Estado Habilitado:** `isOnline === true` y `isSyncing === false`.
   - **Estado Deshabilitado:** Si `!isOnline` o `isSyncing === true` (fondo atenuado `#B0BEC5`).
   - **Indicador de Carga:** Rueda `ActivityIndicator` con texto "Sincronizando con oficina...".
2. **Tarjeta de Lectura en Bandeja:**
   - **Evento:** Si el estado es `REQUIRES_ATTENTION`, navega directo al asistente en modo edición `/reading-wizard?editingId=...`. En otros estados, abre `/reading-detail?id=...`.
   - **Objetivo táctil mínimo:** 48x48 pt.
3. **Botón "✏️ Editar Lectura":**
   - **Evento:** Navega a `/reading-wizard?editingId=...`.
   - **Condición visible:** Oculto si `reading.status === 'SUBMITTED'`.

#### 4.2. Etiquetas de Texto y Contadores
1. **Contador Global de Pendientes (`GlobalStatusBar`):**
   - Formato exacto: `"0 pendientes"` cuando la cola se ha sincronizado completamente o `"X pendiente(s)"` cuando hay registros por procesar o atender.
   - Reflejo reactivo automático tras sincronización exitosa.
2. **Aviso de Sincronización:**
   - Éxito: `"✓ Sincronización: X enviadas, Y requieren atención."`
   - Error: `"⚠️ [Mensaje de error descriptivo en español]"`
   - Offline: `"Modo sin conexión. La sincronización automática ocurrirá apenas detecte señal."`

---

### 5. Estilo y Diseño Aplicado (Fase 2 - Contrato Visual Definitivo)

- **Paleta y Tokens Asignados (`src/constants/theme.ts`):**
  - **Estado `REQUIRES_ATTENTION` (Verificación diferida con anomalía o discrepancia):**
    - `attention` (`#C2410C`): Texto de insignia (`badgeTextAttention`), título del banner de atención (`attentionBannerTitle`), texto de anomalía confirmada (`anomalyText`) e iconos de alerta (`warning-outline`, `alert-circle`, `speedometer-outline`), cumpliendo contraste **5.18:1 WCAG AA** sobre `#FFEDD5`.
    - `attentionDark` (`#9A3412`): Cuerpo descriptivo de los avisos de atención requerida (`attentionNoticeText` en bandeja y `attentionBannerText` en detalle), logrando contraste **6.88:1 WCAG AA** para lectura en exteriores bajo luz solar.
    - `attentionBg` (`#FFEDD5`) y `attentionBorder` (`#FB923C`): Fondo y borde de la píldora `badgeAttention`, del aviso interno `attentionNotice` y del `attentionBanner`.
    - `attentionSurface` (`#FFFBEB`): Superficie cálida diferenciada para la tarjeta completa `cardAttention` en `reading-queue.tsx`, enmarcada con borde de `2 pt` en `attentionBorder`.
  - **Estados de Sincronización Automática y Conectividad:**
    - **Sincronización en curso (`syncStatusBanner`):** Fondo institucional `bgBlue` (`#E1F2FB`), borde `borderLight` (`#E2E8F0`), `ActivityIndicator` y texto en `primaryDark` (`#153268`).
    - **Sincronización completada (`summaryNotice`):** Fondo `successBg` (`#E8F5E9`), borde `successBorder` (`#A5D6A7`), icono `checkmark-circle` y texto en `success` (`#2E7D32`).
    - **Aviso sin conexión (`offlineNoticeContainer`) y error de sincronización (`errorNotice`):** Fondo `dangerBg` (`#FFEBEE`), borde `dangerBorder` (`#FFCDD2`), iconos `cloud-offline-outline` / `alert-circle` y texto en `danger` (`#C62828`).
    - **Barra de Estado Global (`GlobalStatusBar`):** Conmuta dinámicamente entre `surface` (`#FFFFFF`) con píldora `successBg`/`success` cuando está en línea, y `dangerSoftBg` (`#FEF2F2`) con píldora `dangerBg`/`danger` sin conexión; píldora derecha de pendientes en `bgBlue` con texto `primaryDark`.

- **Tipografía y Jerarquía (`design-taste-frontend` & `EPMAPS_TYPOGRAPHY`):**
  - Jerarquía clara en banners de sincronización y atención: títulos de alerta en 15 pt (`md`) con peso `800` (`extrabold`) y descripciones operativas en 13 pt (`sm`) o 11 pt (`xs`) con peso `600`–`700` y altura de línea de 17–19 pt para legibilidad rápida en campo.
  - Cifras tabulares (`fontVariant: ['tabular-nums']`) aplicadas en el contador reactivo de pendientes de `GlobalStatusBar` (`pendingText`), en el resumen cuantitativo de lecturas sincronizadas (`summaryNoticeText`), en fechas de envío (`formattedSyncedAt`) y en valores de lectura/consumo.
  - Iconografía 100% vectorial con `@expo/vector-icons` (`Ionicons`) en sustitución de cualquier símbolo o emoji textual: `cloud-offline-outline`, `cloud-upload-outline`, `shield-half-outline`, `warning-outline`, `alert-circle`, `checkmark-circle` y `trash-outline`.

- **Márgenes, Radios y Espaciado (`emil-design-eng`):**
  - Altura mínima táctil garantizada: `48 pt` (`EPMAPS_TOUCH.minHeight`) en `GlobalStatusBar`, pestañas de filtro y botón `"Descartar lectura"` dentro de tarjetas `REQUIRES_ATTENTION`; `52 pt` (`EPMAPS_TOUCH.buttonHeight`) en botones de acción de `reading-detail.tsx`.
  - Radios de curvatura (`EPMAPS_RADII`): `12 pt` (`lg`) en tarjetas de lectura y banners de detalle (`attentionBanner`, `immutableBanner`); `8 pt` (`md`) en banners de estado de sincronización (`syncStatusBanner`, `offlineNoticeContainer`, `errorNotice`, `summaryNotice`); `6 pt` (`sm`) en insignias de estado operativo y aviso interno `attentionNotice`.

- **Estados Interactivos:**
  - **Tarjetas `REQUIRES_ATTENTION` en Bandeja:** Destacan visualmente mediante borde de `2 pt` (`attentionBorder`), fondo `attentionSurface`, icono de medidor en color `attention` y acceso directo al asistente de subsanación (`/reading-wizard?editingId=...`) con feedback táctil `activeOpacity={0.85}`, además de ofrecer acción explícita de descarte (`cardDiscardButton`) separada por línea divisoria cálida.
  - **Feedback Reactivo de Sincronización:** Aparición no intrusiva de banners informativos bajo el encabezado de la bandeja al sincronizar en segundo plano, al perder señal o al completar envíos hacia la oficina central.

- **Decisiones Estéticas Clave:**
  - **Contraste Solar para Alertas Diferidas:** Se definieron los tokens `attention` (`#C2410C`) y `attentionDark` (`#9A3412`) sobre `attentionBg` (`#FFEDD5`) y `attentionSurface` (`#FFFBEB`), diferenciando claramente el estado crítico recuperable (`REQUIRES_ATTENTION`) tanto del estado de espera (`PENDING_SYNC` en ámbar) como del error bloqueante (`danger` en rojo).
  - **Iconografía Semántica en Píldoras de Estado:** Cada uno de los 4 estados del ciclo de vida (`PENDING_VERIFICATION`, `PENDING_SYNC`, `REQUIRES_ATTENTION`, `SUBMITTED`) incorpora un icono vectorial propio junto a su etiqueta en mayúsculas/negrita para garantizar accesibilidad incluso bajo condiciones lumínicas adversas o daltonismo.

