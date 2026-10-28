# ADR-004: Usar Axios como cliente HTTP para comunicación con sistemas remotos

## Estado
Aceptado

## Fecha
2026-10-28

## Requisitos relacionados
RF-3, RF-6 (Spec 002); RNF-1, RNF-4; Preparación para sincronización POST/PUT en HU-004.

## Contexto
La aplicación móvil para los técnicos de campo de la EPMAPS debe comunicarse con los sistemas centrales de oficina (actualmente expuestos vía API REST / MockAPI). En esta etapa se requiere consultar la información técnica y comercial de medidores catastrados (`GET /medidores`), pero la arquitectura global de la solución contempla envíos posteriores de lecturas capturadas en campo, mutaciones de estado, reintentos de red y transmisión estructurada (HU-004). Se requiere un cliente HTTP robusto, con soporte de instancias configuradas, manejo uniforme de tiempos de espera (timeout), serialización/deserialización automática de JSON e interceptores de cabeceras para autenticación y auditoría.

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **`axios`** | • Soporte nativo para instancias preconfiguradas (`axios.create`) con `baseURL`, headers comunes y `timeout`.<br>• Interceptores de peticiones y respuestas para inyectar tokens de seguridad o transformar errores de red de manera centralizada.<br>• Transformación automática y segura de payloads JSON tanto para consultas (GET) como para futuras sincronizaciones (POST/PUT).<br>• Manejo homogéneo de excepciones: rechaza automáticamente promesas ante códigos de estado $\ge 400$, simplificando la captura defensiva de errores. | • Añade una dependencia externa al `package.json` y al bundle de JavaScript.<br>• Requiere mocking explícito en Jest para pruebas unitarias (`jest.mock('axios')`). |
| **API nativa `fetch` (estándar de JavaScript)** | • Cero dependencias adicionales en el bundle.<br>• Integrado nativamente en el runtime de React Native. | • No rechaza promesas en códigos 4xx o 5xx; requiere validación manual repetitiva de `response.ok`.<br>• No soporta instancias configurables ni interceptores de forma nativa, obligando a crear y mantener wrappers personalizados propensos a inconsistencias al escalar a peticiones POST o subida de datos en historias posteriores. |

## Decisión
Se decide adoptar **`axios`** como el cliente HTTP oficial para la comunicación remota con la oficina de EPMAPS. Aunque para la consulta inicial de medidores (HU-002) un `fetch` podría parecer suficiente, la visión panorámica del producto demanda una infraestructura homogénea para el ciclo completo de mutaciones, sincronizaciones transaccionales e interceptores en historias posteriores (HU-004).

## Consecuencias
- **Lo que gana el proyecto:** Cliente HTTP estandarizado, extensible y homogéneo para consultas (GET) y envíos (POST/PUT), con control centralizado de timeouts e interceptores.
- **Lo que pierde o arriesga (desventaja obligatoria):** Incorporación de una librería externa en `package.json` que debe mantenerse actualizada y mockearse en las suites de pruebas de Jest.
- **Obligaciones creadas en el código:** Crear una instancia configurada en `src/services/officeApi.ts` definiendo un tiempo de espera prudencial (`timeout: 10000`) y manejo defensivo de códigos de error de Axios (`error.response?.status === 404`).

## Verificación
- En `package.json` debe figurar la dependencia `axios`.
- La suite de pruebas unitarias `src/services/__tests__/officeApi.test.ts` debe pasar en verde mockeando llamadas exitosas, errores 404 y fallos de conectividad.

## Uso de IA
La IA sugirio fetch cómo primera opcion, sin embargo esta misma necesit de hacer una conversion de Json, además de validar codigos de respuesta en la solicitud, lo cual hacia que el codigo fuera mas verboso y propenso a errores. Axios por su parte menciono que es una libreria pesada y que para un get es algo inecesario, visto de esa forma fetch tiene las de  ganar sin embargo, el proyecto contempla mas solicitudes que solo un Get, entonces axios resulta mejor opcion por temas de alcance del proyecto 
