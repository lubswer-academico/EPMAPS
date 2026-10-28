# Registro de Decisiones – Spec 003

## D1: Estructura del flujo multipantalla (Wizard de captura de 3 pasos)
- **Contexto:** La captura de lectura en campo involucra múltiples datos (estado físico, valores numéricos o motivos de imposibilidad, análisis de anomalía, captura fotográfica y confirmación final). Presentar todos los campos en un solo formulario largo incrementa el riesgo de errores de digitación en terreno bajo lluvia o sol, dificulta la validación progresiva y entorpece la lógica condicional exigida por el cliente (R8).
- **Decisión acordada:** Estructurar el proceso de captura en un wizard secuencial de 3 pasos claros:
  1. **Paso 1 - Estado y condición del medidor:** Selección obligatoria del estado físico (`Normal`, `Inaccesible`, `Dañado`). Si es `Inaccesible`, se solicita el motivo obligatorio. Si es `Dañado`, se solicita la descripción obligatoria del daño.
  2. **Paso 2 - Lectura y verificación de consumo:**
     - Si el estado es `Normal`: ingreso obligatorio de la lectura actual numérica. Si se cuenta con datos previos (lectura anterior y promedio mensual), el sistema calcula inmediatamente el consumo (`actual - anterior`) y evalúa si existe consumo anómalo (> 3x promedio). Si hay anomalía, muestra la alerta visual y exige un checkbox de confirmación física obligatoria antes de habilitar el avance.
     - Si el estado es `Dañado`: el campo de lectura numérica se presenta como opcional. Si se ingresa valor y hay datos previos, se aplican las mismas reglas de cálculo y verificación de anomalía.
     - Si el estado es `Inaccesible`: el campo de lectura queda omitido o deshabilitado y se avanza directamente al siguiente paso sin cálculo de consumo.
     - Si se inició la captura sin datos previos (modo sin señal / sin ficha previa), se permite ingresar la lectura actual sin calcular consumo ni anomalía en este momento, indicando visualmente que el contraste se realizará posteriormente.
  3. **Paso 3 - Fotografía y guardado final:**
     - Visualización del requerimiento fotográfico según las reglas evaluadas en los pasos previos (opcional u obligatoria).
     - Mecanismo para capturar la fotografía con la cámara del dispositivo, vista previa de la imagen tomada y opción de reintentar la toma.
     - Resumen consolidado de los datos capturados y botón de guardado definitivo en la cola local de pendientes de envío.
- **Alternativas descartadas:**
  - *Formulario único en una sola pantalla con scroll:* Descartado porque la lógica condicional (ocultar/mostrar campos según el estado y hacer obligatoria la foto o el checkbox de anomalía) confunde al técnico en campo y no cumple la especificación explícita de "flujo en varias pantallas" solicitada en el requerimiento R8.
  - *Wizard de 4 o más pasos dividiendo foto y confirmación:* Descartado por sobreingeniería y lentitud innecesaria para el técnico que realiza decenas de lecturas al día.
- **Impacto:** Afecta a RF-1, RF-2, RF-3, RF-4, RF-7, RF-9, RF-10 y RF-11.

---

