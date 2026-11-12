# Hito 1 · ¿Qué dato de nuestro emprendimiento va a NoSQL?

**Grupo:** G03  **Emprendimiento:** Librería Sapientia Logos

| Dato | ¿Por qué no encaja bien en una tabla? | Tipo NoSQL | Razón |
|---|---|---|---|
| **Reseñas y comentarios de libros** | Crece de forma acelerada y su estructura varía (calificación, comentario, etiquetas de opinión, formato leído, votos de utilidad y respuestas anidadas). En SQL requeriría múltiples tablas o columnas nulas. | **Documental** (MongoDB) | Agrupa la reseña, los metadatos del lector, las etiquetas y las respuestas en un único documento JSON/BSON, permitiendo lecturas rápidas en una sola consulta sin JOINs y evolucionando el esquema sin migraciones DDL. |
| **Historial de lecturas y eventos de navegación** | Es un flujo continuo y masivo de solo inserción (*append-only*) con atributos variables según el evento (búsquedas realizadas, clics en libros, progreso de lectura, dispositivo). | **Documental / Series de tiempo** (MongoDB) | Optimiza la ingesta de alto volumen indexada por fecha (`timestamp`) y usuario sin el costo de bloqueos transaccionales ni restricciones de clave foránea. |
| **Configuración de interfaz y carrito temporal del cliente** | Son preferencias de UI (tema oscuro/claro, tamaño de fuente, vista de catálogo) y estados efímeros que se consultan en cada petición y no necesitan persistencia relacional rígida. | **Clave-valor** (Redis) | Permite lecturas y escrituras en memoria RAM con latencia sub-milisegundo mediante una clave directa (`user:id:config` o `cart:user:id`) y expiración automática (TTL). |

**Colección elegida:** `reviews` (documental, MongoDB)

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

**Se queda en PostgreSQL:** Las **transacciones de ventas** (`orders`, `order_items`, `order_status_history`), el **catálogo e inventario de libros** (`books`, `categories`) y las **cuentas/perfiles de clientes** (`users`, `customers`).

**¿Por qué?:**
1. **Transacciones ACID en ventas e inventario:** Al crear o cancelar un pedido es indispensable descontar o restituir el `stock` del libro y registrar los ítems y el historial de estado de manera **atómica** (`COMMIT` o `ROLLBACK` inmediato si el stock es insuficiente), evitando condiciones de carrera o sobreventa.
2. **Integridad referencial y precisión contable:** El catálogo maneja precios exactos (`Decimal(10,2)`) y relaciones estrictas con `onDelete: Restrict` entre libros, ítems vendidos y clientes, garantizando que jamás se borre un libro del catálogo ni un cliente si tiene ventas históricas facturadas.
