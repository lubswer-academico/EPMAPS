# Registro de Decisiones – Spec 001

## D1: Validación y almacenamiento de credenciales predefinidas
- **Contexto:** HU-001 estipula que en esta versión no existe módulo de administración de usuarios ni creación dinámica de cuentas, sino credenciales predefinidas. Es necesario definir cómo se estructuran y validan sin acoplarse a servicios de backend inexistentes para autenticación.
- **Decisión acordada:** La validación de credenciales se realiza de forma local/offline mediante una lista predefinida de técnicos autorizados (código de empleado en formato alfanumérico limpio y su respectiva clave). No se requiere conexión a internet para iniciar sesión en el dispositivo si las credenciales coinciden con las autorizadas.
- **Alternativas descartadas:**
  - *Autenticación remota por API en cada inicio de sesión:* Descartada porque viola el principio de operación sin conexión (offline-first) cuando el técnico inicia su jornada en zonas sin cobertura o con cortes de señal.
- **Impacto:** Afecta a RF-1, RF-2 y los casos de prueba de dominio de credenciales.

## D2: Mecanismo de persistencia de sesión activa y cierre de sesión
- **Contexto:** HU-001 requiere que la app recuerde la sesión del técnico aunque se cierre y vuelva a abrir, hasta que decida cerrarla explícitamente. Se debe definir qué constituye la sesión activa y cómo se gestiona el cierre voluntario.
- **Decisión acordada:** La sesión activa almacena la identidad del técnico autenticado (código de empleado y nombre/identificador asociado). Al abrir la app, si existe una sesión activa persistida, se accede directamente a la vista operativa principal. Al presionar "Cerrar sesión", se elimina la sesión activa del almacenamiento persistente y se retorna de inmediato a la pantalla de identificación.
- **Alternativas descartadas:**
  - *Expiración automática por inactividad o temporizador corto:* Descartada porque el técnico trabaja jornadas continuas en campo donde los bloqueos de pantalla son frecuentes y la expiración generaría fricción operativa innecesaria.
- **Impacto:** Afecta a RF-1, RF-3, RF-4.

## D3: Definición y visibilidad de los indicadores de la barra de estado global
- **Contexto:** HU-001 y los requisitos R1 y R9 solicitan visibilidad constante en todas las pantallas operativas de dos estados: conectividad (con señal / sin señal) y cantidad de lecturas pendientes por enviar.
- **Decisión acordada:** La barra de estado global se ubica de manera fija y permanente en la parte superior o inferior de todas las pantallas operativas (fuera de la pantalla de identificación previa al acceso). Muestra:
  1. Indicador textual/icónico de conectividad: "Con señal" (cuando el dispositivo tiene acceso a red) o "Sin señal" (cuando está desconectado).
  2. Contador numérico de lecturas pendientes: Muestra el total de lecturas almacenadas localmente que aún no han sido transmitidas a la oficina. Si no hay lecturas acumuladas, muestra "0 pendientes".
- **Alternativas descartadas:**
  - *Mostrar la barra también en la pantalla de inicio de sesión:* Descartada porque el técnico aún no se ha identificado y las lecturas pendientes corresponden a la operativa de trabajo.
  - *Ocultar el contador cuando sea cero:* Descartada porque el técnico necesita la certeza explícita de que su bandeja está al día ("0 pendientes").
- **Impacto:** Afecta a RF-5, RF-6, RF-7.

## D4: Comportamiento ante intentos de acceso con campos vacíos o espacios en blanco
- **Contexto:** Es común que en terreno se ingresen espacios accidentales al inicio o fin del código de empleado o clave.
- **Decisión acordada:** El sistema recortará espacios en blanco en los extremos del código de empleado. Si cualquiera de los dos campos (código o clave) queda vacío tras recortar espacios, se rechaza la autenticación indicando específicamente que los campos son obligatorios, sin alterar el estado del sistema.
- **Alternativas descartadas:**
  - *Permitir enviar campos vacíos a evaluación de credenciales:* Descartada para ofrecer retroalimentación inmediata sin procesar cadenas vacías.
- **Impacto:** Afecta a RF-2.
