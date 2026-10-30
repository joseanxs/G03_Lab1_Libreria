# Modelo ER del emprendimiento · Grupo G03 (Lab 3 + Taller)

**Emprendimiento:** Librería Sapientia Logos · **Desarrollo Web Avanzado (A0R04) · ESPE**

## Diagrama ER

```mermaid
erDiagram
    USERS ||--o| CUSTOMERS : "tiene perfil (1:1)"
    CATEGORIES }o--o{ BOOKS : "clasifica (N:M implicita)"
    CUSTOMERS ||--o{ ORDERS : "realiza (1:N)"
    ORDERS ||--|{ ORDER_ITEMS : "contiene (1:N)"
    BOOKS ||--o{ ORDER_ITEMS : "se vende en (1:N)"
    USERS ||--o{ REVIEWS : "escribe (1:N)"
    BOOKS ||--o{ REVIEWS : "recibe (1:N)"
    ORDERS ||--o{ ORDER_STATUS_HISTORY : "registra historial (1:N)"
    USERS ||--o{ ORDER_STATUS_HISTORY : "cambia estado (1:N)"

    USERS {
        int id PK "SERIAL, NOT NULL"
        string email UK "NOT NULL, VARCHAR 120"
        string password "NOT NULL, hash de bcrypt"
        string name "NOT NULL, VARCHAR 100"
        enum role "NOT NULL, USER o ADMIN, DEFAULT USER"
        datetime created_at "NOT NULL, DEFAULT now"
    }

    CUSTOMERS {
        int id PK "SERIAL, NOT NULL"
        string full_name "NOT NULL, VARCHAR 100"
        string email UK "NOT NULL, VARCHAR 120"
        string phone "NULL, VARCHAR 15"
        datetime created_at "NOT NULL, DEFAULT now"
        int user_id FK, UK "NULL, hacia users"
    }

    CATEGORIES {
        int id PK "SERIAL, NOT NULL"
        string name UK "NOT NULL, VARCHAR 80"
        string description "NULL, VARCHAR 255"
        string aisle "NOT NULL, VARCHAR 40"
        boolean active "NOT NULL, DEFAULT true"
        datetime created_at "NOT NULL, DEFAULT now"
        datetime updated_at "NOT NULL"
    }

    BOOKS {
        int id PK "SERIAL, NOT NULL"
        string titulo UK "NOT NULL, VARCHAR 80"
        string author "NOT NULL, VARCHAR 80"
        decimal price "NOT NULL, DECIMAL 10 2"
        boolean available "NOT NULL, DEFAULT true"
        int stock "NOT NULL, DEFAULT 0"
        datetime created_at "NOT NULL, DEFAULT now"
        datetime updated_at "NOT NULL"
    }

    ORDERS {
        int id PK "SERIAL, NOT NULL"
        enum status "NOT NULL, PENDING CONFIRMED DELIVERED CANCELLED, DEFAULT PENDING"
        decimal total "NOT NULL, DECIMAL 10 2"
        datetime created_at "NOT NULL, DEFAULT now"
        int customer_id FK "NOT NULL, hacia customers"
    }

    ORDER_ITEMS {
        int order_id PK, FK "NOT NULL, hacia orders"
        int book_id PK, FK "NOT NULL, hacia libros"
        int quantity "NOT NULL, mayor o igual a 1"
        decimal unit_price "NOT NULL, DECIMAL 10 2"
    }

    REVIEWS {
        int id PK "SERIAL, NOT NULL"
        smallint rating "NOT NULL, 1 a 5 estrellas"
        string comment "NULL, VARCHAR 300"
        datetime created_at "NOT NULL, DEFAULT now"
        int user_id FK "NOT NULL, hacia users"
        int book_id FK "NOT NULL, hacia libros"
    }

    ORDER_STATUS_HISTORY {
        int id PK "SERIAL, NOT NULL"
        enum from_status "NOT NULL, OrderStatus"
        enum to_status "NOT NULL, OrderStatus"
        string note "NULL, VARCHAR 200"
        datetime created_at "NOT NULL, DEFAULT now"
        int order_id FK "NOT NULL, hacia orders"
        int changed_by_id FK "NOT NULL, hacia users"
    }
```

## Entidades y Tablas

| Entidad | Tabla en PostgreSQL | Modelo Prisma | Clave primaria | Valores únicos |
|---|---|---|---|---|
| USERS | `users` | `User` | `id` | `email` |
| CUSTOMERS | `customers` | `Customer` | `id` | `email`, `user_id` |
| CATEGORIES | `categorias` | `Category` | `id` | `name` |
| BOOKS | `libros` | `Book` | `id` | `titulo` |
| ORDERS | `orders` | `Order` | `id` | ninguno |
| ORDER_ITEMS | `order_items` | `OrderItem` | `order_id` + `book_id` (compuesta) | ninguno |
| REVIEWS (Taller A) | `reviews` | `Review` | `id` | `user_id` + `book_id` (compuesta) |
| ORDER_STATUS_HISTORY (Taller C) | `order_status_history` | `OrderStatusHistory` | `id` | ninguno |

### Relaciones y Reglas Referenciales

1. **`User` - `Customer` (1:1):**
   - Lado con FK: `Customer` (`user_id` único).
   - `onDelete: Cascade` (si se elimina el usuario, se elimina su perfil de cliente).

2. **`Category` - `Book` (N:M implícita - Taller B):**
   - Prisma administra la tabla de unión `_BookToCategory`.
   - Permite que un libro tenga múltiples categorías y una categoría clasifique múltiples libros.

3. **`Customer` - `Order` (1:N):**
   - Lado con FK: `Order` (`customer_id`).
   - `onDelete: Restrict` (no se puede eliminar un cliente con pedidos históricos).

4. **`Order` - `OrderItem` - `Book` (N:M explícita):**
   - Tabla intermedia `order_items` con atributos propios (`quantity`, `unit_price`).
   - PK compuesta `[orderId, bookId]`.
   - `Order` a `OrderItem`: `onDelete: Cascade`.
   - `Book` a `OrderItem`: `onDelete: Restrict` (no se borra un libro que ya tiene ventas registradas).

5. **`User` - `Review` y `Book` - `Review` (1:N - Taller A):**
   - `@@unique([userId, bookId])`: un usuario solo puede reseñar un libro una única vez.
   - `@@index([bookId])`: acelera las consultas de listado y cálculo de promedio (`_avg`).
   - `onDelete: Cascade` en ambos extremos.

6. **`Order` - `OrderStatusHistory` y `User` - `OrderStatusHistory` (1:N - Taller C):**
   - Registra cada transición de estado en la máquina de estados.
   - `Order` a `OrderStatusHistory`: `onDelete: Cascade`.
   - `User` a `OrderStatusHistory`: `onDelete: Restrict` (preserva la autoría del cambio).
