# Spec 002 - Identificación y consulta de medidor con caché de jornada

Estado: aprobada
HU de origen: docs/historias/HU-002.md

## Contexto y objetivo
Permitir al técnico de campo de la EPMAPS consultar y validar la información técnica y comercial de un medidor mediante el ingreso de su código oficial (`MED-XXXXXX`). La solución optimiza el uso de datos móviles y la velocidad de respuesta en terreno almacenando las fichas consultadas en un caché local de jornada. Asimismo, previene traslados y registros erróneos impidiendo consultas con formatos inválidos, bloquea dobles lecturas dentro del mismo mes calendario (R10) y garantiza la continuidad operativa cuando no hay señal de red ni datos previos descargados (R4).

## Usuarios
- **Técnico de campo:** Operador que recorre las rutas asignadas para identificar predios, verificar medidores y preparar la toma de lecturas.

## Historias de usuario
- **HU-002:** Identificación y consulta de medidor con caché de jornada.

## Definiciones
- **Código de medidor:** Identificador alfanumérico normalizado compuesto estrictamente por el prefijo `MED-` seguido de 6 dígitos numéricos (ej. `MED-123456`).
- **Ficha del medidor:** Conjunto de datos comerciales y técnicos obtenidos de la oficina central: dirección, sector, número de cuenta, estado comercial, última lectura registrada, fecha de la última lectura y consumo promedio mensual en metros cúbicos ($m^3$).
- **Caché de jornada:** Almacenamiento local temporal persistente que retiene las fichas de medidores consultadas durante el turno de trabajo activo, permitiendo su recuperación instantánea sin conexión de red y sin descargas repetidas.
- **Duplicidad mensual (R10):** Restricción de negocio que prohíbe generar más de un registro de lectura para un mismo medidor dentro del mismo mes y año calendario.

## Requisitos funcionales (EARS)
- RF-1: MIENTRAS el técnico escribe el código del medidor en el campo de búsqueda, EL SISTEMA normaliza automáticamente el texto a mayúsculas, asiste con el prefijo canónico `MED-` y mantiene bloqueada la acción de consulta hasta que el código contenga exactamente `MED-` seguido de seis dígitos numéricos. Origen: HU-002, escenario 1 y Decisión D1.
- RF-2: SI el técnico intenta forzar una búsqueda con un código incompleto o que no coincide estrictamente con la estructura `MED-XXXXXX`, ENTONCES EL SISTEMA impide la petición al sistema de la oficina y presenta un mensaje indicando que el código debe contener el prefijo `MED-` y 6 dígitos numéricos. Origen: HU-002, escenario 1 y Decisión D1.
- RF-3: CUANDO el técnico ejecuta la búsqueda de un código válido `MED-XXXXXX` disponiendo de señal de red y el medidor no se encuentra en el caché de la jornada, EL SISTEMA consulta los datos al sistema de la oficina, presenta en pantalla la ficha completa (dirección, sector, número de cuenta, estado, última lectura con su fecha y consumo promedio mensual) y almacena dicha ficha en el caché local de jornada. Origen: HU-002, escenario 2 y Decisión D2.
- RF-4: CUANDO el técnico consulta un código válido `MED-XXXXXX` que ya fue consultado previamente durante la jornada activa, EL SISTEMA presenta inmediatamente en pantalla los datos recuperados del caché local sin emitir solicitudes de red al sistema de la oficina. Origen: HU-002, escenario 3 y Decisión D2.
- RF-5: SI el medidor consultado ya cuenta con una lectura registrada en el mes calendario actual, ENTONCES EL SISTEMA bloquea la opción de iniciar un nuevo registro e informa al técnico la situación: si la lectura está guardada localmente pendiente de envío ofrece el acceso para revisarla o editarla, y si ya fue enviada a la oficina notifica que la lectura mensual está cerrada y no admite modificaciones. Origen: HU-002, escenario 4 y Decisión D4.
- RF-6: SI el dispositivo se encuentra sin señal (o falla la conexión) y el código válido `MED-XXXXXX` no está guardado en el caché de jornada, ENTONCES EL SISTEMA muestra una advertencia informativa de ausencia de datos previos y habilita la acción para continuar al registro de la lectura identificándola como pendiente de verificación posterior. Origen: HU-002, escenario 5 y Decisión D3.
- RF-7: CUANDO el técnico consulta un medidor con datos válidos (descargados o en caché) y no presenta bloqueo de duplicidad mensual, EL SISTEMA habilita la acción principal para iniciar el registro de la lectura del medidor. Origen: HU-002, escenario 2 y HU-003.
- RF-8: EL SISTEMA purga automáticamente las fichas almacenadas en el caché de jornada cuando transcurren 24 horas desde su registro o cuando el técnico ejecuta el cierre voluntario de sesión. Origen: Decisión D2.

