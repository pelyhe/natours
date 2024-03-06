const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this
router.use(authController.protectRoute);

router.route('/me').get(userController.getMe, userController.getUser);
router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateProfile', userController.updateMe);
router.delete('/deleteProfile', userController.deleteMe);

// Only admins after this route
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);
router
    .route('/:id')
    .patch(userController.updateUser)
    .delete(userController.deleteUser)
    .get(userController.getUser);

module.exports = router;
