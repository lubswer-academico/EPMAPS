# Spec 004 - Bandeja de lecturas offline, registro sin señal y corrección de lecturas no enviadas

Estado: aprobada
HU de origen: docs/historias/HU-004.md

## Contexto y objetivo
Permitir a los técnicos de campo de la EPMAPS consultar y gestionar de manera integral la bandeja de lecturas capturadas durante el mes o jornada de trabajo, tanto en condiciones con señal como en zonas sin cobertura. La especificación formaliza el registro de lecturas sin datos previos de oficina asignándoles el estado "Pendiente de verificar", habilita la edición y corrección controlada de registros que aún no hayan sido transmitidos a la oficina central garantizando la unicidad mensual del medidor, define el ciclo de vida y reemplazo de fotografías asociadas, y blinda la inmutabilidad absoluta de cualquier registro que ya haya sido enviado y confirmado por los sistemas comerciales de la empresa.

## Usuarios
- **Técnico de campo:** Operador que realiza el recorrido de lectura, consulta su bandeja de lecturas locales para verificar el avance de su jornada, edita registros pendientes ante errores materiales de digitación o cambios in situ, y consulta el detalle histórico en modo solo lectura de las lecturas ya transmitidas.

## Historias de usuario
- **HU-004:** Registro sin señal (pendiente de verificar) y corrección de lecturas no enviadas.

## Definiciones
- **Bandeja de lecturas locales:** Interfaz centralizada que lista las lecturas de medidores registradas en el dispositivo móvil durante el mes activo, permitiendo su filtrado por estado y acceso a detalle o edición.
- **Estado "Pendiente de verificar":** Condición operativa de una lectura capturada sin conexión a internet y sin ficha previa en el caché de la jornada, indicando que el registro carece de cotejo con la lectura anterior y consumo promedio histórico de la oficina.
- **Estado "Pendiente de enviar":** Condición operativa de una lectura debidamente validada en el terminal (con o sin anomalías confirmadas) que se encuentra en la cola local esperando su sincronización hacia la oficina central.
- **Estado "Enviada":** Condición operativa de una lectura que ya fue transmitida, recibida y confirmada por el sistema comercial de la oficina, adquiriendo carácter de inmutabilidad estricta.
- **Edición de lectura:** Proceso mediante el cual el técnico modifica los datos de una captura previa no enviada, actualizando la misma entidad existente en la cola local sin duplicar registros para el mismo medidor en el mes.
- **Inmutabilidad de lectura enviada:** Restricción de seguridad y auditoría que impide modificar, sustituir o eliminar en el dispositivo cualquier dato o fotografía de una lectura en estado "Enviada".

## Requisitos funcionales (EARS)

### Visualización y gestión de la bandeja de lecturas
- RF-1: CUANDO el técnico accede a la bandeja de lecturas locales, EL SISTEMA presenta la lista consolidada de todas las lecturas registradas en el dispositivo para el mes en curso, ordenadas descendentemente por fecha y hora de registro. Origen: HU-004, sección 2 y Decisión D1.
- RF-2: MIENTRAS el técnico visualiza la lista de lecturas, EL SISTEMA muestra en cada tarjeta: el código del medidor (`MED-XXXXXX`), la condición física asignada (`Normal`, `Inaccesible`, `Dañado`), la lectura numérica o motivo registrado, la fecha y hora de la captura, un indicador visual de fotografía adjunta y su estado operativo (`Pendiente de verificar`, `Pendiente de enviar` o `Enviada`). Origen: HU-004, escenario 1 y Decisión D1.
- RF-3: CUANDO el técnico interactúa con los controles de filtro de la bandeja, EL SISTEMA permite alternar la vista entre `Todas`, `Pendientes` (que agrupa pendientes de verificar y de enviar) y `Enviadas`. Origen: Decisión D1.
- RF-4: SI no existen lecturas registradas que coincidan con el filtro seleccionado, ENTONCES EL SISTEMA presenta un mensaje informativo en pantalla indicando la ausencia de registros. Origen: Decisión D1.

