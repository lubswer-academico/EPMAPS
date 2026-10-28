# Spec 003 - Captura multipantalla de lectura, anomalías, fotografía y recuperación de borrador

Estado: aprobada
HU de origen: docs/historias/HU-003.md

## Contexto y objetivo
Proporcionar al técnico de campo de la EPMAPS un flujo de captura asistido, progresivo y tolerante a fallos para registrar la lectura del medidor o documentar los impedimentos físicos que imposibiliten su lectura (inaccesibilidad o avería física). El sistema garantiza la veracidad de la auditoría en campo mediante la detección instantánea de consumos anómalos (> 3x el promedio mensual), exigiendo confirmación explícita y fotografía obligatoria en situaciones críticas, asegurando la persistencia ininterrumpida de borradores ante cierres accidentales de la aplicación y gestionando la tenencia y archivo seguro de fotografías en el almacenamiento local permanente del terminal.

## Usuarios
- **Técnico de campo:** Operador que inspecciona in situ el medidor de agua, digita los valores numéricos observados o redacta los motivos de inaccesibilidad/daño, captura fotografías de evidencia y confirma las advertencias de consumo excesivo.

## Historias de usuario
- **HU-003:** Captura multipantalla de lectura, anomalías, fotografía y recuperación de borrador.

## Definiciones
- **Condición física del medidor:** Clasificación operativa del medidor al momento de la inspección: `Normal` (medidor legible y operativo), `Inaccesible` (imposibilidad física de acceder al medidor) o `Dañado` (medidor con deterioro físico visible o mecanismo trabado).
- **Consumo mensual:** Volumen de agua registrado en metros cúbicos ($m^3$) resultante de la diferencia matemática entre la lectura actual y la lectura anterior registrada en el sistema comercial.
- **Consumo anómalo:** Situación operativa donde el consumo mensual calculado excede estrictamente el triple (> 3 veces) del consumo promedio mensual histórico del medidor.
- **Borrador de captura:** Estado de datos persistido temporalmente de forma local que almacena los valores parciales ingresados por el técnico antes de la confirmación y consolidación final del registro en la cola de envío.
- **Registro de lectura en cola local:** Entidad consolidada y persistente en el dispositivo que contiene todos los datos validados de la captura (código de medidor, condición, lectura o motivo, cálculo de consumo, confirmación de anomalía, referencia de foto local y marca de verificación) lista para su futura sincronización.

## Requisitos funcionales (EARS)

### Paso 1: Condición del medidor y motivos
- RF-1: CUANDO el técnico inicia la captura de un medidor, EL SISTEMA presenta el Paso 1 del flujo requiriendo la selección obligatoria de una de las tres condiciones físicas: `Normal`, `Inaccesible` o `Dañado`. Origen: HU-003, sección 2 y Decisión D1.
- RF-2: SI el técnico selecciona la condición `Inaccesible`, ENTONCES EL SISTEMA exige de forma obligatoria el ingreso de un texto descriptivo del motivo de inaccesibilidad, deshabilita y oculta la entrada de lectura numérica, y habilita el paso a la captura fotográfica opcional. Origen: HU-003, escenario 2 y Decisión D2.
- RF-3: SI el técnico selecciona la condición `Dañado`, ENTONCES EL SISTEMA exige de forma obligatoria el ingreso de un texto descriptivo del daño físico del medidor y define la toma fotográfica como obligatoria. Origen: HU-003, escenario 3 y Decisión D2.
- RF-4: CUANDO el técnico completa los campos obligatorios del Paso 1 (selección de condición y motivo/daño según corresponda), EL SISTEMA habilita el avance al Paso 2 del flujo. Origen: Decisión D1 y D2.

