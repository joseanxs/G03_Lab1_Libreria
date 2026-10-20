# 🧭 Guía Arquitectónica y Catálogo de Scripts (`client`)
## Sistema de Inventario para Librería Pequeña — **Sapientia Logos**

Este documento detalla la arquitectura, estructura de directorios y el propósito funcional de cada archivo `.js` y `.jsx` dentro del cliente web (`client/`). Refleja el estado actual del proyecto adaptado a los requerimientos de la cátedra de Desarrollo Web Avanzado.

---

## 🏛️ 1. Arquitectura General del Proyecto

La aplicación está construida sobre una arquitectura **Feature-Driven Design** (diseño guiado por funcionalidades) combinada con el patrón **Container-Presentational**:

* **Empaquetador y Entorno:** Vite 6 + React 19.
* **Enrutamiento:** `@tanstack/react-router` (enrutamiento declarativo basado en sistema de archivos y tipado estático).
* **Gestión de Estado de Servidor:** `@tanstack/react-query` (caching y revalidación asíncrona).
* **Gestión de Estado de Cliente:** Zustand (`auth-store.js`) y React Context (`Theme`, `Font`, `Direction`, `Layout`, `Search`).
* **Diseño y Primitivas UI:** Radix UI primitives + Tailwind CSS (`shadcn/ui` pattern).
* **Formularios y Validación:** `react-hook-form` con validación de esquemas mediante `zod`.
* **Gráficos y Visualización:** `recharts` para analíticas reactivas de inventario.
* **Internacionalización:** Interfaz 100% traducida al español.

---

## 📚 2. Entidad del Dominio: `Libro` y Estados de la Rúbrica

El sistema gestiona de forma centralizada la entidad **Libro**, cumpliendo estrictamente con los 4 atributos requeridos:

| Atributo | Tipo de Dato | Descripción |
| :--- | :--- | :--- |
| `titulo` | `string` | Título de la obra literaria o académica. |
| `autor` | `string` | Autor o autor principal del libro. |
| `precio` | `number` | Valor monetario del ejemplar en dólares americanos ($). |
| `disponible` | `boolean` | Estado de stock (disponible para venta/préstamo o agotado). |

### Gestión Reactiva de los 4 Estados Condicionales de la Rúbrica
La aplicación maneja en memoria los 4 estados requeridos, con controles en la interfaz para probarlos al instante:
1. **Carga (`cargando`)**: Simulación reactiva mediante `setTimeout(..., 1500)` que muestra un spinner y descripción explicativa mientras se "obtiene" el inventario.
2. **Vacío (`vacio`)**: Mensaje ilustrado cuando el catálogo no contiene elementos, con accesos directos para agregar el primer libro o cargar datos de prueba.
3. **Con Datos (`datos`)**: Tabla centralizada completa con buscador en tiempo real, filtro por disponibilidad, paginación, selección múltiple y ordenamiento.
4. **Error (`error`)**: Tarjeta de contingencia con mensaje de fallo y botón de reintento. Puede dispararse manualmente desde la barra de pruebas o ingresando la palabra `"error"` en el campo título del formulario.

---

## 🚀 3. Raíz y Puntos de Entrada

| Archivo | Ubicación | Funcionalidad |
| :--- | :--- | :--- |
| `index.html` | `/index.html` | Punto de anclaje HTML con `lang="es"`, metadatos y título *Sapientia Logos - Sistema de Inventario*. |
| `vite.config.js` | `/vite.config.js` | Configuración de Vite con alias `@` apuntando a `./src`, plugins de Tailwind CSS y TanStack Router. |
| `src/main.jsx` | `/src/main.jsx` | **Punto de arranque de React**. Inicializa `QueryClient`, intercepciones de error HTTP, proveedores de contexto y monta en `#root`. |
| `src/routeTree.gen.js` | `/src/routeTree.gen.js` | Árbol de rutas autogenerado por TanStack Router. No se modifica a mano. |

---

## 💼 4. Módulos de Funcionalidad (`src/features/`)

### A. Libros (`src/features/books/`) — *Módulo Central del Proyecto*

Este módulo concentra toda la lógica de negocio y presentación de la entidad Libro:

