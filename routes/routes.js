const express = require('express');
const tourRouter = require('./tourRoutes');
const userRouter = require('./userRoutes');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
router.use('/tours', tourRouter);
router.use('/users', userRouter);
router.use('/reviews', reviewRouter);

module.exports = router;