## D2: Reglas deterministas de obligatoriedad según condición del medidor
- **Contexto:** EPMAPS audita el uso del agua y los motivos de no lectura o averías físicas. Las reglas operativas de obligatoriedad deben ser rigurosas, deterministas y sin ambigüedades (R5).
- **Decisión acordada:** La matriz estricta de campos obligatorios y opcionales se define de la siguiente manera:
  1. **Condición "Normal":**
     - Lectura numérica: **Obligatoria**. Debe ser un número mayor o igual a cero y mayor o igual a la lectura anterior (cuando esta se conozca).
     - Motivo / Descripción: **No aplica** (bloqueado/oculto).
     - Fotografía: **Opcional**, excepto si el consumo calculado supera el triple (> 3x) del promedio mensual, en cuyo caso se transforma automáticamente en **Obligatoria**.
     - Confirmación de revisión física: **Obligatoria únicamente si hay consumo anómalo**.
  2. **Condición "Inaccesible":**
     - Motivo de inaccesibilidad: **Obligatorio** (texto descriptivo no vacío, ej. reja cerrada, perro bravo, escombros).
     - Lectura numérica: **No aplica** (bloqueado/oculto).
     - Fotografía: **Opcional** (respaldo visual del impedimento de acceso).
     - Consumo y anomalía: **No aplica**.
  3. **Condición "Dañado":**
     - Descripción del daño: **Obligatoria** (texto descriptivo no vacío, ej. vidrio roto, carátula empañada, mecanismo trabado).
     - Lectura numérica: **Opcional** (se registra si los números aún son parcialmente legibles; de lo contrario se deja en blanco).
     - Fotografía del medidor: **Obligatoria** (auditoría visual obligatoria del daño físico reportado).
     - Si se ingresó lectura numérica y hay datos previos: si genera consumo anómalo, se exige adicionalmente la confirmación de revisión física.
- **Alternativas descartadas:**
  - *Permitir guardar estado Inaccesible con lectura estimada:* Descartado porque la política de EPMAPS exige que la estimación la realice el sistema comercial de oficina y no el técnico en terreno.
  - *Hacer la foto obligatoria para todos los casos normales:* Descartado para no ralentizar la jornada operativa del técnico en medidores sin problemas.
- **Impacto:** Afecta a RF-2, RF-3, RF-4, RF-5, RF-7 y RF-9.

---

## D3: Cálculo de consumo, umbral de anomalía y operación sin datos previos
- **Contexto:** La detección temprana de consumos anómalos (fugas no detectadas, errores de digitación o lecturas invertidas) en campo evita refacturaciones y reclamos ciudadanos (R6). Se requiere una regla matemática exacta y definir cómo se comporta la pantalla cuando la lectura se realiza sin señal y sin ficha previa en caché.
- **Decisión acordada:**
  1. **Fórmula de consumo:** Se calcula exclusivamente cuando se dispone de la lectura anterior:
     $$\text{Consumo del mes} = \text{Lectura actual} - \text{Lectura anterior}$$
  2. **Regla de consistencia física:** Si la lectura actual es estrictamente inferior a la lectura anterior ($\text{Lectura actual} < \text{Lectura anterior}$), el sistema no permite avanzar y presenta una advertencia de error ("La lectura actual no puede ser menor a la lectura anterior registrada"), solicitando al técnico verificar el contador.
  3. **Umbral de anomalía:** Si se cuenta con el dato de consumo promedio mensual ($\text{Promedio} > 0$), se evalúa:
     $$\text{Es anómalo} \iff \text{Consumo del mes} > 3 \times \text{Promedio mensual}$$
  4. **Consecuencias de la anomalía:**
     - Se despliega un banner destacado de advertencia de consumo excesivo mostrando el consumo calculado versus el promedio habitual.
     - Se exige marcar una casilla de verificación obligatoria: *"Confirmo que revisé físicamente el medidor y la lectura ingresada es correcta"*.
     - La fotografía del medidor pasa de ser opcional a ser **estrictamente obligatoria**.
  5. **Operación sin datos previos (Modo sin señal / sin caché):** Si el técnico avanzó desde HU-002 sin datos previos de oficina, los campos de lectura anterior y promedio mensual se marcan como no disponibles (`N/D`). En este escenario, la lectura numérica se registra normalmente, el cálculo de consumo y la detección de anomalía se omiten temporalmente en la interfaz del técnico, y la lectura se guarda con la marca interna de "Pendiente de verificar" para que la comparación matemática se ejecute automáticamente cuando retorne la señal en HU-005.
- **Alternativas descartadas:**
  - *Bloquear la captura si no se tiene la lectura anterior:* Descartado porque violaría el principio offline-first (R4) impidiendo al técnico trabajar en zonas sin cobertura.
  - *Permitir ignorar la alerta de anomalía sin foto ni confirmación:* Descartado porque violaría las reglas de auditoría y aceptación R6 y R7.
