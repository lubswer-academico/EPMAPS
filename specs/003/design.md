# Contrato de Diseño – Spec 003: Captura Multipantalla de Lectura, Anomalías, Fotografía y Borrador

Este documento define la estructura visual y funcional de la interfaz en **obra blanca** construida para la Spec 003. Sirve de insumo y contrato técnico directo para el subagente de diseño (`sdd-design`).

---

## 1. Vistas y Pantallas (Nivel General)

- **Nombre de Pantalla:** Asistente de Toma de Lectura (Reading Wizard Screen)
- **Ruta de Archivo:** `src/app/reading-wizard.tsx`
- **Propósito Funcional:**
  Guiar al técnico de campo a través de un flujo multipantalla secuencial de 3 pasos para registrar la condición física del medidor, la lectura volumétrica de consumo (con validación de consistencia y anomalías) y la evidencia fotográfica correspondiente, antes de consolidar el registro en la cola local persistente para su posterior envío a la oficina.

---

## 2. Secciones y Organismos

### 2.1. Barra de Estado Global Persistente (`GlobalStatusBar`)
- **Estructura:** Encabezado superior unificado (44 pt altura aprox.) anclado en `SafeAreaView`.
- **Propósito:** Muestra el estado de sesión del técnico, el contador de sincronizaciones pendientes en cola y el indicador de conectividad.

### 2.2. Modal / Banner Superior de Detección de Borrador en Caliente
- **Estructura:** Contenedor condicional de alerta (`draftModalContainer`) con tarjeta de fondo ámbar claro y borde destacado.
- **Propósito:** Informa al técnico que se detectó una captura en curso previamente interrumpida para el medidor actual, permitiéndole reanudar o descartar el borrador.

### 2.3. Encabezado de Navegación del Wizard
- **Estructura:** Botón táctil de retorno rápido a la consulta (`← Regresar`), título principal "Toma de Lectura" y subtítulo con el código oficial del medidor en curso (ej. `Medidor: MED-100201`).

### 2.4. Barra de Progreso e Indicador de Pasos
- **Estructura:** Contenedor horizontal segmentado en 3 etapas conectadas por líneas (`stepConnector`):
  1. `1. Condición`
  2. `2. Lectura`
  3. `3. Foto`
- **Estado:** La etapa activa adquiere fondo contrastado (`stepBadgeActive`).

### 2.5. Bloque de Notificaciones y Alertas de Validación
- **Estructura:** Cuadro de aviso reactivo (`errorBox` en rojo claro o `dangerAlertBox`) que informa de inconsistencias físicas, omisión de campos obligatorios o permisos de cámara denegados.

### 2.6. Contenedor Dinámico del Paso Activo (`stepContent`)
- Tarjeta principal en blanco con borde suave donde se despliegan los controles del paso 1, paso 2 o paso 3 según `currentStep`.

### 2.7. Barra de Acciones Inferior (`footerActions`)
- **Estructura:** Barra fija inferior con botones de navegación (`← Anterior`, `Siguiente →` y `Finalizar y Guardar`).

---

## 3. Componentes y Moléculas

### En Paso 1: Condición del Medidor
- **Selector de Condición (`conditionOptions`):**
  - Tres botones tipo tarjeta horizontal (`Normal`, `Inaccesible`, `Dañado`).
  - El estado seleccionado se resalta con borde de 2px y fondo celeste suave.
- **Campo Motivo de Inaccesibilidad (`inaccessibilityReason`):**
  - Desplegado únicamente si la condición es `Inaccesible`.
  - Área de texto multilínea con etiqueta indicando obligatoriedad (*).
- **Campo Descripción del Daño (`damageDescription`):**
  - Desplegado únicamente si la condición es `Dañado`.
  - Área de texto multilínea con etiqueta indicando obligatoriedad (*).

### En Paso 2: Lectura Numérica y Consumo
- **Ficha de Referencias Previas (`referenceContainer`):**
  - Muestra lectura anterior y promedio de consumo mensual (o "Sin datos previos" en modo contingencia).
