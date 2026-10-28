# Registro de Decisiones – Spec 005

## D1: Mecanismo de sincronización reactiva y manual bajo demanda
- **Contexto:** En el marco de HU-005 (R9), la entrega de lecturas a la oficina central debe ejecutarse de forma transparente y sin fricción cuando el dispositivo cuente con conexión a internet, pero también permitir al técnico forzar la sincronización voluntariamente si lo desea.
- **Decisión acordada:**
  1. **Disparador reactivo automático:** El sistema escucha los eventos de conectividad de red. En el instante exacto en que el estado de la conexión transiciona de "sin señal" a "con señal", y existan lecturas elegibles para envío, el motor de sincronización inicia automáticamente el ciclo de verificación y transmisión en segundo plano.
  2. **Disparador manual bajo demanda:** En la bandeja de lecturas locales se dispone de un botón visible ("Sincronizar ahora" / "Enviar pendientes") que permite al técnico disparar manualmente el proceso cuando tenga conexión activa.
  3. **Control de concurrencia (Mutex/Bloqueo en vuelo):** Se garantiza que solo exista un ciclo de sincronización en ejecución simultánea. Si se dispara un evento automático mientras hay un envío en curso, o si el técnico presiona el botón repetidamente, las solicitudes redundantes se ignoran de forma segura para evitar condiciones de carrera.
- **Alternativas descartadas:**
  - *Depender únicamente de un botón manual:* Descartado porque incumple la narrativa y el requerimiento de R9 ("se envían solas sin tener que presionar botones").
  - *Sondeo por intervalo fijo (polling cada X segundos):* Descartado para ahorrar batería y datos móviles; es preferible reaccionar al cambio real de estado de red reportado por el sistema.
- **Impacto:** Afecta a RF-1, RF-2, RF-3 y RF-4 de la spec.

---

## D2: Reglas de verificación diferida y retención por anomalía descubierta
- **Contexto:** Según R4, cuando una lectura fue capturada sin señal ni datos previos en caché, se guardó localmente como "Pendiente de verificar". Al recuperar la conexión, la aplicación debe cotejarla con los datos frescos del medidor en la oficina central.
- **Decisión acordada:**
  1. **Fase de cotejo previo:** Antes de enviar el registro a la oficina comercial, el sistema descarga la ficha del medidor (última lectura y consumo promedio histórico).
  2. **Caso 1: Consumo normal o ya conforme:** Si la lectura actual frente a la anterior arroja un consumo $\le 3\times$ el promedio mensual, o si la lectura ya contaba con fotografía y confirmación física desde su captura, la lectura se valida automáticamente y se promueve a "Pendiente de enviar", procediendo de inmediato a su transmisión remota.
  3. **Caso 2: Consumo anómalo sin respaldo (> 3x):** Si el consumo calculado supera el triple ($> 3\times$) del promedio mensual y la lectura carece de fotografía o de confirmación expresa del técnico:
     - El sistema **detiene de inmediato el envío automático** de esa lectura específica (no bloquea el envío de las demás lecturas normales de la cola).
     - La lectura transiciona al estado operativo **"Requiere atención"** (o "Pendiente de revisión").
     - Se genera una alerta visible en la bandeja y barra de estado notificando al técnico que dicho medidor presentó un consumo imprevisto.
     - El técnico debe abrir la lectura en modo edición (HU-004) para confirmar físicamente el valor, registrar el motivo o capturar la fotografía obligatoria exigida por R6/R7 antes de que pueda ser enviada.
- **Alternativas descartadas:**
  - *Enviar la lectura anómala sin foto y marcarla en el backend:* Descartado porque viola la regla de auditoría de agua de R6/R7 que exige foto y confirmación previa obligatoria antes de asentar consumos anómalos.
  - *Detener toda la sincronización de todas las demás lecturas por una sola lectura anómala:* Descartado; la retención es a nivel de ítem individual (aislamiento de fallos), permitiendo que las lecturas conformes sigan sincronizándose.
- **Impacto:** Afecta a RF-5, RF-6, RF-7, RF-8 y RF-9 de la spec.

---

## D3: Estrategia de idempotencia y sincronización directa en una sola fase
- **Contexto:** En terreno, la cobertura celular presenta microcortes frecuentes. El reintento de envío no debe duplicar registros (R9 y R10), y la transmisión debe ser directa hacia la API de oficina (/lecturas en MockAPI), conservando la referencia local del archivo de foto (según R7) sin requerir subidas intermedias a servicios externos de imágenes.
- **Decisión acordada:**
  1. **Identificador único e invariable de captura (`clientReadingId` / `id`):** Cada lectura generada en el terminal posee un identificador único unívoco inmutable asignado en el momento exacto de su captura física.
  2. **Transmisión de clave de idempotencia:** Toda petición de envío remitida a la API central incluye explícitamente dicho identificador. El sistema receptor (backend o MockAPI) utiliza esta clave para identificar recepciones duplicadas: si ya existe, no se vuelve a crear.
  3. **Transmisión en una sola fase:** Cuando hay conexión, la lectura consolidada se envía directamente al recurso `/lecturas` de la oficina. En el payload, la fotografía se referencia unívocamente mediante la URI/identificador del archivo local persistido en el terminal móvil (según R7).
  4. **Atomicidad y actualización de estado:** La lectura solo pasa al estado "Enviada" y se descuenta del contador de pendientes una vez que el terminal recibe la confirmación positiva (código 200/201) de la oficina. Al enviarse todas las lecturas pendientes, el contador global se actualiza de inmediato a "0 pendientes".
- **Alternativas descartadas:**
  - *Subida obligatoria de fotos a servicios externos de hosting (Cloudinary/ImgBB):* Descartada por decisión explícita del usuario para simplificar la arquitectura, manteniendo el principio R7 de conservación local de la evidencia en el dispositivo.
  - *Generar un nuevo ID en cada intento de retransmisión:* Descartado porque causaría duplicación garantizada ante microcortes.
- **Impacto:** Afecta a RF-10, RF-11, RF-12, RF-13 y RF-14 de la spec.
