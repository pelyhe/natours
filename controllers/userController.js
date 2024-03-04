const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });

    return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        length: users.length,
        data: {
            users,
        },
    });
});

exports.createUser = (req, res, next) =>
    res.status(201).json({ message: 'OK' });

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
exports.getUser = (req, res, next) => res.status(200).json({ message: 'OK' });

exports.updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // NOTE: return the new document instead of the old one
        runValidators: true, // NOTE: validate the updated object against the schema
    });

    if (!user) {
        return next(new AppError('No user was found with this ID', 404));
    }

    return res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.deleteUser = (req, res, next) =>
    res.status(204).json({ message: 'OK' });
