const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(
                new AppError('No document was found with this ID', 404),
            );
        }

        return res.status(204).json({
            status: 'success',
        });
    });
};

exports.updateOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // NOTE: return the new document instead of the old one
            runValidators: true, // NOTE: validate the updated object against the schema
        });

        if (!doc) {
            return next(
                new AppError('No document was found with this ID', 404),
            );
        }

        return res.status(200).json({
            status: 'success',
            data: doc,
        });
    });
};

exports.createOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const newDoc = await Model.create(req.body);

        return res.status(201).json({
            status: 'success',
            data: newDoc,
        });
    });
};

exports.getOne = (Model, populateOptions) => {
    return catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);

        if (populateOptions) query = query.populate(populateOptions);

        const doc = await query;

        if (!doc) {
            return next(
                new AppError('No document was found with this ID', 404),
            );
        }

        return res.status(200).json({
            status: 'success',
            data: doc,
        });
    });
};

exports.getAll = (Model) => {
    return catchAsync(async (req, res, next) => {
        // NOTE: to allow nested GET reviews on tour
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

        // await the constructed query
        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limit()
            .paginate();

        const docs = await features.query;

        return res.status(200).json({
            status: 'success',
            length: docs.length,
            data: docs,
        });
    });
};
