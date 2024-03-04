const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
    '/updateMyPassword',
    authController.protectRoute,
    authController.updatePassword,
);

router.patch(
    '/updateProfile',
    authController.protectRoute,
    userController.updateMe,
);

router.delete(
    '/deleteProfile',
    authController.protectRoute,
    userController.deleteMe,
);

router.route('/').get(userController.getAllUsers);
router.route('/:id').patch(userController.updateUser);

module.exports = router;