### Paso 2: Lectura numérica y verificación de anomalía
- RF-5: CUANDO el técnico accede al Paso 2 habiendo seleccionado la condición `Normal`, EL SISTEMA exige de forma obligatoria el ingreso de una lectura numérica mayor o igual a cero. Origen: HU-003, escenario 1 y Decisión D2.
- RF-6: SI se ingresa una lectura numérica y se dispone de la lectura anterior del medidor, ENTONCES EL SISTEMA calcula el consumo mensual mediante la fórmula `Lectura actual - Lectura anterior`. Si la lectura actual es menor a la anterior, EL SISTEMA bloquea el avance e informa el error de inconsistencia física. Origen: HU-003, escenario 4 y Decisión D3.
- RF-7: SI el consumo mensual calculado supera estrictamente el triple (> 3x) del promedio mensual registrado del medidor, ENTONCES EL SISTEMA presenta una alerta visual destacada de consumo anómalo, exige de forma obligatoria marcar la casilla de confirmación de revisión física del medidor y convierte la fotografía del Paso 3 en obligatoria para poder finalizar. Origen: HU-003, escenario 4 y Decisión D3.
- RF-8: SI la captura se inició en modo sin datos previos (sin señal ni ficha previa en caché), ENTONCES EL SISTEMA permite registrar la lectura numérica omitiendo el cálculo de consumo y anomalía en pantalla, y marca internamente el registro como "Pendiente de verificar". Origen: HU-003, sección 2 y Decisión D3.
- RF-9: CUANDO el técnico accede al Paso 2 habiendo seleccionado la condición `Dañado`, EL SISTEMA presenta el campo de lectura numérica como opcional, evaluando consumo y anomalía únicamente si el técnico decide digitar un valor numérico legible. Origen: HU-003, escenario 3 y Decisión D2.

### Paso 3: Gestión fotográfica y finalización
- RF-10: MIENTRAS el técnico se encuentra en el Paso 3, EL SISTEMA presenta el estado del requerimiento fotográfico (indicando si la foto es "Opcional" o "Requerida obligatoriamente por daño o anomalía") y permite accionar la cámara del terminal para capturar la imagen. Origen: HU-003, sección 2 y Decisión D1.
- RF-11: SI el permiso de cámara es denegado por el usuario, ENTONCES EL SISTEMA presenta una explicación de la necesidad de respaldo visual y: si la fotografía es opcional permite guardar el registro sin imagen; si la fotografía es obligatoria mantiene bloqueada la finalización hasta que se conceda el permiso y se capture la fotografía. Origen: HU-003, escenario 5 y Decisión D5.
- RF-12: CUANDO se toma una fotografía satisfactoriamente, EL SISTEMA persiste la imagen en el almacenamiento local del dispositivo con un identificador duradero (URI persistente), muestra la vista previa de la imagen y permite la opción de reemplazarla tomando una nueva fotografía. Origen: HU-003, sección 2 y Decisión D5.
- RF-13: CUANDO el técnico confirma el guardado final en el Paso 3 cumpliendo todas las validaciones de condición, lectura, anomalía y fotografía, EL SISTEMA consolida el registro en la cola local persistente de lecturas pendientes de envío, incrementa el contador global de lecturas pendientes, elimina el borrador temporal activo y redirige al técnico a la pantalla principal de consulta. Origen: HU-003, escenario 1 y Decisión D4.

### Persistencia y ciclo de vida de borradores
- RF-14: EL SISTEMA persiste automáticamente en almacenamiento local cualquier cambio de campo o transición de paso durante el flujo de captura como un borrador activo asociado al medidor en curso. Origen: HU-003, escenario 6 y Decisión D4.
- RF-15: SI al acceder a la captura de un medidor (o tras reiniciar la aplicación) se detecta un borrador incompleto para dicho código, ENTONCES EL SISTEMA presenta un diálogo prioritario ofreciendo dos acciones: "Reanudar captura" (restaura todos los datos previos y ubica al técnico en el paso correspondiente) o "Descartar borrador" (elimina los datos temporales e inicia el formulario en blanco). Origen: HU-003, escenario 6 y Decisión D4.

