const InstructorProfile = require('../models/InstructorProfile');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorhandler');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.addProfile = catchAsyncErrors(async (req, res, next) => {
    const profilePicture = `${req.protocol}://${req.get("host")}/uploads/images/${req.file.filename}`;  
    const { bio, qualification } = req.body;
    const { user } = req; 
    const { userId } = req.user;
    // Check if the profile already exists
    const existingProfile = await InstructorProfile.findOne({where: {userId}});


    if (existingProfile) {
        return next(new ErrorHandler(`Profile already exists for this instructor ${existingProfile.bio}, ${user.username}`, 400));
    }

    // Create a new profile
    const profile = await InstructorProfile.create({
        bio,
        qualification,
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
    const { userId } = req.user;
    const { bio, profilePicture, qualification } = req.body;

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
    profile.qualification = qualification || profile.qualification;

    // Save the updated profile
    const updatedProfile = await profile.save();

    if (!updatedProfile) {
        return next(new ErrorHandler("Failed to update profile", 500));
    }

    res.status(200).json({ message: "Profile updated successfully", profile: updatedProfile });
});

exports.getEnrolledStudents = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.user;
    const { courseId } = req.params;

    // Find the course by ID
    const course = await Course.findOne({ where: { courseId } });
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    // Find all students (users) enrolled in the course
    const students = await User.findAll({
        attributes: ['email'], // Only select the email field
        include: [
            {
                model: Course,
                attributes: [], // Exclude course details
                through: {
                    model: Enrollment,
                    where: { courseId },
                    attributes: ['enrollment_date'], // Fetch enrollment date
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


