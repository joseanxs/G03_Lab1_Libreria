# Librería Sapientia Logos · API REST y Persistencia Políglota

**Desarrollo Web Avanzado (A0R04) · ESPE**  
**Unidad 2: Integración con bases NoSQL y APIs REST (MongoDB + Mongoose · Hitos 1 a 3)**  
*Con persistencia políglota y núcleo transaccional relacional (PostgreSQL + Prisma)*

| Dato | Valor |
|---|---|
| **Grupo** | G03 |
| **Emprendimiento** | Librería *Sapientia Logos* |
| **Integrantes** | 1. Jose Reinoso · 2. Yostin Sisalema · 3. Frank Alvarado |
| **NRC** | 36878 |
| **Tags de entrega** | `u2-hito-1` · `u2-hito-2` · `u2-hito-3` |
| **Repositorio** | https://github.com/joseanxs/G03_Lab1_Libreria.git (rama `main`) |

---

## 1. Persistencia Políglota y Núcleo de la Unidad 1

El proyecto opera bajo una **arquitectura de persistencia políglota**, donde cada motor atiende las necesidades de su dominio:

```
                         ┌─────────────────────────────────────────────────────────┐
                         │                    Express API REST                     │
                         └───────────┬─────────────────────────────────┬───────────┘
                                     │                                 │
                     PrismaClient (PostgreSQL 17)             Mongoose 9 (MongoDB 8)
                                     │                                 │
                  ┌──────────────────┴───────────────┐     ┌───────────┴───────────┐
                  │ users · customers · books        │     │ libreria.reviews      │
                  │ orders · order_items · history   │     │ (subdocumentos/tags)  │
                  │ [ACID · Integridad referencial]  │     │ [Read-Heavy · BSON]   │
                  └──────────────────────────────────┘     └───────────────────────┘
```

### ¿Qué cumple el núcleo relacional heredado (Unidad 1)?
- **Autenticación y Autorización:** Registro y login con hash bcrypt y tokens JWT, con middleware para rutas públicas y protegidas por roles (`USER` y `ADMIN`).
- **Catálogo e Inventario:** Gestión de libros (`Book`) y categorías (`Category`) con validaciones de negocio.
- **Transacciones ACID en Pedidos:** Proceso de compra (`Order` y `OrderItem`) con **descuento condicional de stock** (`WHERE stock >= quantity`). Si el stock no alcanza, se ejecuta un `ROLLBACK` inmediato (409) impidiendo la sobreventa.
- **Integridad Referencial:** Restricciones de clave foránea con `onDelete: Restrict` para resguardar la consistencia contable de clientes y productos vendidos.
- **Tecnologías empleadas:** PostgreSQL 17, Prisma ORM 7, Express.js en arquitectura multicapa (`routes → controllers → services`).

---

## 2. Requisitos y Cómo Levantar el Proyecto

### Requisitos
- Node.js 20.19 o superior
- Docker y Docker Compose (PostgreSQL 17 y MongoDB 8)
- MongoDB Compass
- Postman
- Git

### Paso a paso para ejecución local

#### 1. Clonar e instalar dependencias
```bash
git clone https://github.com/joseanxs/G03_Lab1_Libreria.git
cd G03_Lab1_Libreria
npm install
```

#### 2. Configurar variables de entorno
Copiar la plantilla `.env.example` a `.env`:
```bash
cp .env.example .env    # En Windows PowerShell: Copy-Item .env.example .env
```
Verificar que `.env` contenga:
```env
PORT=3000
DATABASE_URL="postgresql://espe_user:espe_password@localhost:5432/espe_db?schema=public"
MONGODB_URI="mongodb://espe_user:espe_password@localhost:27017/libreria?authSource=admin"
JWT_SECRET="clave-secreta-para-firmar-jwt"
```

#### 3. Levantar las bases de datos en Docker
```bash
docker compose up -d
```
Levanta simultáneamente:
- **`lab2-postgres` (PostgreSQL 17):** puerto `5432`, base `espe_db`.
- **`lab2-mongo` (MongoDB 8):** puerto `27017`, base `libreria`.

*(Para detener los contenedores: `docker compose down`)*.

#### 4. Migrar y poblar la base relacional
```bash
npm run db:migrate     # Aplica migraciones de Prisma
npm run db:generate    # Genera el cliente de Prisma
npm run db:seed        # Carga datos de prueba (libros, usuarios, categorías y pedidos)
```

