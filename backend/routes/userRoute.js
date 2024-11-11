const express = require('express');

const { register, login, verifyOTP, logout, forgotPassword, resetPassword} = require('../controllers/userController');

const router = express.Router();

router.route('/register').post(register);

router.route('/login').post(login);

router.route('/verify-otp').post(verifyOTP);

router.route('/logout').post(logout);

router.route('/forgot-password').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);

module.exports = router;