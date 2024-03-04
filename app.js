const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// NOTE: not found middleware, sending HTML not a good-practice
app.all('*', (req, res, next) => {
    const err = new AppError(`Cannot find URL: ${req.originalUrl}`, 404);

    next(err);
});

app.use(globalErrorHandler);

module.exports = app;