#### 5. Iniciar la API
```bash
npm run dev
```
La aplicación verifica y conecta **ambas bases de datos** antes de abrir el puerto:
```text
PostgreSQL conectado
MongoDB conectado
Servidor ejecutándose en http://localhost:3000
```

---

## 3. Unidad 2 · Tu emprendimiento pasa a MongoDB (Hitos 1 a 3)

---

### Hito 1 · ¿Qué dato de tu emprendimiento va a NoSQL? (`tag: u2-hito-1`)

- **Commit / Tag:** `83325bc` · `u2-hito-1` (Yostin Sisalema)
- **Documentación:** [`docs/u2/hito1.md`](docs/u2/hito1.md)

#### 1. Análisis de tipos NoSQL para la librería

| Dato | ¿Por qué no encaja bien en una tabla relacional? | Tipo NoSQL | Razón técnica |
|---|---|---|---|
| **Reseñas y comentarios de libros** | Crecimiento acelerado y estructura variable (etiquetas de opinión, formato leído, votos de utilidad, hilos de respuestas y metadatos cambiantes). | **Documental** (MongoDB) | Agrupa la reseña completa con sus respuestas y tags en un único documento BSON. Elimina JOINs complejos y optimiza lecturas masivas sin bloqueos de tabla. |
| **Historial de lecturas y navegación** | Flujo masivo y continuo de solo inserción (*append-only*) con atributos dispares según el evento (búsquedas, clics, dispositivo, progreso). | **Documental / Series de tiempo** (MongoDB) | Ingesta masiva indexada por `timestamp` y usuario sin la sobrecarga de locks transaccionales ni claves foráneas. |
| **Configuración de interfaz y carrito temporal** | Preferencias volátiles (tema, fuente) y carritos efímeros consultados en cada petición HTTP. | **Clave-valor** (Redis) | Acceso en memoria RAM con latencia sub-milisegundo (`user:id:cart`) y expiración automática mediante TTL. |

#### 2. Colección elegida y documento JSON de ejemplo
Se seleccionó la colección documental **`reviews`**:

```json
{
  "_id": { "$oid": "6734b1e8a9c4f21088d3a101" },
  "bookId": 3,
  "bookTitle": "1984",
  "user": {
    "userId": 2,
    "name": "Ana Pérez",
    "verifiedPurchase": true
  },
  "rating": 5,
  "readingFormat": "FISICO",
  "title": "Una distopía imprescindible y totalmente vigente",
  "comment": "La construcción del mundo y la crítica al totalitarismo te atrapan desde el primer capítulo. La edición física tiene excelente calidad de papel.",
  "tags": ["distopia", "clasico", "lectura-obligatoria", "excelente-edicion"],
  "helpfulVotes": 14,
  "replies": [
    {
      "authorName": "Librería Sapientia Logos",
      "role": "ADMIN",
      "message": "¡Muchas gracias por tu reseña, Ana! Nos alegra que disfrutaras esta edición.",
      "createdAt": "2026-11-13T08:45:00.000Z"
    }
  ],
  "createdAt": "2026-11-13T08:30:00.000Z",
  "updatedAt": "2026-11-13T08:45:00.000Z"
}
```

#### 3. Justificación de qué se queda en PostgreSQL
Las **transacciones de ventas** (`orders`, `order_items`, `order_status_history`), el **catálogo base de libros** (`books`, `categories`) y las **cuentas de clientes** (`users`, `customers`) permanecen en PostgreSQL debido a:
1. **Transacciones ACID:** Al generar o cancelar un pedido, el descuento de stock (`stock: { decrement: quantity }`) requiere confirmación inmediata (`COMMIT`) o cancelación completa (`ROLLBACK`) para evitar sobreventa o inconsistencia en inventario.
2. **Integridad referencial estricta:** Restricciones de clave foránea con `onDelete: Restrict` garantizan que no se pueda eliminar un libro o un cliente que posea órdenes de compra históricas.

---

### Hito 2 · Modelo documental de tu colección (`tag: u2-hito-2`)

- **Commit / Tag:** `2a0c7ed` · `u2-hito-2` (Frank Alvarado)
- **Documentación y código:** [`docs/u2/hito2.md`](docs/u2/hito2.md) y [`docs/u2/grupoG03.mongodb.js`](docs/u2/grupoG03.mongodb.js)
- **Evidencia:** [`docs/u2/evidencia-compass-hito2.png`](docs/u2/evidencia-compass-hito2.png)

