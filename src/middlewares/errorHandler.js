const { Prisma } = require("@prisma/client");

// Traduce los errores conocidos de Prisma a { status, error, message }
const fromPrisma = (err, req) => {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            // Valor único duplicado
            case "P2002": {
                // Prisma 7 (con adaptador) informa la restricción en meta.driverAdapterError
                const campo =
                    err.meta?.target ??
                    err.meta?.driverAdapterError?.cause?.constraint?.index ??
                    "campo único";
                return {
                    status: 409,
                    error: "Conflict",
                    message: `Ya existe un registro con ese valor único (${campo})`,
                };
            }

            // Registro no encontrado (update/delete sobre id inexistente)
            case "P2025":
                return {
                    status: 404,
                    error: "Not Found",
                    message: "Registro no encontrado",
                };

            // Violación de clave foránea
            case "P2003":
                if (req.method === "DELETE") {
                    // onDelete: Restrict → otros registros dependen de este
                    return {
                        status: 409,
                        error: "Conflict",
                        message: "No se puede eliminar: hay registros relacionados",
                    };
                }
                // POST/PUT/PATCH → la referencia enviada no existe
                return {
                    status: 400,
                    error: "Bad Request",
                    message: "La referencia enviada no existe (clave foránea inválida)",
                };

            // Se intentó romper una relación obligatoria
            case "P2014":
                return {
                    status: 409,
                    error: "Conflict",
                    message: "La operación rompe una relación obligatoria",
                };
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        return {
            status: 400,
            error: "Bad Request",
            message: "Datos con tipo o formato inválido",
        };
    }

    // JSON mal formado en el body
    if (err.type === "entity.parse.failed") {
        return { status: 400, error: "Bad Request", message: "JSON mal formado" };
    }

    return null;
};

// 404 para rutas que no existen (registrar ANTES de errorHandler)
const notFound = (req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    });
};

// Manejador de errores: 4 parámetros. Responde siempre en JSON.
const errorHandler = (err, req, res, next) => {
    if (res.headersSent) return next(err);

    const mapped = fromPrisma(err, req);

    if (mapped) {
        return res
            .status(mapped.status)
            .json({ error: mapped.error, message: mapped.message });
    }

    // Errores con status propio (401, 403, etc.) lanzados desde middlewares/controladores
    const status = err.status && err.status < 500 ? err.status : 500;

    if (status < 500) {
        return res.status(status).json({ error: "Error", message: err.message });
    }

    console.error(err);
    const body = { error: "Internal Server Error", message: "Error interno del servidor" };
    // En desarrollo se muestra el detalle; en producción, nunca
    if (process.env.NODE_ENV !== "production") body.stack = err.stack;
    res.status(500).json(body);
};

module.exports = errorHandler;
module.exports.notFound = notFound;