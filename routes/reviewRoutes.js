const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protectRoute);

router
    .route('/')
    .get(reviewController.getReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setTourAndUserIds,
        reviewController.createReview,
    );

router
    .route('/:id')
    .delete(
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview,
    )
    .patch(
        authController.restrictTo('user', 'admin'),
        reviewController.updateReview,
    )
    .get(reviewController.getReview);

module.exports = router;