#### 1. Workload y patrón de acceso
El análisis del grupo evidenció un patrón marcadamente **read-heavy**:
- **Lecturas masivas:** ~1 500 consultas por hora en picos de tráfico para ver reseñas por libro (`bookId`) y ~800/h para consultar calificaciones.
- **Escrituras moderadas:** ~30 reseñas nuevas al día, ~100 votos de utilidad y ~5 respuestas administrativas diarias.
- **Decisión arquitectónica:** Agrupar en la reseña todo lo que se muestra en pantalla y crear un índice sobre `bookId`.

#### 2. Decisiones de diseño documental: Embeber vs. Referenciar

| Relación | Cardinalidad | ¿Se lee junto? | ¿Cambia seguido? | ¿Crece sin límite? | Decisión técnica |
|---|---|---|---|---|---|
| Reseña → `replies` (respuestas de la librería) | 1:N | Sí, bajo la reseña | No | No (acotado a 1-3) | **Embebida** (`replies[]`) |
| Reseña → `tags` (etiquetas temáticas) | 1:N | Sí | No | No (máximo 8) | **Embebida** (`tags[]`) |
| Reseña → Autor (`user`) | N:1 | Sí | Rara vez | No | **Embebida parcial**: copia de `userId`, `name` y `verifiedPurchase`. La cuenta completa reside en PostgreSQL. |
| Reseña → Libro del catálogo | N:1 | Solo el título | Sí (precio/stock en SQL) | Sí (un libro acumula cientos de reseñas) | **Referenciada**: `bookId` numérico de PostgreSQL con copia de `bookTitle` para display. |
| Reseña → Ficha ampliada (`book_profiles`) | N:1 | Solo en ficha extendida | A veces | Sí (compartida por muchas reseñas) | **Referenciada**: Colección independiente unida mediante `$lookup`. |

#### 3. Diagrama ER de MongoDB

```mermaid
erDiagram
    REVIEWS {
        ObjectId _id PK
        int bookId FK "referencia a book_profiles y a books (PostgreSQL)"
        string bookTitle "copia para display"
        object user "embebido: userId, name, verifiedPurchase"
        int rating "1 a 5"
        string readingFormat "FISICO, DIGITAL o AUDIOLIBRO"
        string title
        string comment
        string[] tags "embebido: max 8"
        int helpfulVotes
        object[] replies "embebido: authorName, role, message, createdAt"
        date createdAt
        date updatedAt
    }
    BOOK_PROFILES {
        ObjectId _id PK
        int bookId UK "id del libro en PostgreSQL"
        string author
        string[] genres
        int pages
        string isbn
        object extras "atributos variables: idioma, premios"
    }
    BOOKS_POSTGRES {
        int id PK
        string title
        decimal price
        int stock
    }
    REVIEWS }o--|| BOOK_PROFILES : "bookId ($lookup)"
    BOOK_PROFILES ||--|| BOOKS_POSTGRES : "bookId (referencia externa)"
```

#### 4. Playground de MongoDB (`grupoG03.mongodb.js`)
El script ejecutable para MongoDB for VS Code / mongosh incluye:
1. **`createCollection` con `$jsonSchema`:**
   - `enum`: `readingFormat` restringido a `["FISICO", "DIGITAL", "AUDIOLIBRO"]`.
   - `rango`: `rating` validado con `minimum: 1` y `maximum: 5` (`multipleOf: 1`).
   - `arreglo`: `tags` configurado con `maxItems: 8`, `uniqueItems: true` y elementos de tipo `string`.
2. **Casos de prueba:**
   - 2 inserciones válidas (reseñas de *1984* y *Cien años de soledad*).
   - 2 inserciones rechazadas por schema (`rating: 6` fuera de rango y `readingFormat: "MANUSCRITO"` fuera del enum), capturando e imprimiendo el motivo de rechazo.
3. **Agregación con `$lookup` y `$unwind`:** Consulta que une `reviews` con `book_profiles` por `bookId` para reconstruir la ficha integral del libro con sus opiniones.

#### 5. Evidencia del Hito 2

![MongoDB Compass: Fichas de libros insertadas en el Playground](docs/u2/evidencia-compass-hito2.png)