- **Entrada Numérica de Gran Tamaño (`numericInput`):**
  - Campo de texto de lectura en m³, centrado visualmente, con tipografía 24pt negrita y teclado `number-pad`. Deshabilitado si el medidor es `Inaccesible`.
- **Caja de Consumo Calculado (`consumptionBox`):**
  - Muestra en tiempo real `actual - anterior` en m³. Se resalta en verde si es consistente o en rojo si hay inconsistencia física (`actual < anterior`).
- **Tarjeta de Consumo Anómalo (`anomalyBox`):**
  - Activada cuando `consumo > 3 * promedio`.
  - Fondo naranja suave con borde contrastado, detalle de la anomalía y casilla interactiva de confirmación física obligatoria.

### En Paso 3: Evidencia Fotográfica y Consolidación
- **Banner de Regla Fotográfica:**
  - Informa si la fotografía es obligatoria (Dañado o Anomalía) u opcional (Normal sin anomalía o Inaccesible).
- **Disparador de Cámara (`cameraTriggerButton`):**
  - Botón de marco punteado con icono de cámara (📷) y texto centrado para invocar la cámara nativa.
- **Tarjeta de Vista Previa Fotográfica (`photoPreviewCard`):**
  - Muestra la imagen capturada en altura completa de 220pt con dos botones inferiores: "Repetir Foto" y "Eliminar Foto".
- **Tarjeta de Resumen de Registro (`summaryCard`):**
  - Ficha con viñetas que desglosa medidor, condición, lectura, consumo calculado y estado de fotografía antes del guardado final.

---

## 4. Elementos Atómicos (Nivel Específico)

### Botones y Disparadores Táctiles (Mínimo 48x48 pt)
1. `backButton`: Dispara `router.back()`.
2. `conditionCard` [Normal | Inaccesible | Dañado]: Cambia la condición física del borrador.
3. `discardButton`: Dispara `discardExistingDraft()`.
4. `resumeButton`: Dispara `resumeExistingDraft()`.
5. `checkboxRow`: Alterna el estado booleano de `draft.anomalyConfirmed`.
6. `cameraTriggerButton` / `retakePhotoButton`: Invoca `capturePhoto()`.
7. `deletePhotoButton`: Invoca `removePhoto()`.
8. `navButtonSecondary` (`← Anterior`): Retrocede de paso.
9. `navButtonPrimary` (`Siguiente →`): Valida el paso actual y avanza.
10. `navButtonFinish` (`Finalizar y Guardar`): Consolida en cola local (`saveConsolidatedReading`), limpia borrador y abre alerta de confirmación con redirección a `/home`.

### Campos de Entrada de Texto
1. `inaccessibilityReason`: `TextInput` multilínea, `autoCapitalize="sentences"`, altura mínima 70pt.
2. `damageDescription`: `TextInput` multilínea, `autoCapitalize="sentences"`, altura mínima 70pt.
3. `currentReading`: `TextInput` de una línea, `keyboardType="number-pad"`, altura mínima 52pt.

### Etiquetas de Texto y Formatos de Salida
- `draft.meterCode`: Código formal con máscara `MED-XXXXXX`.
- `draft.previousReading`: Número entero o decimal seguido de `m³`.
- `draft.averageConsumption`: Número entero o decimal seguido de `m³/mes`.
- `consumptionInfo.consumption`: Diferencia numérica positiva seguida de `m³`.
- `isAnomaly`: Texto de advertencia con cálculo porcentual/múltiplo sobre el promedio histórico.

---

## 5. Estilo y Diseño Aplicado (Fase 2 - Contrato Visual Definitivo)

