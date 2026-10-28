# EPMAPS – Toma de Lecturas en Campo (Agua de Quito)

Aplicación móvil **offline-first** desarrollada con **Expo (React Native + TypeScript + Expo Router)** para los técnicos de campo de la **Empresa Pública Metropolitana de Agua Potable y Saneamiento (EPMAPS)**. Permite registrar lecturas mensuales de medidores de agua potable sin depender de cobertura celular, resguardando borradores, evidencias fotográficas y cola de envíos en almacenamiento local duradero con sincronización automática e idempotente hacia los sistemas de oficina.

---

## Decisiones Arquitectónicas (ADRs) y Dependencias Avaladas

Todas las decisiones técnicas de librerías, almacenamiento, red y pruebas están formalmente documentadas y justificadas en el directorio **[`docs/adr/`](./docs/adr/)**. Ninguna dependencia externa se incorporó sin su respectivo ADR:

| ADR | Archivo en `docs/adr/` | Librería / Dependencia Avalada | Propósito y Justificación en el Proyecto |
| :--- | :--- | :--- | :--- |
| **ADR-001** | [`docs/adr/ADR-001-async-storage-sesion.md`](./docs/adr/ADR-001-async-storage-sesion.md) | `@react-native-async-storage/async-storage` (`2.2.0`) | **Persistencia local clave-valor no volátil:** Resguarda la sesión activa del técnico (`ISessionStorage`), la memoria caché de medidores consultados en la jornada (`meterCacheStorage`), el borrador en curso ante cierres imprevistos y la cola local de lecturas (`readingDraftStorage`). |
| **ADR-002** | [`docs/adr/ADR-002-netinfo-conectividad.md`](./docs/adr/ADR-002-netinfo-conectividad.md) | `@react-native-community/netinfo` (`12.0.1`) | **Monitoreo reactivo de conectividad en tiempo real:** Escucha los eventos nativos de red del sistema operativo (`INetworkStatusService`) con latencia `< 500 ms` y cero drenaje extra de batería para actualizar la barra global (`Con señal` / `Sin señal`) y disparar la sincronización automática al recuperar cobertura. |
| **ADR-003** | [`docs/adr/ADR-003-jest-expo-testing.md`](./docs/adr/ADR-003-jest-expo-testing.md) | `jest-expo` (`~57.0.0`), `jest` (`^30.5.2`), `@types/jest` (`^30.0.0`) | **Arnés de pruebas unitarias e integración (TDD):** Permite validar bajo ciclo Rojo-Verde-Refactor toda la lógica pura de dominio (`src/domain/`), los adaptadores de almacenamiento (`src/storage/`), servicios (`src/services/`) y controladores (`src/presentation/`). |
| **ADR-004** | [`docs/adr/ADR-004-axios-cliente-http.md`](./docs/adr/ADR-004-axios-cliente-http.md) | `axios` (`^1.21.0`) | **Cliente HTTP hacia sistemas de oficina:** Gestiona las consultas remotas de medidores (`GET /medidores`) y la transmisión idempotente de lecturas (`POST` / `PUT`) en `src/services/officeApi.ts`, con control centralizado de `timeout` (`10000 ms`), serialización JSON y manejo defensivo de errores HTTP. |
| **ADR-005** | [`docs/adr/ADR-005-expo-image-picker-camara.md`](./docs/adr/ADR-005-expo-image-picker-camara.md) | `expo-image-picker` (`~57.0.20`) | **Captura fotográfica con cámara nativa:** Invoca la cámara del fabricante (`launchCameraAsync`) con acceso a flash/linterna y autoenfoque para fotografiar medidores en nichos oscuros o subsuelos, aplicando compresión controlada (`quality: 0.7`) y gestión de permisos en tiempo de ejecución. |
| **ADR-006** | [`docs/adr/ADR-006-expo-file-system-fotos.md`](./docs/adr/ADR-006-expo-file-system-fotos.md) | `expo-file-system` (`~57.0.7`) | **Almacenamiento duradero de fotografías en disco:** Copia las evidencias fotográficas desde la caché temporal volátil hacia el directorio permanente de documentos (`documentDirectory/epmaps_photos/`), evitando purgas del sistema operativo y manteniendo `AsyncStorage` liviano (guardando únicamente la URI física). |

