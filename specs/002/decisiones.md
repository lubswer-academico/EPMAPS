# Registro de Decisiones – Spec 002

## D1: Normalización, máscara y validación del código de medidor (`MED-XXXXXX`)
- **Contexto:** En campo, los técnicos digitan con guantes, prisas o teclados virtuales pequeños. Es común omitir el prefijo, escribirlo en minúsculas (`med-123456`) u omitir el guion (`MED123456` o `123456`). La regla de negocio exige el formato exacto `MED-` seguido de 6 dígitos numéricos (`MED-XXXXXX`).
- **Decisión acordada:** 
  1. El sistema normaliza automáticamente la entrada convirtiendo caracteres a mayúsculas y eliminando espacios en blanco en los extremos.
  2. Si el técnico ingresa únicamente los 6 dígitos numéricos o escribe sin guion (ej. `MED123456` o `123456`), la interfaz asiste formateando o autocompletando con el prefijo canónico `MED-`.
  3. La validación estricta exige exactamente el prefijo `MED-` seguido de 6 dígitos numéricos (longitud total: 10 caracteres). Mientras no se cumpla este patrón exacto, el botón o acción de consulta a la oficina permanece deshabilitado y se muestra un mensaje informativo indicando el formato requerido.
- **Alternativas descartadas:**
  - *Permitir consultar códigos incompletos o con comodines:* Descartada porque HU-002 prohíbe explícitamente consultar a la oficina si el código no cumple el formato exacto para evitar consumo innecesario de red y errores de búsqueda.
  - *Rechazar sin formateo amigable obligando a escribir siempre "MED-":* Descartada porque genera fricción operativa y errores de digitación en campo.
- **Impacto:** Afecta a RF-1, RF-2, validación de dominio del código de medidor.

## D2: Política de persistencia y expiración del caché de jornada
- **Contexto:** HU-002 establece que una vez consultado un medidor exitosamente con señal, su ficha (dirección, sector, cuenta, estado, última lectura, fecha y consumo promedio mensual) debe guardarse en caché para no volver a descargarlo en la misma jornada. Se debe precisar cuándo caduca o se limpia este caché.
- **Decisión acordada:** El caché de jornada está vinculado a la jornada de trabajo diaria del técnico:
  1. Se conserva localmente durante el turno activo para permitir consultas instantáneas offline de medidores ya descargados.
  2. El caché expira y se purga automáticamente al transcurrir 24 horas desde su almacenamiento o cuando el técnico ejecuta voluntariamente el "Cierre de sesión / Fin de turno" (Spec 001).
  3. No se borra ante cierres accidentales de la aplicación, bloqueos de pantalla o reinicios del teléfono móvil.
- **Alternativas descartadas:**
  - *Caché perpetuo sin expiración:* Descartada porque datos comerciales (promedios de consumo, estados de cuenta) pueden actualizarse en el sistema de la oficina mes a mes.
  - *Caché únicamente en memoria RAM:* Descartada porque si el sistema operativo cierra la app por memoria en segundo plano, el técnico perdería los datos descargados y gastaría red innecesariamente.
- **Impacto:** Afecta a RF-3, RF-4, almacenamiento de caché de medidores.

## D3: Manejo de flujo sin señal y sin datos en caché
- **Contexto:** El técnico llega a un predio en una zona sin cobertura celular o en quebrada y no ha consultado antes ese medidor (no existe en caché local). HU-002 y R4 exigen que el técnico no se detenga y pueda avanzar a registrar la lectura para ese código válido.
- **Decisión acordada:**
  1. Si se detecta "Sin señal" (o falla la conexión) y el medidor con formato válido `MED-XXXXXX` no está en caché, la pantalla no bloquea al usuario con un error impeditivo.
  2. La pantalla muestra una advertencia informativa clara: *"Sin conexión y sin datos en memoria de jornada. Los datos de cuenta y lectura anterior quedan pendientes de contrastar"*.
  3. Se habilita un botón explícito de acción: **"Continuar a captura sin datos previos"**, el cual permite transicionar al flujo de captura (HU-003/HU-004) pasando el código de medidor validado y una bandera indicando que la lectura se registrará como pendiente de verificar.
- **Alternativas descartadas:**
  - *Bloquear la pantalla e impedir registrar lecturas si no se puede consultar la oficina:* Descartada porque viola el principio cardinal de operación sin conexión (offline-first) y detendría el recorrido del técnico en terreno.
- **Impacto:** Afecta a RF-6, Casos límite.

## D4: Aplicación y visualización del bloqueo por duplicidad mensual (R10)
- **Contexto:** La regla R10 establece que no se permite registrar dos veces el mismo medidor en el mismo mes calendario en curso. La pantalla de consulta debe verificar si el medidor ya fue registrado o enviado durante el mes actual.
- **Decisión acordada:**
  1. Antes de habilitar la acción de nueva captura para un medidor consultado, el sistema comprueba contra los registros locales (pendientes o enviados) y los datos de oficina si el medidor ya cuenta con una lectura en el mes y año en curso.
  2. Si ya existe un registro en el mes actual:
     - Si la lectura aún no ha sido enviada (está pendiente en el dispositivo según HU-004), se muestra una alerta: *"Este medidor ya tiene una lectura registrada en este mes"* y se ofrece un acceso directo para **"Ver / Editar lectura pendiente"** (redirigiendo al alcance de HU-004). Se bloquea la creación de un nuevo registro duplicado.
     - Si la lectura ya fue enviada a la oficina, se muestra un mensaje bloqueante: *"Lectura mensual completada y enviada a oficina. No es posible registrar un nuevo valor este mes"*, impidiendo cualquier acción de registro nuevo o modificación.
- **Alternativas descartadas:**
  - *Permitir registrar y sobreescribir silenciosamente la lectura anterior:* Descartada porque provocaría inconsistencias de auditoría y violaría la regla de inmutabilidad R10.
  - *Verificar la unicidad únicamente al momento de sincronizar al final del día:* Descartada porque permitiría al técnico perder tiempo en campo registrando lecturas que luego serán rechazadas por duplicidad.
- **Impacto:** Afecta a RF-5, Casos límite.
