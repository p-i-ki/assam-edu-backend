const { Op } = require('sequelize');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const Course = require('../models/Course');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhandler');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const sendToken = require('../utils/jwtToken');

exports.register = catchAsyncErrors(async (req, res, next) => {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return next(new ErrorHandler("Email is already registered", 400));
    }

    const user = await User.create({ username, email, password, role });

    if (!user) {
        return next(new ErrorHandler("Failed to create user", 500));
    }

    res.status(200).json({
        success: true,
        message:"User Registered Successfully"
    })
    // const userData = user.toJSON();
    // delete userData.password;
});

exports.login = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new ErrorHandler('Invalid credentials', 401));
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler('Invalid credentials', 401));
    }

    const otp = user.generateOTP();
    await user.save();

    try {
        const message = `Your OTP: ${otp}`;
        await sendEmail({
            email: user.email,
            subject: "OTP Verification",
            message,
        });

        res.status(200).json({message: 'OTP sent to your email'});
    } catch (emailError) {
        user.otp = null;
        user.otpExpiration = null;
        await user.save();
        
        return next(new ErrorHandler('Failed to send OTP. Please try again.', 500));
    }
});

exports.verifyOTP = catchAsyncErrors(async (req, res, next) => {
    const { email, otp } = req.body;

    // Check if the user with the provided email and OTP exists, and if the OTP is still valid
    const user = await User.findOne({
        where: {
            email,
            otp,
            otpExpiration: {
                [Op.gt]: Date.now(), // OTP should be valid (not expired)
            },
        },
    });

    if (!user) {
        return next(new ErrorHandler('Invalid or expired OTP', 401));
    }

    // Clear OTP and expiration after successful verification
    user.otp = null;
    user.otpExpiration = null;
    await user.save();

    sendToken(user, 200, res);

    // res.status(200).json({
    //     message: 'Login successful',
    //     token,
    //     user: {
    //         id: user.userId,
    //         username: user.username,
    //         email: user.email,
    //         role: user.role,
    //     },
    // });
});

exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
});

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
        return res.status(200).json({ message: 'If an account with that email exists, you will receive a password reset email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

    const message = `Your password reset token is:\n\n${resetPasswordUrl}\n\nIf you have not requested this email, please ignore it.`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Recovery',
            message,
        });

        res.status(200).json({ message: 'If an account with that email exists, you will receive a password reset email' });
    } catch (err) {
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return next(new ErrorHandler('There was an error sending the email. Please try again later.', 500));
    }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { newPassword } = req.body;

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { [Op.gt]: Date.now() },
        },
    });

    if (!user) {
        return next(new ErrorHandler('Invalid or expired token', 400));
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
});




