const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.getAllTours = factory.getAll(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
    // NOTE: aggregation pipeline
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: '$ratingsAverage', // NOTE: by which category do we want to group?
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    return res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    // NOTE: aggregation pipeline
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates', // NOTE: this will create new objects for every value of the startDates array
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numOfTours: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: { _id: 0 },
        },
        {
            $sort: { numOfTours: -1 },
        },
    ]);

    return res.status(200).json({
        status: 'success',
        data: {
            plan,
        },
    });
});
