const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");
const HttpError = require("../utils/httpError");

// SERVICIO de autenticación: reglas, hash de contraseñas y emisión del JWT

// Campos que se devuelven del usuario: nunca la contraseña
const publicUser = { id: true, email: true, name: true, role: true, customer: true };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hash de relleno: si el correo no existe, login compara contra este hash y tarda lo mismo
// que con un correo real. Así no se puede descubrir qué correos están registrados.
const DUMMY_HASH = bcrypt.hashSync("clave-que-nadie-usa", 10);

// Registro: crea User + Customer (1:1) en una sola escritura anidada
const register = async ({ email, password, name, phone }) => {
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim()) || email.trim().length > 120)
    throw new HttpError(400, "El email no es válido");
  // bcrypt solo usa los primeros 72 bytes de la clave
  if (typeof password !== "string" || password.length < 8 || password.length > 72)
    throw new HttpError(400, "La contraseña debe tener entre 8 y 72 caracteres");
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100)
    throw new HttpError(400, "El nombre debe tener entre 2 y 100 caracteres");
  if (phone != null && (typeof phone !== "string" || phone.length > 15))
    throw new HttpError(400, "El teléfono debe ser un texto de hasta 15 caracteres");

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const hash = await bcrypt.hash(password, 10);

  // El rol nunca se toma del body: todo usuario nuevo es USER (el default del schema)
  // Email repetido → P2002 → errorHandler responde 409
  return prisma.user.create({
    data: {
      email: cleanEmail,
      password: hash,
      name: cleanName,
      customer: { create: { fullName: cleanName, email: cleanEmail, phone: phone ?? undefined } },
    },
    select: publicUser, // la contraseña no sale en la respuesta
  });
};

// Login: el mismo mensaje 401 si el correo no existe o la clave no coincide
const login = async ({ email, password }) => {
  if (typeof email !== "string" || typeof password !== "string")
    throw new HttpError(400, "Envía email y password");

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  const passwordOk = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
  if (!user || !passwordOk) throw new HttpError(401, "Correo o contraseña inválidos");

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
