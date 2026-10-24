# Laboratorio 2 · Percistencia con prisma

**Desarrollo Web Avanzado (A0R04) · ESPE · Unidad 1: Persistencia de datos y ORM**

| Dato | Valor |
|---|---|
| Grupo | G03 |
| Emprendimiento | Librería Sapientia Logos |
| Integrantes | 1. Jose Reinoso 2. Yostin Sisalema 3. Frank Alvarado |
| NRC | 36878 |
| Fecha | 18-10-2026 |
| Repositorio | https://github.com/joseanxs/G03_Lab1_Libreria.git |

## Cómo ejecutar

### 1. API REST en Express (src/  -> carpeta principal del proyecto)

```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env
npm run dev               # http://localhost:3000 o puerto asignado
```

Importa en Postman `postman/G03_Lab1.postman_collection.json` y ejecuta **Run collection**.

### 2. client/ (Usando React con Vite)

```bash
cd client
npm install
npm run dev
```
Credenciales de prueba (precargadas): admin@espe.edu.ec / admin


### Estructura MVC en capas

```
src/
├─ app.js            ← arma la app: express.json, middlewares y prefijo /api
├─ server.js         ← solo levanta el servidor (lee .env)
├─ routes/
│  ├─ index.js       ← archivo principal: monta cada recurso (/api/books)
│  └─ book.routes.js ← verbo + URL → acción del controlador
├─ controllers/
│  └─ book.controller.js ← lee req, llama al servicio, decide código + JSON
├─ services/
│  └─ book.service.js    ← reglas de negocio, validaciones y acceso a datos
├─ models/
│  └─ book.model.js      ← campos de la entidad y archivo JSON (Lab 2: schema.prisma)
├─ middlewares/      ← logger, notFound, errorHandler
└─ utils/httpError.js
data/
└─ books.json        ← archivo JSON con los registros de libros
client/
├─ src/
│  ├─ api/                  ← configuración de Axios y endpoints
│  ├─ components/           ← componentes de interfaz (AuthModal, BookCard, BookForm)
│  ├─ context/              ← BookProvider y hooks de autenticación (useBooks, useAuth)
│  ├─ pages/                ← páginas principales (AuthPage, BookListPage, NotFoundPage)
│  ├─ hooks/                ← hooks personalizados (useLogin)
│  ├─ utils/                ← utilidades de UI y formato
│  └─ main.jsx, App.jsx     ← entry point y layout principal
└─ public/                  ← imágenes y otros recursos estáticos
```

Flujo de una petición: **ruta → controlador → servicio → modelo** y de vuelta. El proyecto usa CommonJS (`require` / `module.exports`).

## Endpoints de la entidad