## Requisitos no funcionales
- RNF-1: **Autonomía y disponibilidad offline:** La pantalla de consulta y el acceso al caché local deben funcionar en ausencia total de cobertura de red o datos móviles.
- RNF-2: **Tiempo de respuesta en caché:** La recuperación y despliegue visual de una ficha de medidor almacenada en el caché de jornada no debe exceder los 100 ms.
- RNF-3: **Tolerancia a interrupciones:** El contenido del caché de jornada no debe destruirse por el cierre imprevisto de la aplicación, bloqueo de pantalla o reinicio del terminal.
- RNF-4: **Ergonomía de campo y accesibilidad táctil:** Las acciones principales de consulta y avance a captura deben poseer un tamaño táctil mínimo de 48x48 pt, apto para manipulación en terreno con una sola mano.
- RNF-5: **Claridad lingüística y de estado:** Todas las etiquetas, advertencias de falta de red y mensajes de error deben mostrarse en español conciso, comprensible para el personal técnico.

## Casos límite
- **Espacios accidentales en el código:** Si el técnico copia o escribe espacios antes o después del código (ej. ` MED-123456 `), el sistema los recorta automáticamente sin invalidar el formato.
- **Minúsculas en el código:** Si se ingresa `med-123456`, se convierte automáticamente a mayúsculas `MED-123456`.
- **Medidor no encontrado en oficina con señal:** Si la oficina responde que el código `MED-XXXXXX` no existe en el catastro, el sistema muestra el mensaje de medidor inexistente y permite verificar el código ingresado o continuar con captura como no registrado si las políticas operativas lo toleran.
- **Transición súbita de señal durante la consulta:** Si la señal se interrumpe justo durante la petición a la oficina, el sistema degrada con elegancia al flujo de "sin señal", mostrando la advertencia y permitiendo continuar a captura sin datos previos según Decisión D3.
- **Cambio de mes calendario:** El cálculo de duplicidad mensual se evalúa estrictamente contra el mes y año calendario de la fecha actual del dispositivo.

## Fuera de alcance
- El formulario de captura multipantalla, selección de estado (normal, inaccesible, dañado), cálculo de consumo anómalo (> 3x promedio) y toma de fotografías quedan fuera de esta spec. Origen: pertenece a HU-003.
- La recuperación o descarte de borradores de captura interrumpidos queda fuera de esta spec. Origen: pertenece a HU-003.
- El listado, detalle y edición de los campos de una lectura local no enviada quedan fuera de esta spec. Origen: pertenece a HU-004.
- La verificación diferida contra la oficina y el motor de sincronización automática en segundo plano quedan fuera de esta spec. Origen: pertenece a HU-005.
- La subida de imágenes a servidores externos y gestión de URLs públicas quedan fuera de esta spec. Origen: pertenece a HU-005.
- La precarga masiva por archivo o descarga de rutas completas de trabajo queda fuera de esta spec. Origen: no forma parte del alcance de HU-002 (búsqueda puntual por medidor con caché de jornada).

## Criterios de finalización
- Documento `decisiones.md` con las decisiones D1, D2, D3 y D4 fundamentadas.
- Documento `spec.md` redactado en sintaxis EARS, sin nombres de librerías, hooks ni bases de datos, con fronteras estrictamente blindadas.
- Aprobación explícita del usuario (`Estado: aprobada`) antes de iniciar la etapa técnica `sdd-plan`.

## Dudas abiertas
- Ninguna pendiente.
