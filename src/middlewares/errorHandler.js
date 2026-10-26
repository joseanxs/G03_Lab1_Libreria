
/**
 * Lab 2: Middleware centralizado para el manejo de errores.
 * Traduce errores de Prisma y errores HTTP a respuestas JSON.
 */

// Errores conocidos de Prisma y su equivalente HTTP
const PRISMA_ERRORS = {
    P2002: {
        statusCode: 409,
        message: "Ya existe un registro con ese valor único",
    },
    P2025: {
        statusCode: 404,
        message: "Registro no encontrado",
    },
    P2000: {
        statusCode: 400,
        message: "Un valor excede la longitud permitida",
    },
};

// Middleware de manejo de errores de Express
const errorHandler = (err, req, res, next) => {
    // Si la respuesta ya comenzó, delegar al siguiente manejador
    if (res.headersSent) {
        return next(err);
    }

    // Identificar errores conocidos de Prisma
    const prismaError = PRISMA_ERRORS[err.code];

    // Obtener el código HTTP y validar su rango
    const candidateStatus =
        prismaError?.statusCode ??
        err.statusCode ??
        err.status ??
        500;

    const statusCode =
        Number.isInteger(candidateStatus) &&
        candidateStatus >= 400 &&
        candidateStatus <= 599
            ? candidateStatus
            : 500;

    // Evitar exponer mensajes internos de errores inesperados
    const message = prismaError?.message ??
        (statusCode < 500
            ? err.message
            : "Ocurrió un error interno del servidor");

    // Registrar información útil para depuración
    const timestamp = new Date().toISOString();

    console.error(
        `[ERROR] ${timestamp} | ${req.method} ${req.originalUrl} | ${statusCode} | ${message}`
    );

    if (err.stack) {
        console.error(err.stack);
    }

    // Respuesta uniforme para el cliente
    return res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
        }),
    });
};

module.exports = errorHandler;
