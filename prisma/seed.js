require("dotenv").config();
const prisma = require("../src/db/prisma");
const bcrypt = require("bcryptjs");

async function main() {

    // borra todo lo que hay en la base de datos
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.book.deleteMany();
    await prisma.category.deleteMany();

    // 2. Categorías y catálogo (N:M)
    const novela = await prisma.category.create({
        data: { name: "Novela", description: "Narrativa de ficción de largo aliento", aisle: "A1", active: true }
    });
    const misterio = await prisma.category.create({
        data: { name: "Misterio", description: "Novelas policiales y de detectives", aisle: "B2", active: true }
    });
    const clasicos = await prisma.category.create({
        data: { name: "Clásicos", aisle: "C3", active: true }
    });

    // createMany no admite relaciones: cada libro se crea con create + connect
    await prisma.book.create({
        data: {
            title: "Romeo y Julieta",
            author: "William Shakespeare",
            price: 10.5,
            available: true,
            stock: 12,
            categories: { connect: { id: clasicos.id } },
        },
    });
    await prisma.book.create({
        data: {
            title: "Cien años de soledad",
            author: "Gabriel García Márquez",
            price: 15,
            available: true,
            stock: 8,
            categories: { connect: { id: novela.id } },
        },
    });
    await prisma.book.create({
        data: {
            title: "1984",
            author: "George Orwell",
            price: 13.5,
            available: true,
            stock: 20,
            categories: { connect: { id: novela.id } },
        },
    });
    await prisma.book.create({
        data: {
            title: "Los sabuesos de Baskerville",
            author: "Arthur Conan Doyle",
            price: 22,
            available: false,
            stock: 0,
            categories: { connect: { id: misterio.id } },
        },
    });

    // 3. Usuarios con perfil (1:1)
    await prisma.user.create({
        data: { email: "admin@libreria.com", password: await bcrypt.hash("Admin123*", 10), name: "Administración", role: "ADMIN" },
    });
    const ana = await prisma.user.create({
        data: {
            email: "ana@correo.com",
            password: await bcrypt.hash("Ana12345*", 10),
            name: "Ana Torres",
            customer: { create: { fullName: "Ana Torres", email: "ana@correo.com", phone: "0991234567" } },
        },
        include: { customer: true },
    });

    // 4. Un pedido de ejemplo (1:N y N:M)
    const libro = await prisma.book.findUnique({ where: { title: "1984" } });
    await prisma.order.create({
        data: {
            customerId: ana.customer.id,
            total: 27,
            status: "DELIVERED",
            items: { create: [{ bookId: libro.id, quantity: 2, unitPrice: libro.price }] },
        },
    });

    console.log(
        `Seed listo: ${await prisma.book.count()} libros, ${await prisma.category.count()} categorías, ${await prisma.user.count()} usuarios, ${await prisma.order.count()} pedidos`
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());