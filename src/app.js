const express = require("express");
const routes = require("./routes");
const logger = require("./middlewares/logger");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use(logger);

// Soporte de CORS para peticiones desde el cliente web (Vite / React)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.get("/", (req, res) => res.json({ api: "Lab 2 · Percistencia con prisma", estado: "ok" }));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
