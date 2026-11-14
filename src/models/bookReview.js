const mongoose = require("mongoose");
const validator = require("validator");

const FORMATS = ["FISICO", "DIGITAL", "AUDIOLIBRO"];

const esEntero = {
  validator: Number.isInteger,
  message: (props) => `${props.value} no es un número entero`,
};

const replySchema = new mongoose.Schema(
  {
    authorName: { type: String, required: [true, "El autor de la respuesta es obligatorio"], trim: true },
    role: {
      type: String,
      required: [true, "El rol de la respuesta es obligatorio"],
      enum: { values: ["ADMIN", "CLIENTE"], message: "El rol '{VALUE}' no es válido (use ADMIN o CLIENTE)" },
    },
    message: {
      type: String,
      required: [true, "El mensaje de la respuesta es obligatorio"],
      trim: true,
      minlength: [1, "El mensaje de la respuesta no puede estar vacío"],
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const bookReviewSchema = new mongoose.Schema(
  {
    // referencia al libro de PostgreSQL
    bookId: {
      type: Number,
      required: [true, "El libro es obligatorio"],
      min: [1, "El id del libro debe ser mayor o igual a 1"],
      validate: esEntero,
    },
    // copia del título solo para mostrar sin consultar PostgreSQL
    bookTitle: {
      type: String,
      required: [true, "El título del libro es obligatorio"],
      trim: true,
      minlength: [1, "El título del libro no puede estar vacío"],
      maxlength: [200, "El título del libro admite máximo 200 caracteres"],
    },
    // copia mínima del autor (el usuario completo sigue en PostgreSQL)
    user: {
      userId: {
        type: Number,
        required: [true, "El id del usuario es obligatorio"],
        min: [1, "El id del usuario debe ser mayor o igual a 1"],
        validate: esEntero,
      },
      name: {
        type: String,
        required: [true, "El nombre del usuario es obligatorio"],
        trim: true,
        minlength: [2, "El nombre debe tener al menos 2 caracteres"],
        maxlength: [80, "El nombre admite máximo 80 caracteres"],
        match: [/^\p{L}[\p{L}\s.'-]*$/u, "El nombre solo puede tener letras, espacios, punto, apóstrofe o guion"],
      },
      verifiedPurchase: { type: Boolean, default: false },
    },
    rating: {
      type: Number,
      required: [true, "La calificación es obligatoria"],
      min: [1, "La calificación mínima es 1"],
      max: [5, "La calificación máxima es 5"],
      validate: esEntero,
    },
    readingFormat: {
      type: String,
      required: [true, "El formato de lectura es obligatorio"],
      enum: { values: FORMATS, message: "El formato '{VALUE}' no es válido (use FISICO, DIGITAL o AUDIOLIBRO)" },
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, "El título de la reseña admite máximo 120 caracteres"],
    },
    comment: {
      type: String,
      required: [true, "El comentario es obligatorio"],
      trim: true,
      minlength: [10, "El comentario debe tener al menos 10 caracteres"],
      maxlength: [2000, "El comentario admite máximo 2000 caracteres"],
    },
    tags: {
      type: [String],
      default: [],
      validate: [
        { validator: (arr) => arr.length <= 8, message: "Se permiten máximo 8 etiquetas" },
        {
          validator: (arr) =>
            arr.every((t) => validator.isLength(t, { min: 2, max: 30 }) && validator.matches(t, /^[\p{Ll}\p{N}]+(-[\p{Ll}\p{N}]+)*$/u)),
          message: "Cada etiqueta debe tener 2 a 30 caracteres: letras minúsculas, números y guiones (ej. lectura-obligatoria)",
        },
      ],
    },
    helpfulVotes: { type: Number, default: 0, min: [0, "Los votos no pueden ser negativos"] },
    replies: { type: [replySchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
    id: false,
    collection: "reviews",
    toJSON: { virtuals: true },
  }
);

bookReviewSchema.virtual("stars").get(function () {
  return `${this.rating || 0} de 5`;
});

bookReviewSchema.pre("validate", function () {
  if (Array.isArray(this.tags)) {
    this.tags = [...new Set(this.tags.map((t) => String(t).trim().toLowerCase()))];
  }
});

module.exports = mongoose.model("BookReview", bookReviewSchema);
