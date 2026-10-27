---
name: sdd-adr
description: Diálogo técnico colaborativo para debatir y resolver las Decisiones ADR del plan, generando los documentos en docs/adr/ y extendiendo plan.md con la librería y comando acordados.
---

# SDD - Registro de Decisiones de Arquitectura (`/sdd-adr`)

## Uso
`/sdd-adr <NNN-nombre>`  
*(Ejemplo: `/sdd-adr 001-autenticacion`)*

---

## 1. Filosofía y Dinámica de Trabajo

Este comando **NO es un generador automático a ciegas**. Funciona como una **conversación técnica abierta y consultiva entre colegas de desarrollo**.

El agente y el usuario analizan juntos el problema técnico para evaluar alternativas viables. La decisión final, las ventajas, las desventajas y los riesgos aceptados se acuerdan mediante el diálogo, y solo tras ese acuerdo se genera el documento y se extiende el plan.

---

## 2. Reglas Estrictas del Estándar ADR

1. **Un solo ADR por decisión:** Cada archivo resuelve un único problema técnico (`docs/adr/ADR-00X-titulo-corto.md`). Si una librería resuelve dos temas, se justifica en el principal y se referencia en el otro.
2. **Justificación de dependencias:** Toda librería o paquete que se instale en el proyecto debe estar justificada en un ADR previo.
3. **Título como afirmación:** El título afirma directamente lo que se decidió (ej. `ADR-001: Usar AsyncStorage para persistencia local`, nunca como pregunta ni tema).
4. **Contexto sin anticipar la solución:** La sección Contexto describe el problema y sus condiciones límite (falta de red, volumen de datos, etc.) sin mencionar aún la herramienta elegida.
5. **Mínimo dos alternativas reales:** Tabla comparativa obligatoria (`Alternativa` | `Ventajas en este proyecto` | `Desventajas en este proyecto`). Prohibido copiar ventajas genéricas de marketing ("es rápida y fácil"); deben ser ventajas aplicadas a este proyecto específico.
6. **Al menos una desventaja o riesgo obligatorio:** Toda decisión técnica tiene un costo. La sección Consecuencias debe reflejar qué se pierde, arriesga o qué obligaciones impone.
7. **No usar librería también es un ADR:** Si se concluye que el problema se resuelve con herramientas nativas de la plataforma o del lenguaje, se registra igualmente con las alternativas externas descartadas.
8. **Inmutabilidad:** Un ADR aceptado no se edita. Si más adelante se cambia de opinión, se redacta uno nuevo y el anterior pasa a `Estado: Reemplazado por ADR-00Y`.
9. **Campo `## Uso de IA` reservado al usuario:** La IA **NUNCA** redacta esta sección. Se deja la plantilla para que el usuario humano escriba con sus propias palabras qué le consultó a la IA y qué aceptó o descartó (evidencia requerida para la defensa técnica oral).

---

## 3. Protocolo de Ejecución de la Conversación

### Paso 1: Mapeo del Contexto
Al recibir `/sdd-adr <NNN>`:
1. Lee **todas las Historias de Usuario** en `docs/historias/` para tener visión global del producto y no recomendar herramientas que choquen con historias futuras.
2. Abre `specs/<id-spec>/plan.md` y revisa la sección `# Decisiones ADR`.
3. Identifica cuál es la primera necesidad técnica pendiente por resolver (ej. `ADR-REQ-01`).

### Paso 2: Debate Técnico en el Chat (Pair Discussion)
- **No generes el archivo de golpe.**
- Inicia una conversación cercana y profesional en el chat, exponiendo el problema y 2 o 3 alternativas reales con sus pros y contras para este proyecto:
  > *"Hola, revisando el plan tenemos pendiente resolver la necesidad `ADR-REQ-01` ([descripción del problema]). Para este caso específico veo estas opciones principales: [Opción A] y [Opción B]. [Breve análisis de ventajas/desventajas reales]. ¿Qué opinas tú? ¿Hay alguna restricción o preferencia técnica que debamos priorizar?"*
- Espera la respuesta del usuario y conversa hasta consensuar la decisión.

### Paso 3: Redacción del Archivo en `docs/adr/`
Una vez acordada la decisión, redacta `docs/adr/ADR-00X-titulo-corto.md` siguiendo la plantilla oficial.

### Paso 4: Extensión en `specs/<id-spec>/plan.md`
Sin modificar ni borrar el texto existente de esa necesidad en el plan, **extiende** la entrada con los datos acordados:
```markdown
- **Se va a utilizar:** [Nombre de la librería o herramienta acordada].
- **Trazabilidad:** Resuelto en docs/adr/ADR-00X-titulo-corto.md.
- **Comando de instalación:** `[comando exacto de instalación]` (especificando si se instala solo un paquete o módulo puntual).
```

### Paso 5: Siguiente Decisión
Pregunta al usuario si desea continuar con la siguiente necesidad ADR del plan (`ADR-REQ-02`) o pausar la sesión.

---

## 4. Plantilla Oficial de ADR (`docs/adr/ADR-00X-titulo-corto.md`)

```markdown
# ADR-00X: [La decisión, escrita como afirmación directa]

## Estado
Aceptado

## Fecha
[Fecha en que se acordó la decisión: AAAA-MM-DD]

## Requisitos relacionados
[Requisitos funcionales o no funcionales que ayuda a cumplir, ej: RF-08, RF-15; RNF-03]

## Contexto
[Describa el problema concreto que obliga a tomar la decisión y las condiciones que limitan la solución: ausencia de red, volumen de datos, rendimiento, etc., sin mencionar todavía la solución elegida].

## Alternativas consideradas

| Alternativa | Ventajas en este proyecto | Desventajas en este proyecto |
| :--- | :--- | :--- |
| **[Opción A]** | [Ventajas concretas para este problema] | [Desventajas, costos o limitaciones reales] |
| **[Opción B]** | [Ventajas concretas para este problema] | [Desventajas, costos o limitaciones reales] |

## Decisión
[Qué se eligió y el argumento principal de peso].

## Consecuencias
- **Lo que gana el proyecto:** [Beneficios directos obtenidos].
- **Lo que pierde o arriesga (desventaja obligatoria):** [Costo técnico, limitaciones o riesgos asumidos].
- **Obligaciones creadas en el código:** [Buenas prácticas, contratos o configuraciones que exige implementar].

## Verificación
- [Qué archivo revisar, qué prueba ejecutar o qué comportamiento observar en la aplicación para comprobar que se respeta la decisión].
- [Qué paquetes deben o no aparecer en package.json].

## Uso de IA
<!-- [SECCIÓN PARA EL USUARIO: Describe qué le consultaste a la IA sobre esta decisión, qué te propuso y qué aceptaste o descartaste de su respuesta y por qué razones técnicas. Completa esta sección con tus propias palabras para tu defensa técnica]. -->
```
