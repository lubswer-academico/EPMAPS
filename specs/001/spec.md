# Spec 001 - Inicio de sesión del técnico y barra de estado global

Estado: aprobada
HU de origen: docs/historias/HU-001.md

## Contexto y objetivo
Proporcionar al técnico de campo de la EPMAPS un mecanismo de identificación al comenzar su jornada laboral, garantizando la persistencia de su sesión durante todo el recorrido operativo sin requerir reingreso de credenciales tras cierres accidentales o bloqueos de pantalla. Asimismo, dotar a la aplicación de una barra de estado global visible en todas las pantallas operativas que informe en tiempo real el estado de conectividad a la red y el conteo exacto de lecturas guardadas localmente pendientes de transmisión.

## Usuarios
- **Técnico de campo:** Responsable de la toma de lecturas de medidores de agua potable en los predios asignados en el Distrito Metropolitano de Quito.

## Historias de usuario
- **HU-001:** Inicio de sesión del técnico y barra de estado global.

## Definiciones
- **Código de empleado:** Identificador alfanumérico único asignado al técnico de campo por la EPMAPS.
- **Sesión activa:** Estado del sistema en el cual la identidad del técnico se encuentra persistida y validada localmente, habilitando el acceso a las funciones operativas de la aplicación.
- **Barra de estado global:** Componente visual persistente presente en todas las vistas operativas que refleja la disponibilidad de red y las lecturas pendientes de sincronización.
- **Lectura pendiente:** Registro de lectura almacenado en la persistencia local del dispositivo que aún no ha sido confirmado como enviado a los sistemas centrales.

## Requisitos funcionales (EARS)
- RF-1: CUANDO el técnico ingresa un código de empleado y clave válidos y confirma la acción, EL SISTEMA inicia la sesión, guarda la identidad del técnico en almacenamiento persistente y navega a la pantalla operativa principal. Origen: HU-001, escenario 1 y Decisión D1.
- RF-2: SI el técnico ingresa credenciales incorrectas o deja campos vacíos, ENTONCES EL SISTEMA deniega el acceso y muestra un mensaje de error descriptivo en la pantalla de identificación sin persistir ninguna sesión. Origen: HU-001, escenario 2 y Decisión D4.
- RF-3: CUANDO se inicia la aplicación y existe una sesión activa persistida previamente, EL SISTEMA presenta de forma directa la vista operativa principal sin solicitar nuevamente credenciales. Origen: HU-001, escenario 3 y Decisión D2.
- RF-4: CUANDO el técnico selecciona la opción de cerrar sesión en la aplicación, EL SISTEMA elimina la sesión activa del almacenamiento persistente y redirige de inmediato a la pantalla de identificación. Origen: HU-001, escenario 4 y Decisión D2.
- RF-5: MIENTRAS el técnico navega por cualquier pantalla operativa, EL SISTEMA muestra permanentemente el estado actual de la conexión ("Con señal" o "Sin señal"). Origen: HU-001, escenario 5 y Decisión D3.
- RF-6: MIENTRAS el técnico navega por cualquier pantalla operativa, EL SISTEMA muestra permanentemente el número exacto de lecturas pendientes de envío acumuladas localmente. Origen: HU-001, escenario 5 y Decisión D3.
- RF-7: CUANDO se produce un cambio en la conectividad del dispositivo o en la cantidad de lecturas pendientes en el almacenamiento local, EL SISTEMA actualiza inmediatamente los indicadores de la barra de estado global en la pantalla activa. Origen: HU-001, escenario 5 y Decisión D3.

## Requisitos no funcionales
- RNF-1: **Operación sin conexión obligatoria (Offline-first):** La validación de credenciales y el acceso a las pantallas operativas deben funcionar sin requerir conexión a internet.
- RNF-2: **Persistencia de sesión tolerante a reinicios:** La sesión del técnico debe conservarse de manera íntegra ante el cierre forzado de la app, suspensión en segundo plano o reinicio del dispositivo móvil.
- RNF-3: **Accesibilidad y ergonomía táctil:** Todos los botones de acción (inicio de sesión, cierre de sesión) deben cumplir un área táctil mínima de 48x48 pt conforme a la normativa de diseño del proyecto.
- RNF-4: **Latencia de actualización visual:** El cambio en el indicador de conectividad o en el contador de lecturas pendientes debe reflejarse en la barra de estado global en un tiempo inferior a 500 ms tras el evento de cambio.
- RNF-5: **Idioma y claridad:** Todos los textos, etiquetas e indicaciones visibles en pantalla deben estar redactados en español claro y conciso adaptado a técnicos de campo.

## Casos límite
- **Inicio de app sin red y sin sesión previa:** El técnico puede iniciar sesión normalmente siempre que ingrese credenciales válidas registradas en el catálogo local.
- **Espacios accidentales en campos:** Los espacios en blanco al inicio o al final del código de empleado no invalidan el código si este coincide tras ser recortado.
- **Cierre inesperado de la aplicación durante la jornada:** Al reabrir, el técnico se mantiene autenticado y ve su barra de estado con la cantidad exacta de lecturas que quedaron registradas.
- **Dispositivo en modo avión o pérdida súbita de cobertura:** La barra de estado pasa de inmediato a "Sin señal" sin bloquear la navegación ni las acciones del usuario.
- **Cero lecturas pendientes:** La barra muestra explícitamente "0 pendientes" para brindar tranquilidad de que todo está sincronizado o no hay cola de trabajo pendiente.

## Fuera de alcance
- La búsqueda y consulta de medidores por código `MED-XXXXXX` queda fuera de esta spec. Origen: pertenece a HU-002.
- El formulario de registro de lecturas, validación de anomalías (> 3x promedio) y captura de fotos queda fuera de esta spec. Origen: pertenece a HU-003.
- La recuperación de borradores multipantalla incompletos queda fuera de esta spec. Origen: pertenece a HU-003.
- El listado, detalle y edición de lecturas locales pendientes queda fuera de esta spec. Origen: pertenece a HU-004.
- El motor de transmisión automática en segundo plano y verificación diferida queda fuera de esta spec. Origen: pertenece a HU-005.
- La subida de fotografías a almacenamiento externo y obtención de URLs públicas queda fuera de esta spec. Origen: pertenece a HU-005.
- La administración o registro dinámico de nuevos usuarios y cambio de contraseña quedan fuera de esta spec. Origen: no forma parte del alcance MVP definido en R1.

## Criterios de finalización
- Documento `decisiones.md` con las decisiones D1 a D4 registradas y fundamentadas.
- Documento `spec.md` redactado en sintaxis EARS, sin código ni mención de tecnologías concretas, con fronteras blindadas.
- Aprobación explícita del usuario (`Estado: aprobada`) para dar paso a la fase técnica `sdd-plan`.

## Dudas abiertas
- Ninguna pendiente.
