# Spec 005 - Verificación diferida y sincronización automática sin duplicados

Estado: aprobada
HU de origen: docs/historias/HU-005.md

## Contexto y objetivo
Proporcionar a la aplicación móvil de la EPMAPS el motor de sincronización automática y verificación diferida que culmina el ciclo operativo de toma de lecturas en campo. La especificación formaliza la detección y transmisión reactiva de lecturas al recuperar la señal de red o mediante demanda manual del usuario, la verificación diferida contra la oficina comercial de aquellas lecturas capturadas sin conexión previa, la detención y alerta al técnico ante anomalías de consumo imprevistas, la garantía de idempotencia absoluta mediante identificador único de captura frente a microcortes de enlace, y el despacho directo del registro comercial consolidado en una sola fase hacia el recurso `/lecturas` de la oficina, manteniendo la referencia local de la fotografía según R7.

## Usuarios
- **Técnico de campo:** Operador que realiza la toma de lecturas en terreno y se beneficia de una entrega desatendida, confiable y transparente de sus capturas hacia la oficina central en cuanto recupera señal celular o Wi-Fi, recibiendo alertas inmediatas si alguna lectura offline requiere confirmación física adicional por consumo anómalo.

## Historias de usuario
- **HU-005:** Verificación diferida y sincronización automática sin duplicados.

## Definiciones
- **Sincronización reactiva:** Inicio automático del ciclo de envío desencadenado por la transición de estado de la red de desconectado a conectado, sin requerir intervención táctil del técnico.
- **Verificación diferida:** Proceso mediante el cual una lectura tomada sin señal (en estado "Pendiente de verificar") consulta a los servicios de oficina al recuperar la red para cotejar la lectura actual con la lectura anterior y el consumo promedio histórico del medidor.
- **Estado "Requiere atención":** Condición operativa de una lectura que, al ser verificada diferidamente, presenta un consumo anómalo ($> 3\times$ promedio mensual) y carece de fotografía obligatoria o confirmación del técnico, requiriendo revisión manual in situ antes de autorizarse su envío.
- **Idempotencia:** Propiedad del protocolo de transmisión que asegura que el envío repetido de una misma captura (por reintentos o microcortes de red) produce exactamente el mismo resultado en el sistema receptor que un único envío, sin generar registros duplicados.
- **Identificador unívoco de captura (`clientReadingId` / `id`):** Clave única e inmutable asignada en el momento de crear la lectura en el terminal móvil que identifica de forma universal a la transacción de lectura.

## Requisitos funcionales (EARS)

### Disparadores y control de sincronización
- RF-1: CUANDO el dispositivo móvil recupera la conectividad a internet (transición de sin señal a con señal) y existen lecturas pendientes en la cola local, EL SISTEMA inicia automáticamente el proceso de sincronización en segundo plano. Origen: HU-005, escenario 1 y Decisión D1.
- RF-2: CUANDO el técnico presiona la opción de sincronización manual ("Sincronizar ahora") desde la bandeja de lecturas contando con conexión a internet, EL SISTEMA ejecuta de inmediato el ciclo de sincronización. Origen: Decisión D1.
- RF-3: MIENTRAS se encuentra en ejecución un ciclo de sincronización de lecturas, EL SISTEMA bloquea la ejecución de solicitudes de sincronización concurrentes o redundantes hasta que el ciclo en curso culmine o se detenga. Origen: Decisión D1.
- RF-4: SI el dispositivo pierde la conectividad a internet en medio del proceso de sincronización, ENTONCES EL SISTEMA suspende de forma segura la transmisión en curso, conserva el estado de las lecturas pendientes y espera el restablecimiento de la conexión. Origen: HU-005, escenario 2 y Decisión D1.

### Verificación diferida de lecturas capturadas sin señal
- RF-5: CUANDO se inicia la sincronización de una lectura con estado operativo "Pendiente de verificar", EL SISTEMA consulta primero al sistema central de la oficina para obtener la última lectura registrada y el consumo promedio mensual del medidor. Origen: HU-005, escenario 3 y Decisión D2.
- RF-6: CUANDO los datos del medidor son obtenidos y el consumo calculado ($\text{lectura actual} - \text{lectura anterior}$) es menor o igual al triple ($\le 3\times$) del consumo promedio mensual, EL SISTEMA valida automáticamente la lectura, le asigna el consumo correspondiente y la promueve al estado de envío hacia la oficina. Origen: HU-005, escenario 3 y Decisión D2.
- RF-7: CUANDO los datos del medidor son obtenidos y el consumo calculado supera el triple ($> 3\times$) del consumo promedio mensual pero la lectura ya contaba previamente con fotografía adjunta y confirmación física, EL SISTEMA valida la lectura y procede con el envío regular. Origen: HU-005, sección 2 y Decisión D2.
- RF-8: SI al cotejar la lectura se detecta un consumo superior al triple ($> 3\times$) del promedio mensual y el registro carece de fotografía o de confirmación de revisión física, ENTONCES EL SISTEMA detiene el envío de dicha lectura, le asigna el estado operativo "Requiere atención" y continúa con la sincronización del resto de lecturas conformes de la cola. Origen: HU-005, escenario 3 y Decisión D2.
- RF-9: CUANDO una lectura pasa al estado "Requiere atención", EL SISTEMA presenta una alerta visual destacada en la bandeja de lecturas y en la barra de estado, exigiendo al técnico que abra el registro para confirmar la inspección física y capturar la fotografía obligatoria antes de autorizar su transmisión. Origen: HU-005, escenario 3, HU-003, escenario 4 y Decisión D2.