- **Paleta y Tokens Asignados (`src/constants/theme.ts`):**
  - `--epmaps-primary-dark` (`#153268`): Título principal ("Toma de Lectura" / "Editar Lectura"), títulos de sección de cada paso, etiquetas de formulario en mayúsculas, paso activo del indicador (`stepBadgeActive`), texto seleccionado de condición física, valores de referencia previa, lectura numérica principal (`numericInput`), botón de reanudación de borrador (`resumeButton`) y botón secundario de retroceso (`navButtonSecondary`).
  - `--epmaps-primary` (`#2D72C0`): Bordes activos de tarjetas de condición seleccionada (`conditionCardSelected`), borde de entrada numérica en reposo, icono de cámara en disparador (`cameraTriggerButton`), botón "Repetir Foto" y botón primario de avance (`navButtonPrimary`).
  - `--epmaps-accent-dark` (`#3B766C`): Píldora superior de identificación del medidor (`meterPill`), pasos completados del indicador (`stepBadgeCompleted`), etiquetas de categoría de paso (`PASO X DE 3`), subtítulo del disparador de cámara y banners informativos sobre fondo celeste (`infoBanner`, `infoBadgePending`) garantizando ratio de contraste 5.42:1 WCAG AA bajo luz solar directa.
  - `--epmaps-surface` (`#FFFFFF`): Tarjetas contenedoras de cada etapa (`stepContent`), barra de progreso de pasos (`stepIndicatorContainer`), tarjeta de vista previa de fotografía (`photoPreviewCard`), fila interactiva del checkbox de anomalía y fondo de botones secundarios.
  - `--epmaps-bg-light` (`#F8FAFC`): Fondo general de pantalla (`safeArea`), tarjetas de condición en reposo, campos de texto (`textInput`, `numericInput`) y tarjeta de resumen de registro (`summaryCard`).
  - `--epmaps-bg-secondary` (`#F1F5F9`): Ficha de referencias previas (`referenceContainer`), insignias de pasos pendientes y fondo de contenedor de imagen previa.
  - `--epmaps-bg-blue` (`#E1F2FB`): Cápsula del botón de retroceso (`backButtonBadge`), píldora del código de medidor, tarjeta de condición seleccionada, disparador de cámara con borde discontinuo y avisos de modo contingencia / inaccesibilidad.
  - Estados semánticos operativos:
    - **Consumo consistente y fotografía opcional:** Fondo `successBg` (`#E8F5E9`), borde `successBorder` (`#A5D6A7`), iconos y textos en `success` (`#2E7D32`). Botón maestro de cierre "Finalizar y Guardar" en `success` (`#2E7D32`) con texto e icono blanco.
    - **Advertencia de anomalía (> 3x promedio) y detección de borrador:** Fondo `warningBg` (`#FEF3C7`), borde `warningBorder` (`#FCD34D`), iconos y casilla de verificación activa en `warning` (`#D97706`) y texto de alta legibilidad en `textDark` (`#1E293B`).
    - **Errores de validación, inconsistencia física (`actual < anterior`), permiso de cámara denegado y obligatoriedad fotográfica:** Fondo `dangerBg` (`#FFEBEE`), borde `dangerBorder` (`#FFCDD2`), textos e iconos en `danger` (`#C62828`). Botón "Eliminar Foto" e input con inconsistencia en `dangerSoftBg` (`#FEF2F2`) y `dangerSoftBorder` (`#FCA5A5`).

- **Tipografía y Jerarquía (`design-taste-frontend` & `EPMAPS_TYPOGRAPHY`):**
  - Título de pantalla en 22 pt (`EPMAPS_TYPOGRAPHY.sizes.xl`), peso `800` (`extrabold`) y tracking de `-0.3 pt`.
  - Etiquetas de categoría de etapa (`PASO 1 DE 3 • INSPECCIÓN VISUAL`, etc.) y etiquetas de campo en 11 pt (`xs`), mayúsculas, peso `800` y `letterSpacing: 0.6 pt`.
  - Títulos de sección interna en 18 pt (`lg`) con peso `800` en `primaryDark`.
  - Campo de lectura volumétrica (`numericInput`) en 26 pt (`hero`), peso `800`, con cifras tabulares (`fontVariant: ['tabular-nums']`) para alineación monoespaciada de dígitos en campo.
  - Cifras tabulares (`tabular-nums`) aplicadas transversalmente en código de medidor, lectura anterior, consumo promedio, consumo mensual calculado, alerta de anomalía y resumen final de captura.
  - Reemplazo total de símbolos de texto y emojis crudos por iconografía vectorial semántica de `@expo/vector-icons` (`Ionicons`).