---

### Hito 3 · Modelo Mongoose y POST en capas (`tag: u2-hito-3`)

- **Commits / Tag:** `dc3dac7`, `c63180a` · `u2-hito-3` (Jose Reinoso)
- **Documentación y código:** [`docs/u2/hito3.md`](docs/u2/hito3.md), [`src/db/mongo.js`](src/db/mongo.js), [`src/models/bookReview.js`](src/models/bookReview.js)
- **Colección Postman:** [`postman/G03_LabU2_Hito3.postman_collection.json`](postman/G03_LabU2_Hito3.postman_collection.json)
- **Evidencias:** `docs/u2/evidencia-compass-hito3.png`, `docs/u2/evidencia-postman-hito3-1.png`, `docs/u2/evidencia-postman-hito3-2.png`

#### 1. Conexión dual robusta
En [`src/db/mongo.js`](src/db/mongo.js) se conecta Mongoose 9 sin opciones obsoletas:
```javascript
const mongoose = require("mongoose");
const connectMongo = async () => {
  if (!process.env.MONGODB_URI) throw new Error("Falta la variable MONGODB_URI");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB conectado");
};
module.exports = connectMongo;
```
En [`src/server.js`](src/server.js), el servidor inicia `app.listen()` **únicamente si ambas conexiones (PostgreSQL vía Prisma y MongoDB vía Mongoose) son exitosas**. Si cualquiera falla, el proceso aborta con código 1.

#### 2. Esquema Mongoose (`src/models/bookReview.js`)
Implementa las directrices de Mongoose 9.11.4:
- **`required` con mensaje:** En `bookId`, `bookTitle`, `user.userId`, `user.name`, `rating`, `readingFormat` y `comment`.
- **`enum` con mensaje:** `readingFormat: ["FISICO", "DIGITAL", "AUDIOLIBRO"]`.
- **Rango y límites con mensaje:** `rating` (1 a 5), `comment` (10 a 2 000 caracteres), `title` (máx. 120).
- **`match` regex:** `user.name` valida caracteres alfabéticos, espacios, apóstrofes y guiones.
- **Validadores propios con `validator`:** Verificación de enteros estrictos para IDs y control de hasta 8 tags con formato y longitud válidos.
- **Campo Virtual `stars`:**
  ```javascript
  bookReviewSchema.virtual("stars").get(function () {
    return `${this.rating} de 5`;
  });
  ```
  Se serializa en las respuestas JSON (`toJSON: { virtuals: true }`) sin persistirse en la base de datos.
- **Middleware Mongoose `pre("validate")`:**
  ```javascript
  bookReviewSchema.pre("validate", function () {
    if (this.tags && Array.isArray(this.tags)) {
      this.tags = [...new Set(this.tags.map((t) => t.trim().toLowerCase()))];
    }
  });
  ```
  Opera sobre `this` **sin invocar `next()`** (eliminado en Mongoose 9), normalizando etiquetas a minúsculas y eliminando duplicados.

#### 3. Arquitectura en capas: `POST /api/book-reviews`
El recurso queda montado bajo `/api/book-reviews` en [`src/routes/index.js`](src/routes/index.js) respetando la separación de responsabilidades:
- **Ruta ([`src/routes/bookReview.routes.js`](src/routes/bookReview.routes.js)):** Define el endpoint y vincula con el controlador.
- **Controlador ([`src/controllers/bookReview.controller.js`](src/controllers/bookReview.controller.js)):** Recibe la petición, delega al servicio y ante un `ValidationError` formatea la respuesta en un código `400 Bad Request` con arreglo de errores por campo:
  ```json
  {
    "message": "Datos inválidos",
    "errors": [
      { "field": "rating", "message": "La calificación es obligatoria" },
      { "field": "readingFormat", "message": "El formato de lectura debe ser FISICO, DIGITAL o AUDIOLIBRO" }
    ]
  }
  ```
- **Servicio ([`src/services/bookReview.service.js`](src/services/bookReview.service.js)):** Filtra campos permitidos (*whitelist*) y ejecuta `BookReview.create(data)`.
- **Modelo ([`src/models/bookReview.js`](src/models/bookReview.js)):** Aplica validaciones de esquema, virtuals y hooks antes de persistir en la colección `reviews`.

