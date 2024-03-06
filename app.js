const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const routes = require('./routes/routes');

const app = express();
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// NOTE: security HTTP headers
app.use(helmet());

// NOTE: limits the number of maximum requests from a given IP
// NOTE: increase limit in production
const limiter = rateLimit({
    max: 100, // max # of requests
    windowMs: 60 * 60 * 1000, // in 1 hour,
    message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// NOTE: limit the size of req.body
app.use(express.json({ limit: '10kb' }));

// NOTE: data sanitization against NoSQL query injection
// NOTE: very powerful attack, important do defend against!
// filters out $s from req.body, req.query and req.params
app.use(mongoSanitize());

// NOTE: data sanitization against XSS
// NOTE: filter out malicious HTML code
// xss-clean converts html code
app.use(xss());

// Against HTTP parameter pollution
// Only uses the last parameter
// eg: .../tours?sort=-price&sort=name
// NOTE: sometimes we want to allow duplication for some parameters, than we can whitelist attributes
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuality',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    }),
);

app.use(express.static(`${__dirname}/public`));

app.use('/api/v1', routes);

// NOTE: not found middleware, sending HTML not a good-practice
app.all('*', (req, res, next) => {
    const err = new AppError(`Cannot find URL: ${req.originalUrl}`, 404);

    next(err);
});

app.use(globalErrorHandler);

module.exports = app;
