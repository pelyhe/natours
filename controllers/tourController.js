const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllTours = catchAsync(async (req, res, next) => {
    // await the constructed query
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limit()
        .paginate();

    const tours = await features.query;

    return res.status(200).json({
        status: 'success',
        length: tours.length,
        data: tours,
    });
});

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    return res.status(201).json({
        status: 'success',
        data: newTour,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
        return next(new AppError('No tour was found with this ID', 404));
    }

    return res.status(200).json({
        status: 'success',
        data: tour,
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // NOTE: return the new document instead of the old one
        runValidators: true, // NOTE: validate the updated object against the schema
    });

    if (!tour) {
        return next(new AppError('No tour was found with this ID', 404));
    }

    return res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError('No tour was found with this ID', 404));
    }

    return res.status(204).json({
        status: 'success',
    });
});

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
