# ADR-001: Usar AsyncStorage para persistencia local de sesión clave-valor

## Estado
Aceptado

## Fecha
2026-10-27

## Requisitos relacionados
RF-1, RF-3, RF-4; RNF-1, RNF-2.

## Contexto
El técnico de campo de la EPMAPS inicia su jornada laboral en la aplicación móvil antes de ingresar a zonas con baja o nula cobertura celular en el Distrito Metropolitano de Quito. La aplicación debe mantener la sesión activa de forma continua y tolerar la suspensión en segundo plano, cierres forzados del sistema operativo o reinicios del dispositivo, sin solicitar nuevamente las credenciales ni requerir conexión a internet para validar el estado de sesión previo. Se requiere un mecanismo de almacenamiento local no volátil para un único registro de datos de sesión estructurados (código, nombre, marca de tiempo).

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **`@react-native-async-storage/async-storage`** | • Estándar probado y mantenido en el ecosistema Expo y React Native.<br>• Ideal y ligero para registros no relacionales tipo clave-valor (JSON plano).<br>• Fácil integración en pruebas unitarias mediante mocks sin configurar motores nativos complejos.<br>• Desacoplado mediante el contrato de interfaz `ISessionStorage`. | • API basada en promesas asíncronas.<br>• No provee capacidades de indexación ni consultas relacionales avanzadas (adecuado para esta entidad, pero no aplicable como base de datos global de rutas). |
| **`expo-secure-store`** | • Cifrado por hardware nativo (Keystore en Android / Keychain en iOS). | • Límite rígido de 2048 bytes por entrada.<br>• Sobrecarga criptográfica innecesaria para datos operativos no bancarios.<br>• Falla de persistencia en terminales móviles de campo que no tengan configurado un patrón o PIN de bloqueo de pantalla. |
| **SQLite (`expo-sqlite`)** | • Motor relacional completo con soporte SQL transaccional. | • Sobreingeniería severa para persistir un solo objeto de sesión sin relaciones complejas.<br>• Introduce fricción de esquemas, migraciones y mayor complejidad en los tests unitarios. |
| **`@tanstack/react-query-persist-client`** | • Excelente para sincronización y mutaciones de caché remota con reintentos. | • Es un gestor de estado de servidor / caché, no un motor de almacenamiento físico en disco (requiere obligatoriamente un persister físico como AsyncStorage).<br>• La sesión del técnico en HU-001 es estado local de jornada offline-first, no una consulta a una API remota. |

## Decisión
Se decide utilizar **`@react-native-async-storage/async-storage`** a través de la interfaz desacoplada `ISessionStorage`. Es la solución más directa, probada y proporcionada para la persistencia no volátil de clave-valor sin introducir la complejidad innecesaria de motores relacionales ni requerir infraestructura de caché remota.

## Consecuencias
- **Lo que gana el proyecto:** Almacenamiento no volátil inmediato, ligero y compatible con Expo, desacoplado de la lógica de dominio mediante interfaz, facilitando el desarrollo y las pruebas TDD con Jest.
- **Lo que pierde o arriesga (desventaja obligatoria):** Las operaciones de lectura y escritura son asíncronas, obligando al controlador de presentación a gestionar un breve estado de carga inicial (`isLoading`) al arrancar la app.
- **Obligaciones creadas en el código:** Se debe implementar un adaptador `AsyncSessionStorage` que implemente `ISessionStorage`, con manejo defensivo de errores (`try/catch`) y parseo seguro de JSON para prevenir excepciones no controladas en caso de datos corruptos.

## Verificación
- En `package.json` debe estar incluido `@react-native-async-storage/async-storage`.
- La prueba unitaria `src/storage/session/__tests__/AsyncSessionStorage.test.ts` debe pasar en verde simulando guardado, recuperación y borrado de sesión.

## Uso de IA
Se creo un agente especializado el cual controla actua como un colega de equipo técnico, me aportó dos opciones que la IA recomendo, contraste su decision en base a mi criterio sugeriendo SQLite pero rapidamente se cambie de opinion al no haber relaciones fuertes entre estos técnicos y además de ser datos quemados, con esto en mente se elijió syncStorage. Cabe aclarar que tambien quedamos en la duda claves que son unicas  y que deben ser ocupadas por un equipo técnico deben  tener seguridad, entonces secureStorage se convierte en una opción muy interesante para estos casos. Sin embargo, para este trabajo el cual no es algo que realmente estará en uso, y es un prototipo, asyncStorage es la mejor opción por su simplicidad y rapidez de implementación. Manejando este proyecto cómo un MVP por asi decirlo. Es importante destacar que si esto fuera un producto real, las opciones 2 y 3 serían las más indicadas para implementar, debido a que la seguridad y el manejo de datos masivos son de suma importancia en estos casos.
