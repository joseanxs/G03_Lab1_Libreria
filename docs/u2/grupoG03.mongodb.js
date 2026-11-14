    // Hito 2 · Grupo 03 · Librería Sapientia Logos
    // Playground de MongoDB for VS Code (o mongosh): ejecútalo con "Play" conectado a tu servidor local.

    use("libreria_lab"); // base de laboratorio, separada de "libreria" (la que usa la API en el hito 3)

    // Empezamos limpios para poder repetir el script
    db.reviews.drop();
    db.book_profiles.drop();

    // ─────────────────────────────────────────────────────────────
    // 1. Colección reviews con validación $jsonSchema
    // ─────────────────────────────────────────────────────────────
    db.createCollection("reviews", {
    validator: {
        $jsonSchema: {
        bsonType: "object",
        required: ["bookId", "bookTitle", "user", "rating", "readingFormat", "comment", "createdAt"],
        properties: {
            bookId: { bsonType: "number", minimum: 1, multipleOf: 1, description: "id del libro en PostgreSQL" },
            bookTitle: { bsonType: "string", minLength: 1 },
            user: {
            bsonType: "object",
            required: ["userId", "name"],
            properties: {
                userId: { bsonType: "number", minimum: 1, multipleOf: 1 },
                name: { bsonType: "string", minLength: 1 },
                verifiedPurchase: { bsonType: "bool" },
            },
            },
            // RANGO: entero entre 1 y 5
            rating: { bsonType: "number", minimum: 1, maximum: 5, multipleOf: 1, description: "entero de 1 a 5" },
            // ENUM: solo tres formatos permitidos
            readingFormat: { enum: ["FISICO", "DIGITAL", "AUDIOLIBRO"], description: "formato en que se leyó" },
            title: { bsonType: "string", maxLength: 120 },
            comment: { bsonType: "string", minLength: 10, maxLength: 2000 },
            // ARREGLO: strings, máximo 8, sin repetidos
            tags: { bsonType: "array", maxItems: 8, uniqueItems: true, items: { bsonType: "string" } },
            helpfulVotes: { bsonType: "number", minimum: 0, multipleOf: 1 },
            replies: {
            bsonType: "array",
            items: {
                bsonType: "object",
                required: ["authorName", "role", "message", "createdAt"],
                properties: {
                authorName: { bsonType: "string" },
                role: { enum: ["ADMIN", "CLIENTE"] },
                message: { bsonType: "string", minLength: 1 },
                createdAt: { bsonType: "date" },
                },
            },
            },
            createdAt: { bsonType: "date" },
            updatedAt: { bsonType: "date" },
        },
        },
    },
    validationLevel: "strict",
    validationAction: "error",
    });

    db.reviews.createIndex({ bookId: 1, createdAt: -1 }); // lectura principal: reseñas de un libro

    // Colección referenciada para el $lookup
    db.createCollection("book_profiles");
    db.book_profiles.createIndex({ bookId: 1 }, { unique: true });

    // ─────────────────────────────────────────────────────────────
    // 2. Datos de apoyo (AJUSTA los bookId a libros que existan en tu tabla books de PostgreSQL)
    // ─────────────────────────────────────────────────────────────
    db.book_profiles.insertMany([
    {
        bookId: 3,
        author: "George Orwell",
        genres: ["distopia", "novela"],
        pages: 328,
        isbn: "9780451524935",
        extras: { idioma: "es", premios: [] },
    },
    {
        bookId: 7,
        author: "Gabriel García Márquez",
        genres: ["realismo-magico", "novela"],
        pages: 471,
        isbn: "9780307474728",
        extras: { idioma: "es", premios: ["Nobel de Literatura 1982"] },
    },
    ]);

    // ─────────────────────────────────────────────────────────────
    // 3. Inserts: 2 válidos y 2 rechazados, con el campo que falló
    // ─────────────────────────────────────────────────────────────
    function intentarInsertar(etiqueta, doc) {
    try {
        const r = db.reviews.insertOne(doc);
        print(`✅ ${etiqueta}: insertado (_id: ${r.insertedId})`);
    } catch (err) {
        print(`❌ ${etiqueta}: RECHAZADO (${err.codeName ?? err.code})`);
        const reglas = err.errInfo?.details?.schemaRulesNotSatisfied ?? [];
        reglas.forEach((regla) => {
        (regla.propertiesNotSatisfied ?? []).forEach((p) => {
            print(`   → campo que falló: ${p.propertyName}`);
        });
        (regla.missingProperties ?? []).forEach((m) => print(`   → campo obligatorio ausente: ${m}`));
        });
    }
    }

    // VÁLIDO 1
    intentarInsertar("Válido 1 (1984, Ana)", {
    bookId: 3,
    bookTitle: "1984",
    user: { userId: 2, name: "Ana Pérez", verifiedPurchase: true },
    rating: 5,
    readingFormat: "FISICO",
    title: "Una distopía imprescindible y totalmente vigente",
    comment: "La construcción del mundo y la crítica al totalitarismo te atrapan desde el primer capítulo.",
    tags: ["distopia", "clasico", "lectura-obligatoria"],
    helpfulVotes: 14,
    replies: [
        {
        authorName: "Librería Sapientia Logos",
        role: "ADMIN",
        message: "¡Muchas gracias por tu reseña, Ana!",
        createdAt: new Date("2026-11-13T08:45:00Z"),
        },
    ],
    createdAt: new Date("2026-11-13T08:30:00Z"),
    updatedAt: new Date("2026-11-13T08:45:00Z"),
    });

    // VÁLIDO 2
    intentarInsertar("Válido 2 (Cien años de soledad, Luis)", {
    bookId: 7,
    bookTitle: "Cien años de soledad",
    user: { userId: 5, name: "Luis Andrade", verifiedPurchase: true },
    rating: 4,
    readingFormat: "DIGITAL",
    comment: "Una historia familiar enorme; al inicio cuesta seguir los nombres, pero vale la pena.",
    tags: ["realismo-magico", "familia"],
    helpfulVotes: 3,
    replies: [],
    createdAt: new Date("2026-11-13T10:00:00Z"),
    });

    // RECHAZADO 1: viola el RANGO (rating = 9)
    intentarInsertar("Rechazado 1 (rating fuera de rango)", {
    bookId: 3,
    bookTitle: "1984",
    user: { userId: 2, name: "Ana Pérez", verifiedPurchase: true },
    rating: 9,
    readingFormat: "FISICO",
    comment: "Esta reseña tiene una calificación imposible.",
    tags: ["prueba"],
    createdAt: new Date(),
    });

    // RECHAZADO 2: viola el ENUM (readingFormat = "KINDLE")
    intentarInsertar("Rechazado 2 (formato fuera del enum)", {
    bookId: 7,
    bookTitle: "Cien años de soledad",
    user: { userId: 5, name: "Luis Andrade", verifiedPurchase: false },
    rating: 3,
    readingFormat: "KINDLE",
    comment: "El formato de lectura no está permitido por el esquema.",
    tags: ["prueba"],
    createdAt: new Date(),
    });

    // ─────────────────────────────────────────────────────────────
    // 4. $lookup entre dos colecciones: reviews → book_profiles
    // ─────────────────────────────────────────────────────────────
    db.reviews.aggregate([
    {
        $lookup: {
        from: "book_profiles",
        localField: "bookId",
        foreignField: "bookId",
        as: "book",
        },
    },
    { $unwind: "$book" }, // como bookId es único en book_profiles, cada reseña trae 1 ficha
    {
        $project: {
        _id: 0,
        bookTitle: 1,
        rating: 1,
        "user.name": 1,
        "book.author": 1,
        "book.genres": 1,
        "book.pages": 1,
        },
    },
    ]);