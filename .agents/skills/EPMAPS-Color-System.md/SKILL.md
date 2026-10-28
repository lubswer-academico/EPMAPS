---
name: EPMAPS-Color-System
description: "Activa esta skill para aplicar estrictamente la paleta de colores corporativa y sus reglas de contraste para EPMAPS Agua de Quito."
version: 1.0.0
---

# 💧 Skill: Sistema de Colores EPMAPS Agua de Quito

## 1. Propósito y Cuándo Usar
Esta skill define **exclusivamente la paleta de colores y las reglas de contraste** deducidas de las imágenes de EPMAPS Agua de Quito[cite: 14, 15, 16, 17]. Utilízala cuando necesites asignar colores corporativos a componentes de interfaz, asegurando accesibilidad WCAG 2.1.

## 2. Paleta de Colores [Medido]

| Nombre del Token | Valor Hexadecimal | Valores RGB / HSL | Porcentaje Visual | Función Principal |
| :--- | :--- | :--- | :--- | :--- |
| **`--epmaps-primary-dark`** | `#153268` | RGB: 21, 50, 104 <br> HSL: 219°, 66%, 25% | ~35% | Azul Marino Oscuro. Se usa en fondos de cabecera (hero), contenedores principales y texto de encabezado corporativo[cite: 15, 16]. |
| **`--epmaps-primary`** | `#2D72C0` | RGB: 45, 114, 192 <br> HSL: 212°, 62%, 46% | ~15% | Azul Medio Corporativo. Color central del logo, textos "EPMAPS", enlaces y botones de acción[cite: 16, 17]. |
| **`--epmaps-accent`** | `#63C5B5` | RGB: 99, 197, 181 <br> HSL: 170°, 46%, 58% | ~10% | Turquesa. Color de resalte para palabras clave en títulos grandes sobre fondos oscuros[cite: 15]. |
| **`--epmaps-surface`** | `#FFFFFF` | RGB: 255, 255, 255 <br> HSL: 0°, 0%, 100% | ~30% | Blanco. Superficie base de la web, texto sobre fondos oscuros y tarjetas limpias[cite: 15, 17]. |
| **`--epmaps-bg-light`** | `#F5F5F5` | RGB: 245, 245, 245 <br> HSL: 0°, 0%, 96% | ~5% | Gris Claro. Fondos secundarios para diferenciar tarjetas del fondo blanco[cite: 17]. |
| **`--epmaps-bg-blue`** | `#E1F2FB` | RGB: 225, 242, 251 <br> HSL: 201°, 76%, 93% | ~5% | Celeste Claro. Cajas contenedoras o fondos informativos sutiles[cite: 14]. |

## 3. Matriz de Contrastes (WCAG 2.1) y Accesibilidad [Medido]

Las siguientes relaciones han sido calculadas por código para garantizar accesibilidad:

| Combinación (Texto sobre Fondo) | Ratio Calculado | Cumplimiento (AA) | Notas de Implementación |
| :--- | :--- | :--- | :--- |
| **Blanco** sobre **Azul Oscuro** (`#153268`) | **12.44:1** | ✅ Pasa | Excelente contraste para cuerpos de texto y titulares[cite: 15, 16]. |
| **Blanco** sobre **Azul EPMAPS** (`#2D72C0`) | **4.91:1** | ✅ Pasa | Válido para botones como "Ver más" o "Cargar más"[cite: 16, 17]. |
| **Turquesa** sobre **Azul Oscuro** (`#153268`) | **6.03:1** | ✅ Pasa | Combinación ideal para palabras de énfasis visual (ej. "AQUÍ")[cite: 15]. |
| **Azul Oscuro** sobre **Blanco** (`#FFFFFF`) | **12.44:1** | ✅ Pasa | Combinación estándar para tarjetas informativas[cite: 17]. |
| **Azul EPMAPS** sobre **Blanco** (`#FFFFFF`) | **4.91:1** | ✅ Pasa | Válido para encabezados y textos institucionales[cite: 17]. |
| ⚠️ **Turquesa** sobre **Blanco** (`#FFFFFF`) | **2.06:1** | ❌ Falla | **PROHIBIDO.** No uses el turquesa original para texto sobre fondo blanco. |

### 🛠 Variante Correctiva Propuesta [Medido]
Si por diseño necesitas imperiosamente usar el color de acento para texto sobre fondos blancos o grises claros, **DEBES usar la siguiente variante oscurecida**:
*   **Token Correctivo:** `--epmaps-accent-dark`
*   **HEX Propuesto:** `#3B766C` (Oscurecido un 40%)
*   **Nuevo Contraste sobre Blanco:** **5.26:1 (✅ Pasa AA)**

## 4. Tokens CSS a Implementar

Copia y pega este bloque en el archivo raíz de tu hoja de estilos:

```css
:root {
  /* EPMAPS Color System */
  --epmaps-primary-dark: #153268;
  --epmaps-primary: #2D72C0;
  --epmaps-accent: #63C5B5;
  --epmaps-accent-dark: #3B766C; /* Variante accesible para fondos claros */
  
  /* Superficies y Fondos */
  --epmaps-surface: #FFFFFF;
  --epmaps-bg-light: #F5F5F5;
  --epmaps-bg-blue: #E1F2FB;
  
  /* Uso Semántico (Variables de aplicación) */
  --color-text-main: var(--epmaps-primary-dark);
  --color-text-inverse: var(--epmaps-surface);
  --color-text-highlight-dark-bg: var(--epmaps-accent);
  --color-button-bg: var(--epmaps-primary);
  --color-button-text: var(--epmaps-surface);
}