# Contrato de Diseño – Spec 002: Identificación y consulta de medidor con caché de jornada

Documento de transferencia visual y funcional generado por el agente de implementación para el agente de diseño (`sdd-design`). Refleja la arquitectura de componentes y elementos construidos en **obra blanca** en el código fuente.

---

## 1. Vistas y Pantallas (Nivel General)

### 1.1 Pantalla de Búsqueda y Consulta de Medidor
- **Ruta de archivo:** `src/app/meter-search.tsx`
- **Propósito funcional:** Permite al técnico de campo ingresar el código de un medidor (`MED-XXXXXX`), asistiendo en tiempo real con el prefijo canónico y mayúsculas, consultando prioritariamente la memoria de jornada local (caché offline de 24h) o el catastro remoto en oficina (vía MockAPI con Axios cuando hay señal). Expone la ficha técnica y comercial completa con sus 7 campos, y gestiona elegantemente los casos límite de falta de señal (D3) y bloqueo por duplicidad mensual R10 (D4).
- **Estructura general:**
  - Contenedor seguro (`SafeAreaView`) con fondo neutro `#F8F9FA`.
  - Barra de estado global persistente (`GlobalStatusBar`).
  - Cabecera con botón de retroceso (`← Regresar`), título y subtítulo operativo.
  - Tarjeta de formulario con input asistido y botón de consulta.
  - Paneles condicionales de error, advertencia sin señal (D3) o bloqueo por duplicidad mensual (D4).
  - Tarjeta de ficha técnica del medidor (7 campos obligatorios) con insignia de procedencia ("Memoria de Jornada" u "Oficina en Línea").
  - Panel de acción principal para registrar la lectura.

### 1.2 Actualización de Pantalla Operativa Principal (Home)
- **Ruta de archivo:** `src/app/home.tsx`
- **Propósito funcional:** Incorpora el acceso directo táctil prioritario hacia la pantalla de búsqueda de medidor (`/meter-search`).

---

## 2. Secciones y Organismos

### 2.1 Cabecera de Navegación de Búsqueda
- **Ruta de archivo:** `src/app/meter-search.tsx` (bloque `header`)
- **Estructura funcional:** Botón táctil de retroceso (mínimo 48x48 pt), título semántico ("Consulta de Medidor") y descripción en español sobre el código esperado.

### 2.2 Tarjeta de Formulario de Búsqueda
- **Ruta de archivo:** `src/app/meter-search.tsx` (bloque `inputContainer`)
- **Estructura funcional:** Agrupa la etiqueta del campo, el `TextInput` con máscara/asistencia en tiempo real y límite de 10 caracteres, el texto condicional de error de validación y el botón de consulta a la oficina.

### 2.3 Tarjeta de Ficha Técnica / Comercial del Medidor
- **Ruta de archivo:** `src/app/meter-search.tsx` (bloque `recordCard`)
- **Estructura funcional:** Módulo en tarjeta blanca con borde suave que presenta:
  - **Fila de cabecera de ficha:** Código del medidor resaltado en azul (`#0D47A1`) e insignia/badge de procedencia del dato (celeste para "Memoria de Jornada" / verde para "Oficina en Línea").
  - **Línea divisora.**
  - **Cuerpo de datos:** Los 7 campos obligatorios desplegados verticalmente en pares etiqueta-valor alineados.

### 2.4 Panel de Advertencia "Sin Conexión y Sin Datos Previos" (D3)
- **Ruta de archivo:** `src/app/meter-search.tsx` (bloque `warningBox`)
- **Estructura funcional:** Contenedor ámbar suave con título descriptivo, mensaje informativo y botón de contingencia operativa ("Continuar a captura sin datos previos").

### 2.5 Panel de Alerta o Bloqueo por Duplicidad Mensual R10 (D4)
- **Ruta de archivo:** `src/app/meter-search.tsx` (bloque `duplicateBox`)
- **Estructura funcional:** Contenedor de advertencia según el estado:
  - **Si ya fue enviada a oficina:** Fondo rojo suave (`#FEE2E2`), borde carmesí y texto bloqueante estricto.
  - **Si está pendiente local:** Fondo amarillo suave (`#FEF3C7`), borde ámbar y botón secundario "Ver / Editar lectura pendiente".

---

## 3. Componentes y Moléculas