### Idempotencia, sincronización directa y consolidación
- RF-10: EL SISTEMA genera y asocia de forma inmutable un identificador único unívoco de captura a cada lectura al momento de ser guardada localmente por primera vez. Origen: HU-005, escenario 2 y Decisión D3.
- RF-11: CUANDO la aplicación transmite una lectura consolidada al sistema central de la oficina (/lecturas), EL SISTEMA incluye obligatoriamente el identificador único de captura como clave de idempotencia y referencia la fotografía mediante la URI o ruta del archivo local persistido en el terminal móvil. Origen: HU-005, escenario 2, Requisito R7 y Decisión D3.
- RF-12: SI una solicitud de envío se interrumpe por microcorte de red antes de recibir la confirmación de la oficina y se reintenta tras reconectar, ENTONCES EL SISTEMA retransmite el registro empleando exactamente el mismo identificador unívoco de captura original, previniendo duplicaciones en el servidor comercial. Origen: HU-005, escenario 2 y Decisión D3.
- RF-13: CUANDO el sistema central de la oficina confirma formalmente la recepción exitosa de la lectura (código 200/201), EL SISTEMA actualiza localmente el estado de la lectura a "Enviada", fija la marca temporal de envío y descuenta en una unidad el contador global de lecturas pendientes de la barra de estado. Origen: HU-005, escenario 1 y Decisión D3.
- RF-14: CUANDO la totalidad de las lecturas pendientes de la jornada han sido verificadas y enviadas con éxito, EL SISTEMA actualiza el contador global de pendientes a "0 pendientes" en todas las pantallas de la aplicación. Origen: HU-005, escenario 1, sección 2 y Decisión D3.

## Requisitos no funcionales
- RNF-1: **Tolerancia a microcortes y resiliencia offline-first:** Ninguna falla de conectividad transitoria durante el envío de datos debe corromper la cola local de lecturas ni provocar pérdida de información.
- RNF-2: **Idempotencia y consistencia en el backend:** El protocolo de comunicación debe ser estrictamente idempotente garantizando cero lecturas duplicadas en la base de datos comercial para un mismo medidor y mes.
- RNF-3: **Eficiencia y economía de datos móviles:** El proceso de verificación diferida y transmisión debe transferir solo los diferenciales estrictamente necesarios, evitando descargas redundantes de medidores ya cacheados.
- RNF-4: **Actualización reactiva de la interfaz:** La transición de estados en la bandeja ("Pendiente de verificar" -> "Pendiente de enviar" -> "Enviada" o "Requiere atención") y el decremento del contador global deben reflejarse de forma inmediata en pantalla sin requerir recargar manualmente la aplicación.
- RNF-5: **Accesibilidad y claridad de mensajes:** Toda advertencia de retención por consumo anómalo, error de enlace o estado de sincronización debe comunicarse en español claro y conciso con áreas interactivas táctiles no menores a 48x48 pt.

## Casos límite
- **Microcorte durante el envío de la lectura a MockAPI:** Si la red se cae mientras se envía la petición, al reconectar el sistema reintenta la llamada usando el mismo `clientReadingId`; si el servidor ya lo había recibido, no duplica el registro y la app actualiza su estado local a "Enviada".
- **Medidor sin historial en la oficina durante verificación diferida:** Si al consultar diferidamente un medidor capturado offline la oficina informa que es una cuenta nueva sin lecturas previas, el sistema no calcula consumo ni anomalía, valida la lectura como conforme y procede a enviarla directamente.
- **Lectura anterior mayor que lectura actual durante verificación diferida:** Si el cotejo diferido revela que la lectura digitada es físicamente menor que la lectura anterior de oficina, el sistema detiene el envío y marca la lectura como "Requiere atención" por incongruencia física para que el técnico verifique la marcación del dial o cambie la condición a dañado.
- **Sincronización manual sin conexión:** Si el técnico pulsa "Sincronizar ahora" mientras el terminal se encuentra sin señal, el sistema presenta un aviso inmediato informando la ausencia de conexión sin alterar el estado de las lecturas ni generar errores bloqueantes.

## Fuera de alcance
- **Subida de fotografías a servidores externos de hosting (Cloudinary/ImgBB) y generación de URLs públicas:** Se descarta expresamente de la arquitectura del proyecto para simplificar la sincronización en una sola fase; las fotografías se conservan de forma permanente en el almacenamiento local del dispositivo (según R7) y se referencian por su URI/identificador local en el payload comercial.
- **Cierre formal del alcance funcional de la versión 1.0 de EPMAPS:** Con la especificación de HU-005 se completan todos los requisitos funcionales del producto (HU-001: Sesión y barra de estado; HU-002: Búsqueda y caché de medidor; HU-003: Captura en pasos, consumo anómalo y fotos; HU-004: Modo offline y edición in situ; HU-005: Sincronización automática, verificación diferida e idempotencia).
- **Procesamiento de facturación y cobro:** La emisión de planillas de agua, cálculos tarifarios por categorías de subsidio o cobros comerciales quedan expresamente fuera de alcance por pertenecer a los sistemas comerciales de la oficina central de la EPMAPS.
- **Gestión administrativa de cuadrillas y asignación de rutas:** La diagramación de rutas geográficas o despacho de órdenes de trabajo en tiempo real queda fuera del alcance de esta versión v1.0.

## Criterios de finalización
- Documento `specs/005/decisiones.md` con las decisiones D1, D2 y D3 acordadas y formalizadas.
- Documento `specs/005/spec.md` redactado en riguroso formato EARS en español, sin nombres de librerías ni código de programación.
- Cobertura completa de los requisitos de HU-005 (R4 diferido, R9 envío automático/idempotente directo en una sola fase y R7 conservación local).
- Aprobación explícita del usuario (`Estado: aprobada`) antes de proseguir a la fase de diseño técnico y contratos en `sdd-plan`.

## Dudas abiertas
- Ninguna pendiente.
