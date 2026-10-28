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