### 3.1 Grupo de Entrada de Código Asistido
- **Etiqueta:** "Código del Medidor" (14pt, seminegrita).
- **Campo de texto:** `TextInput` de altura mínima 48 pt, `maxLength={10}`, mayúsculas forzadas, sin autocorrección.
- **Asistencia en tiempo real:** Autocompleta `MED-` al escribir únicamente números o prefijos continuos sin guion (ej. `100201` -> `MED-100201`).
- **Validación activa:** Borde rojo si el código está incompleto al intentar consultar o si viola la regla `^MED-\d{6}$`.

### 3.2 Desglose de los 7 Campos de la Ficha Técnica
1. **Dirección:** Muestra la dirección catastrada del predio.
2. **Sector:** Nombre del barrio o sector administrativo de Quito.
3. **Nro. Cuenta:** Código oficial de cuenta del abonado (ej. `CTA-884920`).
4. **Estado:** Estado del medidor en mayúsculas (`ACTIVO`, `SUSPENDIDO`, `INACTIVO`) en color verde.
5. **Última Lectura:** Valor numérico en metros cúbicos ($m^3$).
6. **Fecha Últ. Lectura:** Fecha formateada en español (`es-EC`, ej. `15/9/2026`).
7. **Consumo Promedio:** Volumen promedio mensual en $m^3$/mes.

---

## 4. Elementos Atómicos (Nivel Específico)

### 4.1 Botones y Acciones Táctiles

| Elemento | Pantalla / Componente | Evento / Disparador | Estado Habilitado | Estado Deshabilitado | Dimensión Táctil |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Botón "🔍 Buscar Medidor"** | `home.tsx` | Redirige a `/meter-search` | Azul (`#0D47A1`), texto blanco | N/A | Min 48 pt alto x 100% ancho |
| **Botón "← Regresar"** | `meter-search.tsx` | Regresa a la pantalla previa (`router.back()`) | Texto azul (`#0D47A1`), 16pt | N/A | Min 48 pt alto x 48 pt ancho |
| **Botón "Consultar Medidor"** | `meter-search.tsx` | Ejecuta `searchMeter` | Azul (`#0D47A1`), texto blanco | Gris (`#9CA3AF`) o con spinner cuando busca | Min 48 pt alto x 100% ancho |
| **Botón "Continuar sin datos previos"** | `meter-search.tsx` | Ejecuta `proceedToCaptureWithoutData` | Naranja/Ámbar (`#D97706`), texto blanco | N/A | Min 48 pt alto x 100% ancho |
| **Botón "Ver / Editar lectura pendiente"**| `meter-search.tsx` | Redirige a lectura pendiente en `/home` | Naranja (`#D97706`), texto blanco | N/A | Min 48 pt alto x 100% ancho |
| **Botón "Registrar Nueva Lectura"** | `meter-search.tsx` | Inicia flujo de captura (HU-003) | Verde (`#16A34A`), texto blanco en negrita | N/A | Min 48 pt alto x 100% ancho |

### 4.2 Indicadores y Textos de Datos

| Etiqueta / Indicador | Componente | Dato Exacto Mostrado | Formato / Valores Posibles |
| :--- | :--- | :--- | :--- |
| **Insignia de Origen** | `meter-search.tsx` | Origen de la ficha del medidor | `"Memoria de Jornada"` (fondo `#E0F2FE`, texto `#0369A1`) o `"Oficina en Línea"` (fondo `#DCFCE7`, texto `#0369A1`) |
| **Texto de Error de Formato** | `meter-search.tsx` | Mensaje de validación | `"El código debe contener el prefijo MED- seguido de 6 dígitos numéricos."` |
| **Alerta Sin Red (D3)** | `meter-search.tsx` | Mensaje informativo de contingencia | `"Sin conexión y sin datos en memoria de jornada. Los datos de cuenta y lectura anterior quedan pendientes de contrastar."` |
| **Alerta Duplicado Enviado (D4)**| `meter-search.tsx` | Bloqueo absoluto R10 | `"Lectura mensual completada y enviada a oficina. No es posible registrar un nuevo valor este mes."` |
| **Alerta Duplicado Pendiente (D4)**| `meter-search.tsx` | Alerta no bloqueante R10 | `"Este medidor ya tiene una lectura registrada en este mes."` |
