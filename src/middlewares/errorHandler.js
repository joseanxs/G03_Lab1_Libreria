// Lab 2: códigos de error de Prisma → código HTTP
const PRISMA_ERRORS = {
    P2002: { statusCode: 409, message: "Ya existe un registro con ese valor único" },
    P2025: { statusCode: 404, message: "Registro no encontrado" },
    P2000: { statusCode: 400, message: "Un valor excede la longitud permitida" },
};

const errorHandler = (err, req, res, next) => {
    const prismaError = PRISMA_ERRORS[err.code];

    // HttpError usa err.status; se acepta también err.statusCode
    const statusCode = prismaError?.statusCode || err.statusCode || err.status || 500;
    const message = prismaError?.message || err.message || "Ocurrio un error inesperado";

    console.log(
        `[ERROR] ${new Date().toISOString()} - ${statusCode} - ${message}`,
    );
    if (err.stack) {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = errorHandler;