---

## Arquitectura y Estructura del Proyecto

El proyecto aplica **Spec-Driven Development (SDD)** y separación estricta de responsabilidades:

```text
EPMAPS/
├── docs/
│   ├── constitution.md        # Principios arquitectónicos y reglas innegociables
│   ├── adr/                   # Registros de Decisiones de Arquitectura (ADR-001 a ADR-006)
│   └── historias/             # Historias de Usuario (HU-001 a HU-005)
├── specs/                     # Especificaciones EARS, decisiones, planes, tareas y contratos de diseño (001 a 005)
└── src/
    ├── domain/                # Lógica de negocio pura en TypeScript (sin React ni I/O)
    │   ├── session/           # Validación de turno y formato de barra de estado
    │   ├── meter/             # Formato MED-XXXXXX, traducción de estados y reglas de unicidad mensual
    │   ├── reading/           # Cálculo de consumo, detección de anomalías (> 3x promedio) y obligatoriedad
    │   ├── readingQueue/      # Clasificación de bandeja local y reglas de inmutabilidad de lecturas enviadas
    │   └── sync/              # Reglas de reconciliación diferida, bloqueos y backoff exponencial
    ├── storage/               # Contratos e implementaciones de persistencia local (AsyncStorage)
    ├── services/              # Integración con API de oficina (Axios) y sistema de archivos/cámara
    ├── presentation/          # Controladores (Custom Hooks) y motor reactivo de sincronización (useSyncEngine)
    ├── components/            # Componentes transversales (GlobalStatusBar)
    ├── constants/             # Tokens de diseño institucional EPMAPS (theme.ts)
    └── app/                   # Pantallas y navegación con Expo Router
```

---

## Módulos Funcionales Implementados

1. **Inicio de Turno y Estado Global (`specs/001`):** Autenticación offline de técnicos habilitados, persistencia de sesión y barra superior permanente con telemetría de red (`Con señal` / `Sin señal`) y contador de cola.
2. **Identificación y Consulta de Medidor (`specs/002`):** Búsqueda por código `MED-XXXXXX` en oficina o caché de jornada, contingencia sin señal para medidores nuevos y bloqueo/edición controlada ante duplicidad mensual.
3. **Captura de Lectura en 3 Pasos (`specs/003`):** Asistente guiado (Estado físico -> Lectura en $\text{m}^3$ -> Evidencia fotográfica y observaciones), autoguardado de borrador en cada paso, alerta de consumo anómalo ($> 3\times$ promedio) y foto obligatoria en caso de daño o anomalía.
4. **Bandeja Local y Detalle de Lecturas (`specs/004`):** Visualización de lecturas clasificadas por estado (`Pendiente de verificar`, `Pendiente de enviar`, `Requiere atención`, `Enviada`), edición de lecturas aún no transmitidas e inmutabilidad estricta de lecturas enviadas.
5. **Sincronización Automática y Reconciliación Diferida (`specs/005`):** Envío desatendido en segundo plano al detectar red, contraste tardío contra oficina para lecturas tomadas sin datos previos y retención segura en campo si el contraste revela anomalía sin foto adjunta.

---

## Configuración e Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   Copia el archivo `.env_example` a `.env` y define la URL base del endpoint de oficina (MockAPI):
   ```env
   EXPO_PUBLIC_OFFICE_API_URL="https://<tu-instancia>.mockapi.io/api/v1"
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npx expo start
   ```
   *(En redes restringidas o pruebas remotas con Expo Go: `npx expo start --tunnel`)*

---

## Comandos de Verificación y Calidad

- **Ejecutar suite de pruebas automatizadas (15 suites / 153 tests):**
  ```bash
  npx jest
  ```
- **Verificación estática de tipos TypeScript:**
  ```bash
  npx tsc --noEmit
  ```
- **Linter del proyecto:**
  ```bash
  npx expo lint
  ```
