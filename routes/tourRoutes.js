const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(authController.protectRoute, tourController.getAllTours)
    .post(tourController.createTour);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(
        authController.protectRoute,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour,
    );

module.exports = router;
