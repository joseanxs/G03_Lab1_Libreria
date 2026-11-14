const BookReview = require("../models/bookReview");

// Campos que el cliente puede enviar al crear (helpfulVotes y replies se llenan por otras operaciones)
const CAMPOS_PERMITIDOS = ["bookId", "bookTitle", "user", "rating", "readingFormat", "title", "comment", "tags"];

const pick = (origen = {}) =>
  Object.fromEntries(CAMPOS_PERMITIDOS.filter((c) => origen[c] !== undefined).map((c) => [c, origen[c]]));

const create = async (body) => BookReview.create(pick(body));

module.exports = { create };