### Captura sin señal y estado "Pendiente de verificar"
- RF-5: CUANDO el técnico finaliza la captura de una lectura habiendo iniciado el flujo sin señal y sin datos previos de oficina en el caché de la jornada, EL SISTEMA almacena el registro en la cola local persistente con el estado operativo "Pendiente de verificar". Origen: HU-004, escenario 1 y Decisión D1.
- RF-6: CUANDO se guarda un registro en estado "Pendiente de verificar", EL SISTEMA incrementa el contador global de lecturas pendientes visible en la barra superior de estado. Origen: HU-004, escenario 1 y HU-001, escenario 5.
- RF-7: EL SISTEMA conserva de forma segura y permanente en el almacenamiento local del terminal todos los datos del registro y su fotografía asociada correspondiente al estado "Pendiente de verificar" hasta su posterior procesamiento. Origen: HU-004, sección 2 y Decisión D1.

### Edición y corrección de lecturas no enviadas
- RF-8: CUANDO el técnico selecciona una lectura en estado "Pendiente de enviar" o "Pendiente de verificar" en la bandeja, EL SISTEMA presenta una acción para "Editar lectura" que abre el flujo de captura precargado con los datos existentes del registro. Origen: HU-004, escenario 2 y Decisión D2.
- RF-9: SI el técnico busca en la pantalla de consulta (HU-002) un medidor que ya posee una lectura registrada no enviada en el mes actual, ENTONCES EL SISTEMA informa que el medidor ya fue registrado este mes y ofrece la opción directa de editar la lectura existente en lugar de iniciar un nuevo registro en blanco. Origen: HU-002, escenario 4 y Decisión D2.
- RF-10: MIENTRAS el técnico edita una lectura, EL SISTEMA aplica rigurosamente todas las reglas de validación de condición del medidor, obligatoriedad de campos, cálculo de consumo, consistencia física ($\text{actual} \ge \text{anterior}$ si se dispone de lectura anterior) y detección de anomalías ($> 3\times$ promedio). Origen: HU-004, escenario 2, HU-003 y Decisión D2.
- RF-11: CUANDO el técnico confirma el guardado de la edición cumpliendo todas las validaciones, EL SISTEMA actualiza el registro existente en la cola local manteniendo su identificador único original y la restricción de registro único mensual, registrando la fecha y hora de la última modificación sin duplicar la entrada ni alterar el número neto de lecturas pendientes. Origen: HU-004, escenario 2 y Decisión D2.

### Ciclo de vida y gestión de fotografías en la edición
- RF-12: CUANDO el técnico accede a la edición de una lectura que ya contenía una fotografía asociada, EL SISTEMA muestra la vista previa de la imagen original en el paso correspondiente y la mantiene asociada por defecto. Origen: Decisión D3.
- RF-13: CUANDO el técnico decide reemplazar la fotografía existente durante la edición, EL SISTEMA permite accionar la cámara del terminal para capturar una nueva imagen; al confirmarse la nueva captura, EL SISTEMA actualiza la referencia persistente del registro y elimina el archivo físico de la fotografía anterior del almacenamiento local. Origen: Decisión D3.
- RF-14: SI como resultado de la edición la fotografía deja de ser obligatoria y el técnico solicita removerla expresamente, ENTONCES EL SISTEMA desvincula la foto del registro y elimina su archivo físico del almacenamiento local. Origen: Decisión D3.
- RF-15: SI durante la edición el técnico modifica los datos de tal manera que la fotografía pasa a ser obligatoria (cambio de condición a `Dañado` o ingreso de lectura con consumo anómalo $> 3\times$ promedio), ENTONCES EL SISTEMA bloquea el guardado de la corrección hasta que se capture y adjunte una fotografía válida. Origen: HU-004, sección 2 y Decisión D3.

### Bloqueo e inmutabilidad de lecturas enviadas
- RF-16: CUANDO el técnico selecciona en la bandeja una lectura cuyo estado operativo es "Enviada", EL SISTEMA abre la pantalla en modo de solo lectura, desplegando todos los datos del registro (código de medidor, condición, lectura o motivo, consumo calculado, confirmaciones, fotografía capturada si aplica, fecha de captura y fecha de envío) y bloquea u oculta cualquier botón de edición, guardado o eliminación. Origen: HU-004, escenario 3 y Decisión D4.
- RF-17: SI el técnico consulta desde la pantalla de búsqueda (HU-002) un medidor cuya lectura mensual ya fue marcada como "Enviada", ENTONCES EL SISTEMA informa que el medidor ya fue procesado y sincronizado con la oficina, ofreciendo exclusivamente la visualización del detalle en solo lectura y bloqueando cualquier opción de edición o nueva captura. Origen: HU-002, escenario 4, HU-004, escenario 3 y Decisión D4.
- RF-18: EL SISTEMA prohíbe de forma permanente cualquier operación de borrado o sobreescritura sobre los registros y fotografías correspondientes a lecturas en estado "Enviada" desde la aplicación móvil. Origen: HU-004, escenario 3 y Decisión D4.