## Requisitos no funcionales
- RNF-1: **Operación 100% offline:** El flujo completo de 3 pasos, las validaciones lógicas, el almacenamiento del borrador y el guardado final en cola local deben funcionar con total autonomía sin requerir conexión a internet.
- RNF-2: **Persistencia duradera de imágenes:** Las fotografías capturadas deben almacenarse en el sistema de archivos local persistente de la aplicación de modo que permanezcan intactas ante apagados de terminal o durante varios días hasta su futura transmisión remota.
- RNF-3: **Tolerancia a cortes y fallas:** El guardado automático del borrador debe ejecutarse con una latencia inferior a 50 ms por modificación para evitar pérdida de datos si la aplicación se suspende abruptamente.
- RNF-4: **Ergonomía visual y táctil en terreno:** Los botones de navegación entre pasos, selección de condición física, toma de fotografía y confirmación deben cumplir con un objetivo táctil mínimo de 48x48 pt y alto contraste visual apto para exteriores.
- RNF-5: **Claridad y localización:** Todos los textos, alertas de anomalía, advertencias de inconsistencia y confirmaciones deben mostrarse en idioma español comprensible y directo.

## Casos límite
- **Lectura actual menor a lectura anterior:** El sistema rechaza el valor ingresado y muestra error explícito ("La lectura actual no puede ser menor a la lectura anterior registrada"), impidiendo avanzar al Paso 3 hasta corregir el valor.
- **Lectura actual exactamente igual a lectura anterior:** Consumo calculado igual a 0 $m^3$. Se considera valor válido y no anómalo (salvo que apliquen reglas comerciales externas en etapas posteriores).
- **Cierre violento de la aplicación con foto tomada en borrador:** Al reanudar el borrador, la referencia a la fotografía local tomada previamente debe restaurarse y exhibirse correctamente en la vista previa del Paso 3.
- **Descarte voluntario de borrador:** Al descartar un borrador que contenía una foto tomada, el sistema debe eliminar tanto la referencia del borrador como el archivo local huérfano para evitar saturar el almacenamiento del dispositivo.
- **Espacio en blanco o caracteres no numéricos en lectura:** El campo de lectura debe restringirse a dígitos numéricos enteros positivos, eliminando caracteres no válidos.
- **Motivo de inaccesibilidad o daño con solo espacios en blanco:** La validación exige texto con caracteres visibles (tras aplicar recorte de espacios / trim); no se admiten campos vacíos o con solo espacios.

## Fuera de alcance
- La búsqueda del medidor, validación del formato `MED-XXXXXX` y consulta de caché de jornada quedan fuera de esta spec. Origen: pertenece a HU-002.
- El listado histórico de lecturas pendientes de envío y la edición o corrección posterior de registros ya consolidados en cola quedan fuera de esta spec. Origen: pertenece a HU-004.
- La verificación diferida de consumos anómalos contra la oficina cuando una lectura se tomó sin señal queda fuera de esta spec. Origen: pertenece a HU-005.
- La subida remota de fotografías a servicios de almacenamiento externo (Cloud) y la sincronización automática de lecturas en segundo plano quedan fuera de esta spec. Origen: pertenece a HU-005.
- El envío de mensajes SMS o correos electrónicos al abonado sobre anomalías de consumo queda fuera de esta spec. Origen: no forma parte del alcance del sistema móvil de lectura.

## Criterios de finalización
- Documento `decisiones.md` con las decisiones D1 a D5 completamente justificadas.
- Documento `spec.md` redactado en estricta sintaxis EARS, sin mención de librerías, hooks o bases de datos, y con fronteras blindadas.
- Aprobación explícita del usuario (`Estado: aprobada`) antes de avanzar al diseño técnico en `sdd-plan`.

## Dudas abiertas
- Ninguna pendiente.