* **`index.jsx`**:
  * **Rol**: Componente Contenedor principal (*Container*).
  * **Lógica**: Administra el estado local reactivo (`libros`, `estado`, `mensajeError`, `isDialogOpen`) mediante `useState` y `useEffect`.
  * **Navegación por Pestañas**: Organiza la vista en dos pestañas: **[ Inventario ]** (tabla interactiva con sus 4 estados) y **[ Estadísticas ]** (dashboard analítico).
  * **Operaciones CRUD en memoria**:
    * `handleGuardarLibro`: Agrega un nuevo libro al array local o dispara error si el título es `"error"`.
    * `handleEliminarLibro`: Elimina un libro por ID y cambia a estado vacío si la lista queda en cero.
    * `handleToggleDisponible`: Alterna el booleano `disponible` con un solo clic.
    * `handleCargarEjemplos`: Restaura los 20 libros iniciales de demostración.

* **`components/book-table.jsx`**:
  * **Rol**: Componente Presentacional avanzado.
  * **Herramientas de prueba**: Barra superior con botones rápidos (`Carga`, `Vacío`, `Con Datos`, `Error`) para evaluar la rúbrica al instante.
  * **Renderizado de Estados**: Renderiza condicionalmente el estado actual (`cargando`, `vacio`, `error`, o `datos`).
  * **Búsqueda y Filtros**: Input en tiempo real que busca por título o autor, selector desplegable para filtrar por disponibilidad (*Todos*, *Disponibles*, *No disponibles*).
  * **Paginación Local**: Selector de tamaño de página (5, 10, 20, 50 filas) y botones de navegación segura entre páginas.

* **`components/book-dialog.jsx`**:
  * **Rol**: Diálogo modal para registrar nuevos libros.
  * **Campos**: Título (texto), Autor (texto), Precio (numérico con validación de positivos) y Disponibilidad (checkbox).
  * **Validación**: Comprobación estricta antes de emitir el evento `onGuardar`.

* **`components/book-stats.jsx`**:
  * **Rol**: Dashboard analítico 100% reactivo al inventario actual.
  * **4 Tarjetas KPI Superiores**:
    1. *Valor del Inventario*: Sumatoria total y promedio por ejemplar.
    2. *Títulos Registrados*: Total de obras y autores únicos en catálogo.
    3. *Disponibles en Stock*: Cantidad y porcentaje disponible para entrega.
    4. *Agotados / Préstamos*: Cantidad y porcentaje pendiente de reposición.
  * **Gráfico Recharts**: Gráfica de barras interactiva con tooltips formateados con los precios de los libros.
  * **Libros Recientes**: Lista con avatar de iniciales, autor, estado de stock y precio.

* **`data/books.js`**:
  * Colección inicial de 20 libros reales de literatura clásica y contemporánea en español (Cervantes, García Márquez, Borges, Cortázar, Rulfo, etc.) con sus 4 atributos normalizados.

---

### B. Autenticación (`src/features/auth/`)

* **`auth-layout.jsx`**: Maquetación centrada con el logotipo e identidad de *Sapientia Logos*.
* **`sign-in/`**:
  * `index.jsx`: Página de inicio de sesión.
  * `sign-in-2.jsx`: Variante visual de login con panel dividido e ilustración.
  * `components/user-auth-form.jsx`: Formulario con validación estricta configurado para el acceso del docente/evaluador:
    * **Correo exclusivo:** `admin@espe.edu.ec`
    * **Contraseña:** `admin`
    * Precargadas por defecto en el formulario con recordatorio visual para facilitar las pruebas.
* **`sign-up/`**: `index.jsx` y `components/sign-up-form.jsx` para registro de usuarios con validación Zod.
* **`forgot-password/`**: `index.jsx` y `components/forgot-password-form.jsx` para recuperación de acceso.
* **`otp/`**: `index.jsx` y `components/otp-form.jsx` para verificación de código en 6 casillas.

---

### C. Páginas de Error (`src/features/errors/`)

Pantallas de estado HTTP traducidas y con botones de navegación (`Regresar` e `Ir al Inicio`):
* **`unauthorized-error.jsx`**: Error 401 — Acceso No Autorizado.
* **`forbidden.jsx`**: Error 403 — Acceso Prohibido.
* **`not-found-error.jsx`**: Error 404 — Página No Encontrada.
* **`general-error.jsx`**: Error 500 — Error Interno del Servidor.
* **`maintenance-error.jsx`**: Error 503 — Sistema en Mantenimiento.

---

## 🧱 5. Componentes de Navegación y Layout (`src/components/layout/`)

* **`data/sidebar-data.js`**: **Configuración del menú lateral**. Muestra de forma limpia y exclusiva el módulo del proyecto:
  * Usuario: `Administrador` (`admin@espe.edu.ec`).
  * Organización: `Sapientia Logos` — `Sistema de Inventario`.
  * Grupo único: **Inventario → Catálogo de Libros** (`/`).
