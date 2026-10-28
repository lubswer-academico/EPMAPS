# Registro de Decisiones – Spec 004

## D1: Estructura de la bandeja de lecturas locales y estados visuales
- **Contexto:** En el marco de HU-004, el técnico necesita una vista centralizada donde consultar, revisar y acceder a las lecturas registradas durante su jornada de trabajo, tanto aquellas capturadas con datos de oficina como las capturadas en zonas sin cobertura o aquellas ya sincronizadas con el sistema central (R4, R10).
- **Decisión acordada:** 
  1. Diseñar una vista de bandeja/cola de lecturas del mes actual que liste todas las lecturas persistidas en el terminal, ordenadas descendentemente por fecha/hora de captura (la más reciente arriba).
  2. Cada tarjeta de lectura exhibirá claramente: código del medidor (`MED-XXXXXX`), condición física (`Normal`, `Inaccesible`, `Dañado`), lectura o motivo registrado, fecha/hora de registro, indicador de si posee fotografía y su estado operativo explícito:
     - **`Pendiente de verificar`**: Capturada en modo sin conexión ni datos previos de oficina (requiere verificación diferida en HU-005).
     - **`Pendiente de enviar`**: Capturada y validada localmente, lista para su transmisión remota.
     - **`Enviada`**: Ya transmitida y confirmada por el sistema comercial de la oficina (modo inmutable / solo lectura).
  3. Filtros rápidos en la cabecera de la bandeja: `Todas`, `Pendientes` (incluye pendientes de verificar y de enviar) y `Enviadas`, permitiendo al técnico ubicar ágilmente los registros a revisar o corregir.
- **Alternativas descartadas:**
  - *Separar en pantallas distintas las lecturas pendientes de las enviadas:* Descartado para mantener una experiencia unificada donde el técnico tenga visibilidad completa de toda su jornada en un solo punto accesible.
  - *No distinguir "Pendiente de verificar" de "Pendiente de enviar":* Descartado porque el técnico y los auditores deben saber exactamente qué lecturas carecen aún de contraste con la oficina comercial.
- **Impacto:** Afecta a RF-1, RF-2, RF-3 y RF-4 de la spec.

---

## D2: Reglas de edición y actualización sobre la cola existente
- **Contexto:** Si un técnico comete un error de digitación en campo (ej. digitó `1250` en lugar de `1520` o clasificó erróneamente el medidor como inaccesible cuando luego logró abrir el nicho), debe poder corregir el registro antes de su transmisión a oficina (R10), manteniendo la restricción de que cada medidor tiene un único registro por mes.
- **Decisión acordada:**
  1. Al seleccionar una lectura en estado `Pendiente de enviar` o `Pendiente de verificar` desde la bandeja (o al buscar su medidor en HU-002 si ya fue registrado este mes pero no enviado), el sistema habilita el modo "Editar lectura".
  2. La edición reutiliza el modelo de validación de 3 pasos (condición, lectura/motivo y fotografía) con los datos previamente guardados precargados.
  3. Al confirmar la edición, el sistema **actualiza la misma entidad existente** en la cola local:
     - Mantiene el mismo identificador único interno (`id`), el mismo código de medidor (`meterId`) y su pertenencia al mes en curso.
     - Actualiza la marca temporal de última modificación.
     - No genera un nuevo registro ni incrementa el contador global de pendientes (se reemplaza en el mismo índice de la cola).
  4. Si se edita una lectura que estaba `Pendiente de verificar` y el técnico decide rectificar valores, continuará con ese estado hasta que intervenga el motor de HU-005.
- **Alternativas descartadas:**
  - *Crear una nueva lectura y marcar la anterior como cancelada:* Descartado para evitar ensuciar el almacenamiento local y respetar la unicidad física y mensual del medidor en la cola.
  - *Permitir edición libre sin validar reglas de HU-003:* Descartado; toda corrección debe cumplir estrictamente las reglas de consistencia física ($\text{actual} \ge \text{anterior}$ si se conoce), detección de anomalías ($>3\times$) y obligatoriedad según condición.
