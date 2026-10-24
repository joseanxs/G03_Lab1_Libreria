// SERVER: solo levanta el servidor. La configuración de Express vive en app.js
require("dotenv").config();
const app = require("./app");
const prisma = require("./db/prisma");

const PORT = process.env.PORT || 3000;


const start = async () => {
  await prisma.$connect();
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
};

start();