* **`app-sidebar.jsx`**: Barra de navegación lateral colapsable con accesibilidad ARIA.
* **`app-title.jsx`**: Logotipo y título *Sapientia Logos* para el encabezado del sidebar.
* **`authenticated-layout.jsx`**: Armazón que une el sidebar, la cabecera superior y el área de contenido.
* **`header.jsx`**: Barra superior fija con buscador, botón de tema, cajón de configuración y perfil.
* **`main.jsx`**: Envoltorio semántico `<main>` con espaciado responsivo.
* **`nav-group.jsx`**: Renderizador recursivo de elementos del menú lateral.
* **`nav-user.jsx`**: Menú contextual del usuario en la parte inferior del sidebar con información visual, cambio de tema y cierre de sesión.
* **`team-switcher.jsx`**: Selector de sucursal/librería con sincronización segura de logos.
* **`top-nav.jsx`**: Navegación horizontal para vistas secundarias.

---

## 🌐 6. Contextos Globales (`src/context/`)

* **`theme-provider.jsx`**: Modo claro (`light`), oscuro (`dark`) o automático (`system`) sincronizado con cookies.
* **`layout-provider.jsx`**: Control de variante de sidebar (integrada, flotante, fija) y ancho de contenido.
* **`direction-provider.jsx`**: Soporte de dirección de texto (`ltr` / `rtl`).
* **`font-provider.jsx`**: Tipografías seleccionables (Inter, Roboto, Manrope).
* **`search-provider.jsx`**: Control de apertura/cierre para el Command Palette.

---

## 🗃️ 7. Estado Global y Stores (`src/stores/`)

* **`auth-store.js`**: Store de Zustand persistente. Guarda el usuario activo (`email`, `roles`, `exp`) y token de sesión simulado.

---

## 🪝 8. Hooks Personalizados (`src/hooks/`)

* **`use-dialog-state.jsx`**: Maneja el ciclo de vida de modales y drawers.
* **`use-mobile.jsx`**: Detección reactiva de dispositivos móviles (`< 768px`).
* **`use-table-url-state.js`**: Sincroniza paginación y filtros con los search params de la URL.

---

## 🛠️ 9. Utilidades y Helpers (`src/lib/`)

* **`utils.js`**: Función `cn()` para concatenar clases condicionales de Tailwind con `clsx` y `tailwind-merge`.
* **`cookies.js`**: Lectura y escritura de cookies para conservar preferencias.
* **`handle-server-error.js`**: Formateador de errores HTTP con alertas toast en español.
* **`show-submitted-data.jsx`**: Modal auxiliar de depuración para visualizar payloads enviados.

---

## 🧩 10. Componentes Transversales (`src/components/`)

* **`command-menu.jsx`**: Paleta de comandos (`Ctrl+K`) para búsqueda global y cambio de tema.
* **`config-drawer.jsx`**: Drawer lateral para personalizar la apariencia en caliente.
* **`confirm-dialog.jsx`**: Diálogo de confirmación con variantes primaria o destructiva.
* **`profile-dropdown.jsx`**: Menú del avatar en el encabezado con la información visual del usuario (admin@espe.edu.ec), cambio de tema y botón funcional de Cerrar Sesión.
* **`search.jsx`**: Barra de búsqueda superior con icono de atajo de teclado.
* **`sign-out-dialog.jsx`**: Modal con confirmación para salir del sistema.
* **`theme-switch.jsx`**: Conmutador rápido de tema claro/oscuro.
* **`password-input.jsx`**: Campo de clave con botón interactivo para mostrar u ocultar contraseña.
* **`date-picker.jsx`**: Selector de fechas en formato `dd/MM/yyyy`.
* **`data-table/`**: Subcomponentes reutilizables de tabla (paginación, cabeceras ordenables, filtros por facetas, barra de acciones masivas).

---

## 🚦 11. Sistema de Rutas (`src/routes/`)

* **`__root.jsx`**: Raíz universal con barra de progreso y contenedor de notificaciones Sonner.
* **`_authenticated/route.jsx`**: Contenedor autenticado con layout completo.
* **`_authenticated/index.jsx`**: **Ruta principal `/`** que renderiza directamente la pantalla `src/features/books/index.jsx`.
* **`_authenticated/errors/$error.jsx`**: Enrutador paramétrico para visualizar cualquier código de error (401, 403, 404, 500, 503).
* **Rutas públicas de autenticación (`(auth)/`)**: `sign-in.jsx`, `sign-up.jsx`, `forgot-password.jsx`, `otp.jsx`.
