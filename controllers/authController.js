const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// NOTE: send JWT token via HTTPOnly cookie
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // convert cookie expiry in milliseconds
    const cookieOptions = {
        expires: new Date(
            Date.now() +
                process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        ),
        // secure: true, // encrypted, https, only in prod
        httpOnly: true, // cookie cannot be accessed through browser, IMPORTANT!
    };

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // remove pass from output
    user.password = undefined;

    res.status(200).json({
        status: 'success',
        token: token,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({
        email: email,
    }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Email or password incorrect', 401));
    }

    createSendToken(user, 200, res);
});

exports.protectRoute = catchAsync(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Log in to access this endpoint.', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // check if the user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser)
        return next(new AppError('The user does no longer exist'), 401);

    // check if the user's password had been changed after issuing token
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'Password has been changed recently, please log in again!',
                401,
            ),
        );
    }

    req.user = currentUser;

    return next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission access to this endpoint',
                ),
                403,
            );
        }

        return next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // get user based on email
    const user = await User.findOne({ email: req.body.email });

    if (!user)
        return next(
            new AppError('There is no user with this email address'),
            404,
        );

    // generate the random reset token
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // send it to user's email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}\nIf you didn't forget your password, please ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10min)',
            message: message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('Cannot send the password reseting email'),
            500,
        );
    }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    // get user based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // if token has not expired, and there is user, set the new password
    if (!user)
        return next(
            new AppError('Invalid or expired password reset token!', 403),
        );

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // update changedPasswordAt property
    // log the user in, send JWT
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    // get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // check if posted current password is correct
    if (!user || !(await user.correctPassword(currentPassword, user.password)))
        return next(new AppError('Email or password incorrect', 404));

    // if so, update password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    // log user in, send JWT
    createSendToken(user, 200, res);
});
