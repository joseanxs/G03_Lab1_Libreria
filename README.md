# Laboratorio 1 · Mini-API MVC con CRUD

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

```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env
npm run dev               # http://localhost:3000 o puerto asignado
```

Importa en Postman `postman/GXX_Lab1.postman_collection.json` y ejecuta **Run collection**.

## Estructura MVC en capas

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
| **Frank Alvarado** | Integrante 3: Control de Calidad (Middlewares, Postman y Empaquetado) | • **Middlewares**: Configuración y revisión de `logger.js` (registro de método, ruta y hora en consola) y `errorHandler.js` / `notFound.js` (captura de errores 400, 404, 500).<br>• **Pruebas en Postman**: Ajuste de la colección `postman/GXX_Lab1.postman_collection.json` con las peticiones de `/api/books`, ejecución de *Run Collection* y verificación de pruebas en verde.<br>• **Evidencias y Empaquetado**: Captura de registros del logger (`evidencias/logger.png`), capturas de ejecución de Postman (`evidencias/postman-run.png`), exportación de colección v2.1 y preparación del ZIP final para entrega. |


## Declaración de uso de IA

- Herramienta(s) usada(s): Antigravity IDE (Gemini)
- Para qué la usamos: Depuración de validaciones en la capa de servicio, estructuración limpia de los métodos HTTP en el controlador y pruebas de integración local de los endpoints.
- Qué verificamos o corregimos nosotros: Lógica de negocio de la entidad `book`, nombres y tipos de atributos en `data/books.json`, enrutamiento relativo sin duplicación de prefijos `/books`, y verificación de peticiones `POST`/`PUT` en Postman.
