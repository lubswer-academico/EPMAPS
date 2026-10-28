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
