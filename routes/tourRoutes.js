const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// NOTE: merging routes, so creating reviews wont be implemented in two places
// NOTE: it forwards the request to the reviewRouter, which handles the rest
router.use('/:tourId/reviews', reviewRouter);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protectRoute,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour,
    );

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protectRoute,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.updateTour,
    )
    .delete(
        authController.protectRoute,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour,
    );

router.route('/tour-stats').get(tourController.getTourStats);

router
    .route('/monthly-plan/:year')
    .get(
        authController.protectRoute,
        authController.restrictTo('user'),
        tourController.getMonthlyPlan,
    );

module.exports = router;
