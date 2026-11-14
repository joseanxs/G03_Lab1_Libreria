const mongoose = require("mongoose");

const connectMongo = async () => {
  if (!process.env.MONGODB_URI) throw new Error("Falta la variable MONGODB_URI");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB conectado");
};

module.exports = connectMongo;
