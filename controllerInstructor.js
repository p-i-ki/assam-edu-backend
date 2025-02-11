const InstructorProfile = require('../models/InstructorProfile');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhandler');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.addProfile = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;

    const { bio, profilePicture } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
        return next(new ErrorHandler("Invalid Instructor", 404));
    }

    // Check if the profile already exists
    const existingProfile = await InstructorProfile.findOne({where: {userId}});

    console.log(existingProfile);

    if (existingProfile) {
        return next(new ErrorHandler(`Profile already exists for this instructor ${existingProfile.bio}, ${user.username}`, 400));
    }

    // Create a new profile
    const profile = await InstructorProfile.create({
        bio,
        profilePicture
    });

    if (!profile) {
        return next(new ErrorHandler("Failed to create profile", 500));
    }

    const addedInstructorProfile = await user.setInstructorProfile(profile);
    if(!addedInstructorProfile) {
        return next(new ErrorHandler("Internal Server Error", 500));
    }

    res.status(201).json({ message: "Profile created successfully", profile });
});

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const { bio, profilePicture } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
        return next(new ErrorHandler("Invalid Instructor", 404));
    }

    const profile = await InstructorProfile.findOne({ where: { userId } });

    if (!profile) {
        return next(new ErrorHandler("Profile not found for this instructor", 404));
    }

    // Update the profile details
    profile.bio = bio || profile.bio;
    profile.profilePicture = profilePicture || profile.profilePicture;

    // Save the updated profile
    const updatedProfile = await profile.save();

    if (!updatedProfile) {
        return next(new ErrorHandler("Failed to update profile", 500));
    }

    res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
});

exports.getEnrolledStudents = catchAsyncErrors(async (req, res, next) => {
    const { courseId } = req.params;

    // Find the course by ID
    const course = await Course.findByPk(courseId);
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    // Find all students (users) enrolled in the course
    const students = await User.findAll({
        include: [
            {
                model: Course,
                through: {
                    model: Enrollment,
                    where: { courseId },
                },
                required: true, // Ensures only users enrolled in the course are returned
            }
        ]
    });

    if (!students.length) {
        return next(new ErrorHandler("No students enrolled in this course", 404));
    }

    res.status(200).json({
        message: "Enrolled students retrieved successfully",
        students
    });
});