## Requisitos no funcionales
- RNF-1: **Operación 100% offline de la bandeja y edición:** La visualización de la lista, el filtrado por estado, la precarga de datos para edición y el guardado de correcciones deben ejecutarse con total autonomía sin requerir conectividad de red.
- RNF-2: **Rendimiento y fluidez en listas:** La bandeja de lecturas locales debe cargar y renderizar hasta 500 registros con un tiempo de respuesta inferior a 200 ms, manteniendo un desplazamiento suave y sin bloqueos de la interfaz.
- RNF-3: **Limpieza y economía de almacenamiento:** Las operaciones de reemplazo o descarte voluntario de fotografías en modo de edición deben eliminar de inmediato los archivos físicos huérfanos del almacenamiento local para no saturar la capacidad del terminal.
- RNF-4: **Ergonomía visual y accesibilidad:** Las tarjetas de la bandeja y los elementos interactivos de filtrado, detalle y edición deben cumplir un objetivo táctil mínimo de 48x48 pt, con etiquetas textuales y contrastes aptos para visualización bajo luz solar directa.
- RNF-5: **Localización y lenguaje:** Todas las vistas, estados operativos, mensajes de advertencia, diálogos informativos y botones deben presentarse en idioma español formal y claro.

## Casos límite
- **Edición sin cambios de datos:** Si el técnico abre una lectura pendiente, no modifica ningún campo y presiona confirmar, el sistema conserva los valores idénticos sin generar errores ni duplicados.
- **Intento de registrar por segunda vez un medidor con lectura pendiente:** Si el técnico intenta iniciar una nueva captura para un medidor que ya tiene un registro pendiente en la cola, el sistema intercepta la acción y lo redirige automáticamente a la edición de la lectura existente para evitar duplicar el medidor en el mismo mes.
- **Cancelación voluntaria de la edición:** Si el técnico abandona la pantalla de edición sin confirmar los cambios, el sistema descarta las modificaciones temporales y mantiene intacto el registro original en la cola local.
- **Cambio de condición de `Normal` a `Inaccesible` durante la edición:** Si la lectura original tenía un valor numérico y se modifica la condición a `Inaccesible`, el sistema borra el valor numérico, exige el motivo textual de inaccesibilidad y evalúa la foto como opcional.
- **Cambio de condición de `Inaccesible` a `Normal` durante la edición:** El sistema exige obligatoriamente la lectura numérica, calcula el consumo frente a la lectura anterior (si se conoce) y evalúa si surge consumo anómalo.
- **Pérdida o falta de archivo de imagen local durante la edición:** Si por alguna contingencia externa el archivo de la foto original no se encuentra disponible en disco, el sistema presenta un aviso advirtiendo la ausencia de la imagen y solicita tomar una nueva si la condición o el consumo la exigen de forma obligatoria.

## Fuera de alcance
- La verificación diferida automática (comparación de lectura actual contra lectura anterior y promedio cuando vuelve la conexión a internet) de las lecturas marcadas como "Pendiente de verificar" queda fuera de esta spec. Origen: pertenece a HU-005.
- La detención del envío automático y la notificación diferida al técnico para agregar fotos ante consumos anómalos detectados tras recuperar la señal quedan fuera de esta spec. Origen: pertenece a HU-005.
- La subida de fotografías a almacenamiento externo en la nube y la obtención de URLs públicas quedan fuera de esta spec. Origen: pertenece a HU-005.
- El motor de sincronización automática en segundo plano y el envío masivo idempotente a la oficina central quedan fuera de esta spec. Origen: pertenece a HU-005.
- La anulación administrativa de lecturas ya enviadas o la emisión de refacturaciones comerciales quedan fuera de esta spec. Origen: excede el alcance del sistema móvil y corresponde a los sistemas comerciales centrales de la EPMAPS.

## Criterios de finalización
- Documento `decisiones.md` con las decisiones D1 a D4 completamente sustentadas.
- Documento `spec.md` redactado en estricta sintaxis EARS, sin código ni mención a librerías o bases de datos, con fronteras estrictamente blindadas frente a HU-005.
- Revisión y aprobación formal por parte del usuario (`Estado: aprobada`) antes de iniciar el diseño arquitectónico en `sdd-plan`.

## Dudas abiertas
- Ninguna pendiente.
