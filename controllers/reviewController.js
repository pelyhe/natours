const Review = require('../models/reviewModel');
const factory = require('./handleFactory');

exports.setTourAndUserIds = (req, res, next) => {
    // allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id;

    return next();
};

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.getReviews = factory.getAll(Review);
