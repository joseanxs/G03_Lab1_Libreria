// TODO Paso 3: registra hora, verbo y ruta de cada petición (diapositiva «Los middlewares…»)
// Reto opcional: registra también el código de estado y la duración usando res.on("finish", ...)


const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const start = Date.now();

    console.log(
        `[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`
    );

    res.on("finish", () => {
        const duration = Date.now() - start;

        console.log(
            `[${timestamp}] Response: ${res.statusCode} - ${duration}ms`
        );
    });

    next();
};

module.exports = logger;



