const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');

const filterObj = (obj, ...allowFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });

    return newObj;
};

exports.getUser = factory.getOne(User);

// Do NOT update password here
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getAllUsers = factory.getAll(User);

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    return next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'You cannot update your password in this route. Please use /updateMyPassword',
            ),
            400,
        );
    }

    const filteredBody = filterObj(req.body, 'name', 'email');
    // NOTE: here we can use update, since we are not updating sensitive data (password)
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        },
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

// NOTE: this only flags them as inactive
// NOTE: beacuse of the mongoose query middleware, it wont be added to the result set of find method
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        active: false,
    });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