| Verbo | Ruta | Acción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/api/books` | Listar todos los libros | 200 | — |
| GET | `/api/books/:id` | Ver un libro por su ID | 200 | 400, 404 |
| POST | `/api/books` | Crear un libro con datos validados | 201 | 400 |
| PUT | `/api/books/:id` | Actualizar campos de un libro existente | 200 | 400, 404 |
| DELETE | `/api/books/:id` | Eliminar un libro por su ID | 204 | 400, 404 |

## Validaciones del servicio

1. **Título (`title`)**: Obligatorio en creación (`POST`) y validado si se envía en actualización (`PUT`). Debe ser una cadena de texto no vacía de al menos 2 caracteres. Si no cumple, lanza `HttpError(400, "El título del libro debe tener al menos 2 caracteres")`.
2. **Precio (`price`)**: Obligatorio en creación y validado si se envía en actualización. Debe ser un valor numérico finito estrictamente mayor a 0 (`price > 0`). Si no cumple, lanza `HttpError(400, "El precio debe ser un número mayor a 0")`.
3. **Autor (`author`)**: Si se proporciona, debe ser una cadena de texto de al menos 2 caracteres.
4. **Disponibilidad (`available`)**: Si se proporciona, debe ser un valor de tipo booleano (`true` o `false`).

## Aporte de cada integrante

| Integrante | Rol | Qué hizo (archivos / pasos) |
|---|---|---|
| **Jose Reinoso** | Integrante 1: El Arquitecto (Propuesta, Modelo y Validaciones) | • **Documentación base**: Llenado completo de la información del emprendimiento en `PROPUESTA.md` (problema, funciones, 3 entidades).<br>• **Base de datos JSON**: Estructuración del archivo `data/books.json` con los registros iniciales.<br>• **Modelo**: Configuración del arreglo `FIELDS` en `src/models/book.model.js` con los campos obligatorios (`id`, `author`, `title`, `price`, `available`).<br>• **Reglas de negocio**: Programación de la función `validate()` en `src/services/book.service.js` con las validaciones requeridas (`title` y `price`).<br>• **Cierre documental**: Completado inicial de `README.md` con tabla de endpoints y estructura general. |
| **Yostin Sisalema** | Integrante 2: El Motor de la API (Servicio, Controlador y Rutas) | • **Renombrar y enrutar**: Renombrado de archivos a la entidad `book` en `src/` y montaje de la ruta base `/books` en `src/routes/index.js`.<br>• **Capa de Servicio**: Implementación de las funciones `create`, `update` y `remove` en `src/services/book.service.js` para persistencia en JSON, autoincremento de ID y lanzamiento de error 404.<br>• **Capa de Controlador**: Implementación de `create` (201), `update` (200) y `remove` (204) en `src/controllers/book.controller.js` delegando errores a `next(err)`.<br>• **Capa de Rutas**: Conexión de verbos y rutas relativas (`POST /`, `PUT /:id`, `DELETE /:id`) en `src/routes/book.routes.js`. |
| **Frank Alvarado** | Integrante 3: Control de Calidad (Middlewares, Postman y Empaquetado) | • **Middlewares**: Configuración y revisión de `logger.js` (registro de método, ruta y hora en consola) y `errorHandler.js` / `notFound.js` (captura de errores 400, 404, 500).<br>• **Pruebas en Postman**: Ajuste de la colección `postman/G03_Lab1.postman_collection.json` con las peticiones de `/api/books`, ejecución de *Run Collection* y verificación de pruebas en verde.<br>• **Evidencias y Empaquetado**: Captura de registros del logger (`evidencias/logger.png`), capturas de ejecución de Postman (`evidencias/postman-run.png`), exportación de colección v2.1 y preparación del ZIP final para entrega. |

### Nota Adiccional: Sobre el desarrollo del /client

Con respecto al desarrollo del /client, realizamos una reunión en Live Server para coordinar el diseño. Al trabajar con React (un framework para el desarrollo de interfaces de usuario), nuestro enfoque principal fue estructurar y diseñar los componentes de la interfaz. En este proceso, empleamos el diagrama del [Mapa del sistema](mapa_G03_Lab1.png) como guía para el desarrollo del cliente. La estructura de estos componentes y sus conexiones mutuas se pueden apreciar en la imagen [Diseño del sistema](diseno_visual.png). Por último, cabe añadir que implementamos la plantilla del repositorio shadcn-admin.

## Declaración de uso de IA

- Herramientas: Plataformas web Gemini y Claude.
- Para qué la usamos: 
    -- Para depurar y corregir errores en el código. 
    -- Para reforzar conceptos sobre los temas de arquitectura en capas vistos en clase. 
    -- Para consultar ejemplos de sintaxis en JavaScript y estructuración de componentes en librerías como React, utilizándolos como referencia. 
- Qué verificamos o corregimos nosotros: Lógica de negocio de la entidad `book`, nombres y tipos de atributos en `data/books.json`, validación de datos para evitar IDs repetidos y asegurar que los campos obligatorios estén completos y sean coherentes, enrutamiento relativo sin duplicación de prefijos `/books`, manejo de los 4 estados de interfaz en client/, y verificación de peticiones `POST`, `PUT` y `DELETE` en Postman.