- **Impacto:** Afecta a RF-5, RF-6, RF-7, RF-8 y RF-9 de la spec.

---

## D3: Manejo y persistencia de la fotografía durante la edición
- **Contexto:** Al editar una lectura pendiente, el técnico puede cambiar la condición del medidor (ej. de `Dañado` a `Normal`, o de `Normal` a `Dañado`), corregir la lectura eliminando o generando una anomalía, o desear reemplazar una foto borrosa.
- **Decisión acordada:**
  1. **Conservación por defecto:** Al entrar al modo de edición, si la lectura ya tenía una fotografía asociada, esta se muestra en la vista previa del Paso 3. Si el técnico no la altera, la foto existente se conserva intacta con su URI duradera.
  2. **Reemplazo de fotografía:** El técnico puede accionar el botón de reemplazar fotografía para tomar una nueva foto con la cámara. Al tomarse la nueva foto de forma satisfactoria, se sustituye la referencia y se elimina el archivo de la foto anterior del almacenamiento local para evitar archivos huérfanos.
  3. **Transición a estado donde la foto es opcional o innecesaria:** Si el técnico cambia de una condición obligatoria (ej. `Dañado`) a una condición donde la foto no es requerida (ej. `Normal` sin anomalía) y decide voluntariamente quitar la foto previa, el sistema permite eliminarla y borra el archivo asociado. Si el técnico no la borra, se conserva como evidencia opcional válida.
  4. **Transición a estado con foto obligatoria:** Si al modificar datos la foto pasa a ser obligatoria (ej. cambió a `Dañado` o la nueva lectura genera consumo $>3\times$ promedio), el sistema impide guardar los cambios hasta que exista una fotografía asociada válida.
- **Alternativas descartadas:**
  - *Borrar obligatoriamente la foto previa al iniciar la edición:* Descartado porque obligaría al técnico a fotografiar de nuevo el medidor innecesariamente si solo quería corregir un dígito.
  - *Mantener todas las fotos previas en disco sin borrar las descartadas:* Descartado para no saturar la memoria del terminal con fotos descartadas en campo.
- **Impacto:** Afecta a RF-10, RF-11, RF-12 y RF-13 de la spec.

---

## D4: Bloqueo estricto e inmutabilidad de lecturas enviadas
- **Contexto:** Por normas de auditoría comercial de la EPMAPS (R10), una lectura que ya fue transmitida y confirmada por el sistema comercial de la oficina es inmutable: no puede ser alterada, editada ni eliminada desde el dispositivo móvil.
- **Decisión acordada:**
  1. Cuando una lectura tiene el estado `Enviada`, al seleccionarla en la bandeja se abre exclusivamente en una pantalla de **Detalle de Lectura (Solo Lectura)**.
  2. En esta pantalla se muestran todos los datos registrados (código, condición, lectura/motivo, consumo, foto si existe, fecha de captura y fecha de envío), pero **no existe ningún botón de editar, guardar o eliminar**.
  3. Si desde la búsqueda de medidores (HU-002) se consulta un medidor que ya tiene lectura enviada en el mes en curso, el sistema informa que ya fue procesado y ofrece únicamente la opción de ver el detalle en solo lectura, bloqueando de raíz el inicio del asistente de captura o edición.
- **Alternativas descartadas:**
  - *Permitir edición con envío de "fe de erratas" o rectificación:* Descartado porque excede las atribuciones de la app móvil y pertenece a auditoría administrativa de oficina.
  - *Ocultar las lecturas enviadas de la bandeja:* Descartado porque el técnico necesita constancia visual de que su trabajo ya fue entregado y recibido por la empresa.
- **Impacto:** Afecta a RF-14, RF-15 y RF-16 de la spec.
