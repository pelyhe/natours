const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

// get duplicate field value with regex
const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue.name;

    const message = `Duplicate field value:  ${value}`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Validation error: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTValidationError = () => {
    const message = `Invalid token, please log in again!`;
    return new AppError(message, 401);
};

const handleTokenExpired = () => {
    const message = `Your token has expired, please log in again!`;
    return new AppError(message, 401);
};

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // Unknown error, dont want to leak details to client (eg. third-party)
        // console.error(`ERROR : ${err}`);

        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
        });
    }
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };

        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (err.code === 11000) error = handleDuplicateFieldsDB(error);
        if (err.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError')
            error = handleJWTValidationError();
        if (err.name === 'TokenExpiredError') error = handleTokenExpired();

        sendErrorProd(error, res);
    }
};
