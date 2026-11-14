require("dotenv").config();
const app = require("./app");
const prisma = require("./db/prisma");
const connectMongo = require("./db/mongo");

const PORT = process.env.PORT || 3000;

const start = async () => {
  if (!process.env.JWT_SECRET) throw new Error("Falta la variable JWT_SECRET");
  await prisma.$connect();
  console.log("PostgreSQL conectado");
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error("No se pudo iniciar el servidor:", err.message);
  process.exit(1);
});