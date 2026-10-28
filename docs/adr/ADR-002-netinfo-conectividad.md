# ADR-002: Usar NetInfo para monitoreo de conectividad a la red en tiempo real

## Estado
Aceptado

## Fecha
2026-10-27

## Requisitos relacionados
RF-5, RF-7; RNF-1, RNF-4.

## Contexto
Los técnicos de campo de la EPMAPS operan en diversas zonas geográficas del Distrito Metropolitano de Quito con coberturas celulares fluctuantes (valles, quebradas, subsuelos). La aplicación debe mostrar permanentemente en la barra de estado global si el dispositivo se encuentra "Con señal" o "Sin señal", reaccionando a los cambios de conectividad con latencia mínima (< 500 ms) sin drenar la batería del dispositivo ni consumir el plan de datos corporativo con peticiones repetitivas innecesarias.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **`@react-native-community/netinfo`** | • Estándar de la comunidad React Native y soportado oficialmente en el ecosistema Expo.<br>• Escucha directa y reactiva a los eventos nativos del sistema operativo (`ConnectivityManager` en Android / `NWPathMonitor` en iOS).<br>• Cero consumo innecesario de batería al no realizar llamadas de red activas.<br>• Actualización instantánea (< 500 ms) ante cambios físicos de red o modo avión.<br>• Fácil de mockear en pruebas automatizadas de Jest. | • Requiere módulo nativo puenteado (soportado nativamente en Expo Go y prebuilds). |
| **Sondeo periódico vía peticiones HTTP (`fetch` heartbeat)** | • No requiere dependencias nativas adicionales en el bundle. | • Drena la batería del móvil al despertar continuamente el chip de radio en campo.<br>• Consume megas del plan de datos del técnico.<br>• Introduce latencia alta dependiente del intervalo del temporizador.<br>• Confunde caídas del servidor con falta de señal en el dispositivo (falsos negativos). |
| **API Web `navigator.onLine`** | • Nativo en entornos de navegador web estándar. | • En React Native móvil no es un estándar confiable del sistema operativo.<br>• Propenso a falsos positivos (reporta `true` si hay interfaz de red activa aunque no exista salida a internet).<br>• No provee suscripción reactiva robusta a eventos nativos de hardware móvil. |

## Decisión
Se decide utilizar **`@react-native-community/netinfo`** encapsulado detrás de la interfaz desacoplada `INetworkStatusService`. Es la solución nativa, reactiva y eficiente a nivel de consumo energético requerida para la operación de campo.

## Consecuencias
- **Lo que gana el proyecto:** Monitoreo reactivo en tiempo real con latencia inferior a 500 ms, sin consumo adicional de batería ni transferencia de datos móviles durante la jornada.
- **Lo que pierde o arriesga (desventaja obligatoria):** Dependencia de una librería nativa adicional que debe mockearse explícitamente en el arnés de pruebas unitarias de Jest para simular transiciones de estado online/offline.
- **Obligaciones creadas en el código:** Diseñar la interfaz `INetworkStatusService` en la capa de storage/servicios para que la lógica de presentación (`useGlobalStatusController`) no dependa directamente del módulo `@react-native-community/netinfo`, facilitando pruebas y portabilidad.

## Verificación
- En `package.json` debe constar `@react-native-community/netinfo`.
- La prueba unitaria `src/presentation/session/__tests__/useGlobalStatusController.test.ts` debe verificar el cambio inmediato a "Sin señal" y "Con señal" al simular eventos del servicio.

## Uso de IA
Me presento las 3 opciones presentadas al inicio cómo sugerencia, las cuales dos no tenia conocimiento en realidad, pero despues de ir comparando eh indagando un poco más en ellas,  se decidio por netinfo, la opcion B genera alertas cada cierto tiempo al servidor lo cual era gasto de datos y falsos negativos, la opcion C no es confiable en react native, entonces se eligio netinfo por su simplicidad y eficiencia en este caso.