- **Márgenes, Radios y Espaciado (`emil-design-eng`):**
  - Objetivos táctiles exteriores: mínimo 48 pt (`EPMAPS_TOUCH.minHeight`) en botones de cabecera, acciones de borrador, acciones fotográficas y fila de confirmación de anomalía; 52 pt (`EPMAPS_TOUCH.buttonHeight`) en botones de navegación inferior (`Anterior`, `Siguiente`, `Finalizar y Guardar`); 56 pt en entrada numérica principal y 74 pt de altura en tarjetas de selección de condición física (`conditionCard`).
  - Ritmo espacial gobernado por `EPMAPS_SPACING`: padding general de 16 pt (`lg`), separación inferior de seguridad de 32 pt (`hero`), relleno interno de tarjetas de 16 pt (`lg`) y brechas de 8–12 pt (`sm`/`md`) entre controles horizontales.
  - Radios de curvatura unificados con `EPMAPS_RADII`: 12 pt (`lg`) en tarjetas de paso, stepper, disparador de cámara y alerta de anomalía; 8 pt (`md`) en campos de entrada, tarjetas de condición y botones de acción; 6 pt (`sm`) en casilla de verificación y cápsula de retroceso; `full` (`9999`) en píldora de medidor y círculo de cámara.

- **Estados Interactivos:**
  - **Reposo:** Superficies limpias con bordes definidos (`borderLight` `#E2E8F0` y `borderMedium` `#CBD5E1`), cero gradientes artificiales y contraste nítido para lectura bajo sol.
  - **Pulsación:** Feedback táctil inmediato con `activeOpacity={0.85}` en todos los selectores, casillas y botones de acción.
  - **Progreso de pasos:** El indicador superior distingue visualmente entre paso completado (icono `checkmark-circle` y tinte `accentDark` sobre `bgBlue`), paso activo (`primaryDark` con texto inverso) y paso pendiente (`bgSecondary` con `textMuted`), actualizando también el conector horizontal (`stepConnectorActive`).
  - **Validación en vivo e inconsistencia:** El campo `numericInput` y la caja `consumptionBox` conmutan dinámicamente a tokens `danger` cuando la lectura ingresada es inferior a la lectura anterior registrada.
  - **Guardado en curso:** El botón `Finalizar y Guardar` aplica `opacity: 0.6`, bloquea toques repetidos (`disabled={isSaving}`) y despliega `ActivityIndicator` en blanco.

- **Decisiones Estéticas Clave:**
  - **Tarjetas de Condición con Iconografía Semántica:** Cada estado físico (`Normal`, `Inaccesible`, `Dañado`) incorpora su propio icono vectorial (`checkmark-circle-outline`, `lock-closed-outline`, `construct-outline`) sobre tarjetas de 74 pt de alto para facilitar la selección con una sola mano en terreno.
  - **Contraste de Referencias vs. Entrada Volumétrica:** Las referencias históricas se agrupan en un bloque neutro (`bgSecondary`) con iconos de reloj y analítica, cediendo el protagonismo jerárquico al campo numérico de 26 pt y al indicador de consumo calculado en tiempo real.
  - **Confirmación Física de Anomalía Encapsulada:** El checkbox de verificación de anomalía se envuelve en una tarjeta blanca interactiva de 48 pt de alto mínimo dentro del contenedor ámbar, asegurando precisión táctil y visibilidad inequívoca del check vectorial.