- **Impacto:** Afecta a RF-5, RF-6, RF-7 y RF-8.

---

## D4: Política de persistencia y ciclo de vida del borrador
- **Contexto:** En campo ocurren cierres accidentales de la app, llamadas telefónicas entrantes, apagados repentinos por batería baja o bloqueos del sistema operativo mientras el técnico está a mitad de la captura. El requerimiento R8 exige recuperar el avance o descartarlo sin perder información.
- **Decisión acordada:**
  1. **Guardado en caliente (Auto-save):** Cada cambio de campo o transición de paso en el wizard se persiste de inmediato de forma atómica y local como borrador activo asociado al código del medidor (`MED-XXXXXX`).
  2. **Detección al ingresar:** Si existe un borrador persistido para el medidor consultado (o al reabrir la aplicación con captura en curso), el sistema presenta de forma modal o banner prioritario un aviso con dos opciones claras:
     - **"Reanudar captura"**: Restaura todos los campos ingresados previamente (estado, motivos, lecturas, confirmaciones y foto capturada) y sitúa al técnico en el paso donde se encontraba.
     - **"Descartar borrador"**: Elimina el borrador almacenado (liberando cualquier archivo temporal de foto huérfano) y reinicia el formulario desde el Paso 1 con valores limpios.
  3. **Limpieza tras guardado exitoso:** Al presionar "Guardar lectura" en el Paso 3 y consolidar el registro en la cola definitiva de pendientes de envío, el borrador temporal se elimina automáticamente.
- **Alternativas descartadas:**
  - *Recuperación silenciosa sin preguntar:* Descartado porque el técnico podría desear anular una captura errónea o incompleta y reiniciar el proceso desde cero.
  - *Guardar el borrador solo al cambiar de paso:* Descartado porque si la app se cierra mientras el técnico escribe una descripción larga de daño en el paso 1, perdería el texto ingresado.
- **Impacto:** Afecta a RF-12, RF-13 y RF-14.

---

## D5: Gestión de permisos de cámara y persistencia de archivo de imagen local
- **Contexto:** La toma de fotografías depende de los permisos del sistema operativo y debe garantizar que el archivo de imagen persista en el almacenamiento interno del dispositivo durante varios días hasta que se produzca la sincronización remota (R7).
- **Decisión acordada:**
  1. **Solicitud de permisos en contexto:** El permiso de cámara se solicita en el momento en que el técnico interactúa por primera vez con el botón de captura fotográfica en el Paso 3 (o previamente si lo autoriza).
  2. **Comportamiento ante denegación:**
     - Si el permiso es denegado, se presenta un mensaje explicativo claro indicando el motivo por el cual EPMAPS requiere respaldo visual de la lectura física.
     - **Si la foto es opcional (Condición Normal sin anomalía o Condición Inaccesible):** La denegación del permiso no bloquea la finalización de la captura; el técnico puede proceder a guardar el registro sin fotografía.
     - **Si la foto es obligatoria (Condición Dañado o Consumo Anómalo):** La denegación del permiso bloquea el botón de finalización. El sistema informa que no es posible cerrar el registro de un medidor dañado o con anomalía sin su fotografía de respaldo, ofreciendo un acceso para reintentar la solicitud de permisos o abrir los ajustes del dispositivo.
  3. **Persistencia de la imagen:** La fotografía capturada se almacena en el directorio de almacenamiento persistente de la aplicación con un identificador unívoco vinculado al código del medidor y fecha de captura. El registro guarda la referencia local duradera (URI persistente).
- **Alternativas descartadas:**
  - *Permitir seleccionar fotos desde la galería del dispositivo:* Descartado para asegurar la veracidad de la auditoría en campo (la foto debe ser tomada en vivo frente al medidor con la cámara).
  - *Bloquear la aplicación entera si se niega el permiso de cámara:* Descartado porque penalizaría capturas normales donde la foto es meramente facultativa.
- **Impacto:** Afecta a RF-9, RF-10, RF-11 y RNF-3.
