# ADR-006: Usar expo-file-system para almacenamiento duradero de fotografías en disco local

## Estado
Aceptado

## Fecha
2026-10-28

## Requisitos relacionados
RF-12, RF-13, RF-15; RNF-1, RNF-2, RNF-3.

## Contexto
En la toma de lecturas en campo de la EPMAPS, las fotografías capturadas como evidencia de averías o de consumos anómalos deben conservarse de manera persistente en el dispositivo móvil durante días o semanas hasta que el técnico retorne a una zona con cobertura o se complete la sincronización remota (HU-005). La cámara del sistema operativo genera inicialmente archivos en el directorio de caché temporal (`cacheDirectory`), el cual está expuesto a purgas automáticas impredecibles por parte del sistema operativo (Android / iOS) en escenarios de baja memoria o reinicio. Se requiere un mecanismo para resguardar físicamente los archivos binarios de imagen en un directorio permanente y seguro, desvinculando la persistencia física del archivo del almacenamiento lógico estructurado.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **`expo-file-system`** | • Estándar oficial mantenido por Expo para operaciones seguras en el sistema de archivos del dispositivo.<br>• Acceso directo al directorio permanente de documentos (`FileSystem.documentDirectory`), protegido frente a purgas automáticas del sistema operativo.<br>• Operaciones asíncronas y atómicas para copiar (`copyAsync`), verificar existencia (`getInfoAsync`) y eliminar (`deleteAsync`) archivos huérfanos de fotos.<br>• Mantiene AsyncStorage liviano, almacenando únicamente la ruta o URI permanente en texto plano. | • Introduce un módulo nativo que incrementa ligeramente el tamaño final del binario (APK) y exige mockeo explícito en pruebas unitarias de Jest (`jest.mock('expo-file-system')`). |
| **Codificación en Base64 dentro de AsyncStorage** | • No requiere paquetes nativos adicionales de sistema de archivos; la imagen viaja incrustada como cadena de texto dentro del registro JSON de la lectura. | • Incrementa el tamaño de la imagen en un 33% (un archivo de 1 MB se convierte en ~1.33 MB de texto).<br>• AsyncStorage tiene límites estrictos de memoria por entrada (CursorWindow en Android limitado típicamente a 2 MB); serializar múltiples imágenes satura la memoria del hilo principal y provoca cierres no controlados por `OutOfMemoryError` en terminales de campo de gama media/baja. |
| **Retención directa de URI temporal de cámara** | • Cero dependencias adicionales y cero operaciones de copiado. | • **Inadmisible:** Los directorios temporales de caché son purgados automáticamente por el sistema operativo en situaciones de escasez de almacenamiento o reinicios, provocando pérdida definitiva de la evidencia fotográfica antes de su envío a oficina (violando RF-12 y RNF-2). |

## Decisión
Se decide adoptar **`expo-file-system`** para gestionar la persistencia física duradera de las fotografías de medidores en el directorio permanente de la aplicación (`FileSystem.documentDirectory + 'epmaps_photos/'`), almacenando en AsyncStorage únicamente la referencia (URI duradera) dentro del objeto de lectura.

## Consecuencias
- **Lo que gana el proyecto:** Integridad y durabilidad garantizada de las fotografías en campo durante días o semanas sin conexión a internet, previniendo saturación de memoria en AsyncStorage y desvinculando datos estructurados de archivos binarios pesados.
- **Lo que pierde o arriesga (desventaja obligatoria):** Añade un módulo nativo al proyecto que debe sincronizarse en las actualizaciones de Expo y mockearse en las suites de Jest para simular operaciones de disco.
- **Obligaciones creadas en el código:** Diseñar un servicio de persistencia de archivos (`photoStorageService.ts`) que cree el subdirectorio dedicado si no existe, copie la imagen temporal al directorio permanente con un nombre normalizado (`MED-XXXXXX_timestamp.jpg`), y provea métodos para purgar físicamente imágenes huérfanas al descartar borradores o sustituir fotos.

## Verificación
- En `package.json` debe constar la dependencia `expo-file-system`.
- El servicio `src/services/photo/photoStorageService.ts` debe copiar exitosamente archivos al directorio de documentos y eliminar fotos huérfanas cuando se descarte un borrador.

## Uso de IA
Me dio 3 opciones, los requerimientos mencionaban que una foto debe ser guardada asi el  usuario pase dias o semanas sin internet, entonces se creyó que guardarlas en el AsyncStorage sería una exelente ocpion pero, esas imagenes convertidad a base64 peesan un  33% más, además si no hay almacenameinto en el dispositivo ese registro es sujeto a eliminarse, siendo los medidores y la foto una prueba la cual es necesaria en el proceso,  se  opta  por la opcion 1 , se considera que una desventaja es que es una libreria nativa, sin embargo ahora mismo el unico trabajando en el proyetco soy yo,  y no  hay una ectualizacion a un SDK superior pensada, por lo que la  desventaja que muestra en la opcion 1 queda sin efecto. Y se decidio por las ventajas que ofrece esa opción. La cual pueda aportar  una solucion a ese inconveniente
