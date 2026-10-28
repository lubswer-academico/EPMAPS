# Contrato de Diseño – Spec 001: Inicio de sesión del técnico y barra de estado global

Documento de transferencia visual y funcional generado por el agente de implementación para el agente de diseño (`sdd-design`). Refleja la arquitectura de componentes y elementos en **obra blanca** construidos en el código.

---

## 1. Vistas y Pantallas (Nivel General)

### 1.1 Pantalla de Redirección Inicial
- **Ruta de archivo:** `src/app/index.tsx`
- **Propósito funcional:** Verificar la existencia de sesión persistida activa en AsyncStorage. Mientras evalúa, muestra un indicador de carga central y redirige de forma determinista hacia `/home` (si está autenticado) o hacia `/login` (si no hay sesión).
- **Contenedor:** Contenedor de pantalla completa centrado con fondo neutro `#F5F5F5`.

### 1.2 Pantalla de Inicio de Sesión
- **Ruta de archivo:** `src/app/login.tsx`
- **Propósito funcional:** Captura de credenciales (`código de empleado` y `clave de acceso`) para técnicos en campo. Autenticación determinista contra catálogo local offline sin requerir red.
- **Estructura general:**
  - Contenedor seguro (`SafeAreaView`) con soporte para teclado móvil (`KeyboardAvoidingView` + `ScrollView`).
  - Cabecera institucional con título y subtítulo.
  - Tarjeta/Formulario de autenticación.
  - Panel informativo inferior con credenciales de técnicos disponibles en modo offline.

### 1.3 Pantalla Operativa Principal (Home)
- **Ruta de archivo:** `src/app/home.tsx`
- **Propósito funcional:** Vista base del turno del técnico autenticado. Alberga la barra de estado global persistente, tarjeta con datos del técnico en turno y acción para cerrar turno.
- **Estructura general:**
  - Contenedor seguro (`SafeAreaView`).
  - Barra de estado global fija en la cabecera superior.
  - Tarjeta de información del técnico (nombre y código).
  - Panel de acción inferior con botón de cierre de turno.

---

## 2. Secciones y Organismos

### 2.1 Barra de Estado Global (`GlobalStatusBar`)
- **Ruta de archivo:** `src/components/GlobalStatusBar.tsx`
- **Estructura funcional:** Franja horizontal compacta (altura mínima de 48 pt para objetivo táctil/visibilidad) fijada en la parte superior de la interfaz operativa.
  - **Sección Izquierda:** Indicador visual de conectividad (punto o icono de estado + texto descriptivo).
  - **Sección Derecha:** Contador de registros pendientes de sincronización hacia el sistema comercial.

### 2.2 Tarjeta de Formulario de Login
- **Ruta de archivo:** `src/app/login.tsx` (bloque `formContainer`)
- **Estructura funcional:** Tarjeta con borde y fondo blanco que agrupa las dos entradas de datos, la caja condicional de mensaje de error en español y el botón de acción principal.

### 2.3 Tarjeta de Resumen del Técnico
- **Ruta de archivo:** `src/app/home.tsx` (bloque `card`)
- **Estructura funcional:** Módulo informativo superior que presenta el turno activo, el nombre del funcionario y su código institucional.

---

## 3. Componentes y Moléculas

### 3.1 Grupo de Entrada "Código de Empleado"
- **Etiqueta:** "Código de empleado" (14pt, seminegrita).
- **Campo de texto:** `TextInput` de altura mínima 48 pt, mayúsculas automáticas (`autoCapitalize="characters"`), placeholder "Ej. TEC-001", sin autocorrección.
- **Validación activa:** Sanitización automática de espacios en blanco (`trim()`) y validación de campo obligatorio.

### 3.2 Grupo de Entrada "Clave de Acceso"
- **Etiqueta:** "Clave de acceso" (14pt, seminegrita).
- **Campo de texto:** `TextInput` de altura mínima 48 pt, texto oculto (`secureTextEntry`), placeholder "Ingrese su clave", sin autocorrección ni mayúsculas automáticas.
- **Validación activa:** Validación de campo no vacío al enviar el formulario.

### 3.3 Caja de Alerta de Error
- **Contenedor:** Caja con fondo rosa claro/rojo suave y borde visible.
- **Texto:** Mensaje en español descriptivo (`errorMessage`), por ejemplo:
  - *"Debe ingresar el código de empleado y la clave."*
  - *"Código de empleado o clave incorrectos."*
- **Comportamiento:** Se oculta automáticamente cuando el usuario edita cualquier campo (`clearError`).

### 3.4 Guía de Credenciales Offline
- **Contenedor:** Caja azul suave (`#E3F2FD`) informativa para facilitar pruebas en campo y en entorno de desarrollo.
- **Elementos:** Lista estática con los 3 técnicos autorizados:
  - `TEC-001` / Clave: `1234` (Carlos Mendoza)
  - `TEC-002` / Clave: `5678` (Ana Morales)
  - `TEC-003` / Clave: `9012` (Jorge Benítez)

---

## 4. Elementos Atómicos (Nivel Específico)

### 4.1 Botones y Acciones Táctiles

| Elemento | Pantalla / Componente | Evento / Disparador | Estado Habilitado | Estado Deshabilitado | Dimensión Táctil |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Botón "Iniciar Turno"** | `login.tsx` | `handleLogin` (valida y autentica contra catálogo) | Azul (`#0D47A1`), texto blanco "Iniciar Turno" | Azul atenuado (`#90CAF9`) con `ActivityIndicator` blanco | Min 48 pt alto x 100% ancho |
| **Botón "Cerrar Turno"** | `home.tsx` | `handleLogout` (purga AsyncStorage y redirige a login) | Rojo (`#D32F2F`), texto blanco "Cerrar Turno" | N/A | Min 48 pt alto x 100% ancho |

