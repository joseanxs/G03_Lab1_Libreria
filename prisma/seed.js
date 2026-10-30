require("dotenv").config();
const prisma = require("../src/db/prisma");
const bcrypt = require("bcryptjs");

async function main() {
    // 1. Limpieza con reinicio de secuencias de autoincrement (PostgreSQL)
    await prisma.$executeRawUnsafe(
        "TRUNCATE TABLE users, customers, libros, categorias, orders, order_items, reviews, order_status_history RESTART IDENTITY CASCADE;"
    );

    // 2. Categorías (Taller B: relación N:M con Book)
    const novela = await prisma.category.create({
        data: { name: "Novela", description: "Narrativa de ficción de largo aliento", aisle: "A1", active: true }
    });
    const misterio = await prisma.category.create({
        data: { name: "Misterio", description: "Novelas policiales y de detectives", aisle: "B2", active: true }
    });
    const clasicos = await prisma.category.create({
        data: { name: "Clásicos", aisle: "C3", active: true }
    });

    // 3. Catálogo de libros con categorías N:M conectadas
    const libro1 = await prisma.book.create({
        data: {
            title: "Romeo y Julieta",
            author: "William Shakespeare",
            price: 10.5,
            available: true,
            stock: 12,
            categories: { connect: [{ id: clasicos.id }] },
        },
    });
    const libro2 = await prisma.book.create({
        data: {
            title: "Cien años de soledad",
            author: "Gabriel García Márquez",
            price: 15,
            available: true,
            stock: 8,
            categories: { connect: [{ id: novela.id }, { id: clasicos.id }] },
        },
    });
    const libro3 = await prisma.book.create({
        data: {
            title: "1984",
            author: "George Orwell",
            price: 13.5,
            available: true,
            stock: 20,
            categories: { connect: [{ id: novela.id }] },
        },
    });
    const libro4 = await prisma.book.create({
        data: {
            title: "Los sabuesos de Baskerville",
            author: "Arthur Conan Doyle",
            price: 22,
            available: false,
            stock: 0,
            categories: { connect: [{ id: misterio.id }] },
        },
    });

    // 4. Usuarios con perfil (1:1)
    const admin = await prisma.user.create({
        data: {
            email: "admin@libreria.com",
            password: await bcrypt.hash("Admin123*", 10),
            name: "Administración",
            role: "ADMIN",
        },
    });
    const ana = await prisma.user.create({
        data: {
            email: "ana@correo.com",
            password: await bcrypt.hash("Ana12345*", 10),
            name: "Ana Pérez",
            role: "USER",
            customer: {
                create: { fullName: "Ana Pérez", email: "ana@correo.com", phone: "0991234567" },
            },
        },
        include: { customer: true },
    });

    // 5. Pedidos con ítems y trazabilidad de historial (Taller C)
    // Pedido 1: DELIVERED (para cumplir el reto de reseñas en Taller A)
    const pedidoEntregado = await prisma.order.create({
        data: {
            customerId: ana.customer.id,
            status: "DELIVERED",
            total: 27.0,
            items: {
                create: [
                    { bookId: libro3.id, quantity: 2, unitPrice: 13.5 },
                ],
            },
            history: {
                create: [
                    {
                        fromStatus: "PENDING",
                        toStatus: "DELIVERED",
                        note: "Pedido entregado",
                        changedById: admin.id,
                    },
                ],
            },
        },
    });

    // Pedido 2: PENDING (para probar flujo de estados y transiciones en Taller C)
    const pedidoPendiente = await prisma.order.create({
        data: {
            customerId: ana.customer.id,
            status: "PENDING",
            total: 10.5,
            items: {
                create: [
                    { bookId: libro1.id, quantity: 1, unitPrice: 10.5 },
                ],
            },
            history: {
                create: [
                    {
                        fromStatus: "PENDING",
                        toStatus: "PENDING",
                        note: "Pedido pendiente de confirmación",
                        changedById: ana.id,
                    },
                ],
            },
        },
    });

    // 6. Reseñas de ejemplo (Taller A)
    await prisma.review.createMany({
        data: [
            { rating: 5, comment: "Una distopía imprescindible", userId: ana.id, bookId: libro3.id },
            { rating: 4, comment: "Muy actual, aunque algo larga", userId: admin.id, bookId: libro3.id },
            { rating: 5, comment: "Una obra de arte clásica", userId: ana.id, bookId: libro1.id },
        ],
    });

    console.log(
        `Seed listo: ${await prisma.book.count()} libros, ${await prisma.category.count()} categorías, ${await prisma.user.count()} usuarios, ${await prisma.order.count()} pedidos, ${await prisma.review.count()} reseñas`
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