#### 4. Pruebas automatizadas en Postman
La colección [`postman/G03_LabU2_Hito3.postman_collection.json`](postman/G03_LabU2_Hito3.postman_collection.json) ejecuta 3 peticiones con **16 de 16 aserciones aprobadas (0 fallos)**:
1. **POST válido:** Responde `201 Created` con el documento persistido, `_id`, virtual `stars` (`"5 de 5"`) y etiquetas normalizadas.
2. **POST body vacío:** Responde `400 Bad Request` validando los mensajes de todos los campos obligatorios.
3. **POST con datos inválidos:** Responde `400 Bad Request` verificando mensajes por campo para enum incorrecto, calificación fuera de rango, nombre con caracteres prohibidos y exceso de etiquetas.

#### 5. Evidencias del Hito 3

**Ejecución de la colección Postman (16 aserciones aprobadas, 0 fallos):**

![Postman: 16 aserciones aprobadas en el Hito 3](docs/u2/evidencia-postman-hito3-1.png)

![Postman: Formato y mensajes de error por campo](docs/u2/evidencia-postman-hito3-2.png)

**Inspección en MongoDB Compass (colección `libreria.reviews` con documento y etiquetas normalizadas):**

![MongoDB Compass: Documento de reseña persistido por Mongoose](docs/u2/evidencia-compass-hito3.png)

---

## 4. Aporte de cada Integrante (Unidad 2 · Hitos 1 a 3)

| Integrante | Rol en Unidad 2 | Hito a cargo | Tag en Git | Aporte técnico específico |
|---|---|---|---|---|
| **Yostin Sisalema** | Integrante 1 | **Hito 1** | `u2-hito-1` | • Análisis comparativo NoSQL vs. Relacional ([`docs/u2/hito1.md`](docs/u2/hito1.md)).<br>• Justificación técnica para trasladar `reviews` a MongoDB y preservar ventas/inventario en PostgreSQL con transacciones ACID.<br>• Diseño del documento JSON modelo para la colección documental. |
| **Frank Alvarado** | Integrante 2 | **Hito 2** | `u2-hito-2` | • Análisis cuantitativo de Workload (patrón *read-heavy* de ~1500 lecturas/h).<br>• Matriz de decisiones de embebido (`replies[]`, `tags[]`) vs. referencia (`bookId`).<br>• Diagrama ER documental en Mermaid.<br>• Implementación del script [`docs/u2/grupoG03.mongodb.js`](docs/u2/grupoG03.mongodb.js) con `$jsonSchema` (enum, rango, array), inserts y `$lookup` con `$unwind`. |
| **Jose Reinoso** | Integrante 3 | **Hito 3** | `u2-hito-3` | • Configuración del ODM Mongoose 9 y conexión dual en [`src/db/mongo.js`](src/db/mongo.js) y [`src/server.js`](src/server.js).<br>• Modelo [`src/models/bookReview.js`](src/models/bookReview.js) con validadores, virtual `stars` y hook `pre("validate")` sin `next`.<br>• Arquitectura en capas para `POST /api/book-reviews` con formateador de `ValidationError` (400).<br>• Colección Postman de 16 aserciones y capturas de evidencia. |

## 5. Uso de Inteligencia Artificial

- **Herramientas consultadas:** Claude (Anthropic) y Gemini (Google), a través de sus plataformas web.
- **Para qué se utilizaron:**
  - Consulta y resolución de dudas técnicas puntuales sobre la sintaxis de **Mongoose 9**, específicamente la eliminación del callback `next()` en hooks de esquema (`pre("validate")`) y el cambio en la firma de conexión `mongoose.connect()`.
  - Revisión y depuración de errores de validación BSON al construir el validador `$jsonSchema` en el playground de MongoDB (como la aplicación de `multipleOf: 1` para simular enteros en campos numéricos y la restricción de arreglos sin duplicados con `uniqueItems: true`).
  - Apoyo en la formulación de expresiones regulares (`match`) para permitir caracteres válidos en nombres (tildes, espacios, apóstrofes).
- **Qué realizó y verificó el equipo:**
  - El grupo definió la arquitectura de capas, el diseño del modelo documental de reseñas y la delimitación del núcleo relacional.
  - La lógica del controlador, servicio y modelo fue escrita e integrada directamente por los integrantes.
  - Se ejecutaron y verificaron manualmente las 16 aserciones de la colección de Postman y la persistencia de documentos en MongoDB Compass.
