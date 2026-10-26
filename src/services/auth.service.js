const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// SERVICIO de autenticación: reglas, hash de contraseñas y emisión del JWT

// Campos que se devuelven del usuario: nunca la contraseña
const publicUser = { id: true, email: true, name: true, role: true, customer: true };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Registro: crea User + Customer (1:1) en una sola escritura anidada
const register = async ({ email, password, name, phone }) => {
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()))
    throw new HttpError(400, "El email no es válido");
  if (typeof password !== "string" || password.length < 8)
    throw new HttpError(400, "La contraseña debe tener al menos 8 caracteres");
  if (typeof name !== "string" || name.trim().length < 2)
    throw new HttpError(400, "El nombre debe tener al menos 2 caracteres");

  const cleanEmail = email.trim().toLowerCase();
  const hash = await bcrypt.hash(password, 10);

  // Email repetido → P2002 → errorHandler responde 409
  return prisma.user.create({
    data: {
      email: cleanEmail,
      password: hash,
      name: name.trim(),
      customer: { create: { fullName: name.trim(), email: cleanEmail, phone } },
    },
    select: publicUser, // la contraseña no va a salr
  });
};

// Login: mismo mensaje 401 si el correo no existe o la clave no coincide
const login = async ({ email, password }) => {
  if (typeof email !== "string" || typeof password !== "string")
    throw new HttpError(400, "Envía email y password");

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw new HttpError(401, "Credenciales incorrectas");

  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "4h",
  });
};

const getProfile = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, select: publicUser });
  if (!user) throw new HttpError(404, "Usuario no encontrado");
  return user;
};

module.exports = { register, login, getProfile };
