# ADR-005: Usar expo-image-picker para captura fotográfica con cámara nativa

## Estado
Aceptado

## Fecha
2026-10-28

## Requisitos relacionados
RF-10, RF-11, RF-12; RNF-1, RNF-4.

## Contexto
Los técnicos de campo de la EPMAPS deben registrar fotografías de evidencia cuando un medidor se encuentra físicamente dañado o cuando se detecta un consumo mensual anómalo (> 3x el promedio). Con frecuencia, los medidores de agua potable se ubican en nichos oscuros, subsuelos, pozos subterráneos en veredas o áreas con iluminación nula o deficiente. La aplicación debe permitir solicitar permisos de cámara en tiempo de ejecución, invocar la cámara del dispositivo garantizando acceso pleno a los controles de hardware del fabricante (especialmente flash / linterna para iluminar cajas oscuras y enfoque táctil) y retornar la imagen capturada para su respaldo operativo.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **`expo-image-picker` (`launchCameraAsync`)** | • Invoca directamente la aplicación de cámara oficial del fabricante (Samsung, Xiaomi, Motorola, iOS), ofreciendo de forma nativa controles de flash/linterna, zoom y autoenfoque esenciales en cajas subterráneas oscuras.<br>• El técnico utiliza una interfaz familiar con vista previa integrada de aceptación/repetición.<br>• Permite configurar compresión de calidad (`quality: 0.7`) para reducir el peso de las imágenes en almacenamiento local.<br>• Maneja la solicitud de permisos en tiempo de ejecución (`requestCameraPermissionsAsync`) sin complejidad de ciclo de vida.<br>• Máxima simplicidad (KISS) y mantenibilidad oficial en Expo. | • No permite superponer guías gráficas o marcas de agua en vivo sobre el visor de cámara en tiempo real (innecesario para la auditoría de HU-003). |
| **`expo-camera` (`CameraView`)** | • Renderiza un visor embebido personalizado dentro del árbol de componentes de React Native.<br>• Permite diseñar una interfaz de obturador y controles propietarios. | • Requiere programar manualmente la lógica de alternancia de flash/antorcha, balance de blancos y enfoque por coordenadas, propenso a inconsistencias entre diferentes fabricantes de hardware.<br>• Mayor sobrecarga de memoria RAM y consumo de batería en campo.<br>• Mayor complejidad de mocking y configuración en pruebas automatizadas con Jest. |

## Decisión
Se decide adoptar **`expo-image-picker`** para resolver la captura de fotografías en campo. Permite al técnico disponer del flash nativo del dispositivo para medidores con iluminación precaria sin sobrecargar el código de la app con la gestión de visores de cámara complejos.

## Consecuencias
- **Lo que gana el proyecto:** Acceso confiable al flash y enfoque nativos del terminal, interfaz de captura probada por el fabricante del teléfono y código mínimo y mantenible en la capa de presentación.
- **Lo que pierde o arriesga (desventaja obligatoria):** La aplicación cede temporalmente el control visual a la app de cámara del sistema mientras el técnico toma la foto, retornando el resultado tras la captura.
- **Obligaciones creadas en el código:** Encapsular la llamada en un servicio de cámara (`cameraService.ts`) que maneje los permisos en tiempo de ejecución, capture cancelaciones del usuario y configure compresión prudencial (`quality: 0.7`).

## Verificación
- En `package.json` debe constar la dependencia `expo-image-picker`.
- El servicio `src/services/photo/cameraService.ts` debe solicitar permisos y abrir la cámara con opciones de compresión.

## Uso de IA
La IA presento una opcion la cual ya se venia trabajando en clase la cual es image-picker, sin embargo tambien me base en una necesidad clave, que es que los medidores no siempre se encuentran en lugares iluminados, por lo que se debe usar el flash de la camara, por lo que la IA menciono que en ese caso su opcion A era la mejor y la opcion  B que es expo camera, tambien puede ser utilizada pero necesita de más configuraciones, configuraciones los cuales están sujetos a fallos
