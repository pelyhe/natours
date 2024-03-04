class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // NOTE: only send back errors we created (where isOperational is true)

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