### 4.2 Indicadores y Textos de Datos

| Etiqueta / Indicador | Componente | Dato Exacto Mostrado | Formato / Valores Posibles |
| :--- | :--- | :--- | :--- |
| **Punto de Estado de Red** | `GlobalStatusBar.tsx` | Estado de conexión activa del dispositivo | Círculo 10x10 pt: Verde (`#2E7D32`) online, Rojo (`#C62828`) offline |
| **Texto de Conectividad** | `GlobalStatusBar.tsx` | `connectionLabel` | `"Con señal"` (cuando online) / `"Sin señal"` (cuando offline) |
| **Contador de Pendientes** | `GlobalStatusBar.tsx` | `pendingLabel` | `"0 pendientes"` (constante determinista para Spec 001) |
| **Nombre del Técnico** | `home.tsx` | `technician.name` | Nombre completo (ej. `"Carlos Mendoza"`) o `"Técnico de Campo"` fallback |
| **Código del Técnico** | `home.tsx` | `technician.employeeCode` | `"Código: TEC-001"` o `"Código: ---"` fallback |
| **Título Institucional** | `login.tsx` | Siglas de la empresa | `"EPMAPS"` (28pt, negrita, `#0D47A1`) |
| **Subtítulo del Módulo** | `login.tsx` | Nombre del módulo | `"Toma de Lecturas en Campo"` (16pt, `#555555`) |

---

## 5. Estilo y Diseño Aplicado

- **Paleta y Tokens Asignados (`src/constants/theme.ts`):**
  - `--epmaps-primary-dark` (`#153268`): Encabezados corporativos, fondo de botón principal de búsqueda en Home, texto de títulos y logotipo.
  - `--epmaps-primary` (`#2D72C0`): Botón primario "Iniciar Turno", icono institucional en círculo y acentos interactivos.
  - `--epmaps-accent-dark` (`#3B766C`): Variante oscurecida de alto contraste para textos de acento sobre fondos claros (ratio 5.26:1 WCAG AA) en insignias y notas de sesión.
  - `--epmaps-surface` (`#FFFFFF`): Fondo de tarjetas elevadas (`formContainer`, `card`, `GlobalStatusBar`).
  - `--epmaps-bg-light` (`#F8FAFC`): Fondo principal de pantalla y cajas informativas neutras.
  - `--epmaps-bg-blue` (`#E1F2FB`): Contenedores informativos de catálogo offline y píldora de turno activo / pendientes.
  - Estados semánticos de conectividad y alerta:
    - En línea: Fondo `#E8F5E9`, borde `#A5D6A7`, punto y texto `#2E7D32`.
    - Sin señal: Fondo `#FFEBEE`, borde `#FFCDD2`, punto y texto `#C62828`.
    - Cierre de turno: Fondo suave `#FEF2F2`, borde `#FCA5A5`, texto `#C62828`.

- **Tipografía y Jerarquía (`design-taste-frontend`):**
  - Títulos principales en 28 pt con peso 800 y tracking de 1.5 pt para presencia oficial.
  - Subtítulos institucionales y badges ("AGUA DE QUITO", "TURNO ACTIVO") en 11-12 pt con peso 700 y espaciado expandido (letterSpacing 0.5-1.2 pt).
  - Etiquetas de formulario en 11 pt, mayúsculas, peso 700 y color institucional `#153268`.
  - Nombres y datos operativos destacados en 20-22 pt con peso 800.
  - Cero tipografías decorativas o gradientes; diseño sobrio de herramienta de trabajo gubernamental de alto rendimiento.

- **Márgenes, Radios y Espaciado (`emil-design-eng`):**
  - Objetivos táctiles mínimos garantizados de 48 pt a 52 pt en todos los botones interactivos e inputs de texto (`minHeight: 48` / `minHeight: 52`).
  - Ritmo vertical consistente: espaciado estándar de 20 pt de padding en pantallas (`EPMAPS_SPACING.xl`), 16 pt interno en tarjetas y 24 pt de separación de secciones.
  - Radios de curvatura coherentes: 12 pt en tarjetas contenedor (`EPMAPS_RADII.lg`), 8 pt en botones y campos (`EPMAPS_RADII.md`), y píldoras completas en badges (`EPMAPS_RADII.full`).

- **Estados Interactivos:**
  - Reposo: Bordes nítidos (`#CBD5E1` / `#E2E8F0`) con sombras ambientales sutiles (`elevation: 2`, `shadowOpacity: 0.05`).
  - Pulsación: Respuesta táctil inmediata con `activeOpacity={0.85}` en todos los botones (`TouchableOpacity`).
  - Deshabilitado / En envío: Botón "Iniciar Turno" adquiere fondo atenuado (`#93C5FD`) y renderiza `ActivityIndicator` blanco mientras valida el catálogo.

- **Decisiones Estéticas Clave:**
  - Se estructuró la cabecera de `GlobalStatusBar` como una franja limpia con píldoras de alto contraste en los extremos y marca corporativa central, garantizando visibilidad bajo luz solar directa sin interferir con la navegación.
  - La tarjeta de técnico en `Home` expone el estado de turno y el código institucional mediante badges sobrios, priorizando jerárquicamente la acción primaria de "Buscar Medidor" sobre el cierre de turno.

