# Modelo ER del emprendimiento · Grupo GXX

> Actividad 3 de la sesión 4. Es la base del `schema.prisma` del Lab 2 y de las relaciones del Lab 3.

## Diagrama

Edítalo en https://mermaid.live (GitHub lo muestra como diagrama). Reemplaza el ejemplo por tus entidades.

```mermaid
erDiagram
    CATEGORIES ||--o{ BOOKS : "1:N clasifica"
    SALES ||--|{ SALE_ITEMS : "1:N detalla"
    BOOKS ||--o{ SALE_ITEMS : "1:N se_vende_en"

    BOOKS {
        int id PK "SERIAL NOT NULL"
        string titulo "NOT NULL"
        string author "NOT NULL"
        float price "NOT NULL > 0"
        boolean available "DEFAULT true"
        int stock "DEFAULT 0"
        datetime created_at "DEFAULT now()"
        int category_id FK "NULL"
    }

    CATEGORIES {
        int id PK "SERIAL NOT NULL"
        string name "NOT NULL"
        string description "NULL"
        string aisle "NOT NULL"
        boolean active "DEFAULT true"
    }

    SALES {
        int id PK "SERIAL NOT NULL"
        string invoice_code "NOT NULL"
        string customer_name "NOT NULL"
        string customer_email "NULL"
        float total "NOT NULL >= 0"
        datetime sale_date "DEFAULT now()"
    }

    SALE_ITEMS {
        int id PK "SERIAL NOT NULL"
        int quantity "NOT NULL > 0"
        float unit_price "NOT NULL > 0"
        int sale_id FK "NOT NULL"
        int book_id FK "NOT NULL"
    }
```

## Entidades

| Entidad | Atributos (tipo) | Clave primaria | Únicos / obligatorios / reglas |
|---|---|---|---|
| BOOKS| id (PK), titulo, author, price, available, creado_en, category_id FK |PK| UK| |
| CATEGORIES| id (PK), name, description, aisle, active |PK| UK| |
| SALES| id (PK), invoice_code, customer_name, customer_email, total, sale_date |PK| UK| |
| SALE_ITEMS| id (PK), quantity, unit_price, sale_id FK, book_id FK |PK| UK| |

## Relaciones

| Entidad A | Cardinalidad (1:1, 1:N, N:M) | Entidad B | Ejemplo en una frase |
|---|---|---|---|
| CATEGORIES | 1:N | BOOKS | una categoría puede tener muchos libros |
| BOOKS | 1:N | SALE_ITEMS | un libro puede estar en muchos items de venta |
| SALES | 1:N | SALE_ITEMS | una venta puede tener muchos items |

## ¿Qué se implementa en cada laboratorio?

- **Lab 2:** la entidad principal y una segunda entidad en `schema.prisma`, sin relaciones.
- **Lab 3:** las relaciones y las entidades restantes.
