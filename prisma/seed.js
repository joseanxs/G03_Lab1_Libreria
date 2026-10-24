require("dotenv").config();
const prisma = require("../src/db/prisma");

async function main() {
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.book.deleteMany();
    await prisma.category.deleteMany();

    await prisma.book.createMany({
        data: [
            { title: "Romeo y Julieta", author: "William Shakespeare", price: 10.5, available: true, stock: 12 },
            { title: "Cien años de soledad", author: "Gabriel García Márquez", price: 15, available: true, stock: 8 },
            { title: "1984", author: "George Orwell", price: 13.5, available: true, stock: 20 },
            { title: "Los sabuesos de Baskerville", author: "Arthur Conan Doyle", price: 22, available: false, stock: 0 },
        ],
    });

    await prisma.category.createMany({
        data: [
            { name: "Novela", description: "Narrativa de ficción de largo aliento", aisle: "A1", active: true },
            { name: "Misterio", description: "Novelas policiales y de detectives", aisle: "B2", active: true },
            { name: "Clásicos", aisle: "C3", active: true },
        ],
    });

    console.log(`Seed listo → libros: ${await prisma.book.count()} · categorías: ${await prisma.category.count()}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());