
const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`);
    console.error(err.stack || err.message || err);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.status || err.statusCode || 500;

    const status =
        Number.isInteger(statusCode) &&
        statusCode >= 400 &&
        statusCode <= 599
            ? statusCode
            : 500;

    const message =
        typeof err.message === "string"
            ? err.message
            : "Error interno del servidor";

    res.status(status).json({
        success: false,
        message,
        error: message
    });
};

module.exports = errorHandler;
