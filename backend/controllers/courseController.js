const multer = require('multer');
const Course = require('../models/Course');
const User = require('../models/User');
const InstructorProfile = require("../models/InstructorProfile");
const Section = require('../models/Section');
const Video = require('../models/Video');
const uploadVideo = require('../utils/uploadVideo');
const uploadImage = require('../utils/imageUploader');
const path = require('path');
const {processAllResolutions} = require('../utils/videoProcessor');
const fs = require('fs');
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandler");
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const generateCaptions = require('../utils/captionGenerator');

exports.getAllCourses = catchAsyncErrors(async (req, res, next) => {
    const courses = await Course.findAll();

    if (!courses || courses.length === 0) {
        return next(new ErrorHandler('No courses found', 404));
    }

    res.status(200).json({
        success: true,
        courses
    });
});

exports.getCourse = catchAsyncErrors(async(req, res, next) => {
    const { courseId } = req.params;
    const course = await Course.findOne({
        where: { courseId },
        include: [
            {
                model: Section,
                as: 'sections',
                include: [
                    {
                        model: Video,
                        as: 'videos'
                    }
                ]
            }
        ]
    });

    if (!course) {
        return next(new ErrorHandler("Course not found or does not belong to this instructor", 404));
    }

    res.status(200).json({ message: "Course retrieved successfully", course });
});

exports.getInstructorCourses = catchAsyncErrors(async(req,res) => {
    const { userId } = req.user;
    const instructor = await InstructorProfile.findOne({where: { userId}});
    if(!instructor) {
        return next(new ErrorHandler("Invalid Instructor", 500));
    }

    const courses = await instructor.getCourses();
    if(!courses) {
        return next(new ErrorHandler("Fetching courses failed", 500));
    }

    res.status(200).json({message:"Courses fetches successfully",courses});
});

exports.getInstructorCourse = catchAsyncErrors(async (req, res, next) => {
    const { courseId } = req.params;
    const { userId } = req.user;

    const instructor = await InstructorProfile.findOne({ where: { userId } });
    if (!instructor) {
        return next(new ErrorHandler("Invalid Instructor", 404));
    }

    const courses = await instructor.getCourses({
        where: { courseId },
        include: [
            {
                model: Section,
                as: 'sections',
                include: [
                    {
                        model: Video,
                        as: 'videos',
                    },
                ],
            },
            {
                model: Review, // Include the Review model
                as: 'Reviews', // Use alias if defined in associations
                include: [
                    {
                        model: User, // Include user info if needed for reviewer details
                        attributes: ['email'], // Select specific fields for the user
                    },
                ],
            },
        ],
    });

    const course = courses[0]; 
    if (!course) {
        return next(new ErrorHandler("Course not found or does not belong to this instructor", 404));
    }

    res.status(200).json({ message: "Course retrieved successfully", course });
});

exports.createCourse = catchAsyncErrors(async(req, res, next) => {
        const thumbnailUrl = req.file.path;
        const { userId } = req.user;
        const {title, description, category, tags, price} = req.body;
        
        const instructor = await InstructorProfile.findOne({where: { userId}});

        if(!instructor) {
            return next(new ErrorHandler("Invalid Instructor", 500));
        }
        
        const course = await Course.create({title, description, price, thumbnailUrl});
        if(!course) {
            return next(new ErrorHandler("Course failed to create", 500));
        }

        const isCourseAdded = await instructor.addCourse(course);
        if(!course) {
            return next(new ErrorHandler("Internal Error", 500));    
        }
        res.status(201).json({ message: 'Course created successfully', course});
});

exports.updateCourse = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.user;
    const {courseId } = req.params;
    const { title, description, price } = req.body;

    const instructor = await InstructorProfile.findOne({where: { userId}});
    if (!instructor) {
        return next(new ErrorHandler("Invalid Instructor", 404));
    }

    const courses = await instructor.getCourses({ where: { courseId } });
    const course = courses[0]; 
    if (!course) {
        return next(new ErrorHandler("Course not found or does not belong to this instructor", 404));
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price !== undefined ? price : course.price; // Allows setting price to 0

    const updatedCourse = await course.save();
    if (!updatedCourse) {
        return next(new ErrorHandler("Failed to update course", 500));
    }

    res.status(200).json({ message: "Course updated successfully", course: updatedCourse });
});

exports.deleteCourse = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.user;
    const {courseId } = req.params;

    const instructor = await InstructorProfile.findOne({where: { userId}});
    if (!instructor) {
        return next(new ErrorHandler("Invalid Instructor", 404));
    }

    const courses = await instructor.getCourses({ where: {courseId } });
    const course = courses[0]; 
    if (!course) {
        return next(new ErrorHandler("Course not found or does not belong to this instructor", 404));
    }

    const deletedCourse = await course.destroy();
    if(!deletedCourse) {
        return next(new ErrorHandler("Failed to delete Course", 500));
    }
    res.status(200).json({ message: "Course deleted successfully" });
});

exports.addSection = catchAsyncErrors(async (req, res, next) => {
    const {courseId } = req.params;
    const { userId } = req.user;
    const { sectionName } = req.body;

    const instructor = await InstructorProfile.findOne({where: { userId}});

    if(!instructor) {
        return next(new ErrorHandler("Invalid Instructor", 404));
    }

    const courses = await instructor.getCourses({where:{courseId}});

    const course = courses[0];

    if(!course) {
        return next(new ErrorHandler("Course not found or does not belong to this user", 404));
    }

    // Create a new section
    const section = await Section.create({
      sectionName
    });

    if (!section) {
        return next(new ErrorHandler("Failed to add section", 404));
    }

    const isSectionAdded = await course.addSection(section);
    if(!isSectionAdded) {
        return next(new ErrorHandler("Internal server error",500));
    }
    const sections = await course.getSections();
    res.status(201).json({ message:"Section creation successfull",instructor, course, sections });
});

exports.updateSection = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.user;
    const { courseId, sectionId } = req.params;
    const { sectionName } = req.body;

    const instructor = await InstructorProfile.findOne({where: { userId}});
    if (!instructor) {
        return next(new ErrorHandler("Invalid Instructor", 404));
    }

    const courses = await instructor.getCourses({ where: { courseId } });
    const course = courses[0];

    if (!course) {
        return next(new ErrorHandler("Course not found or does not belong to this user", 404));
    }

    const sections = await course.getSections({ where: { sectionId } });
    const section = sections[0];

    if (!section) {
        return next(new ErrorHandler("Section not found or does not belong to this course", 404));
    }

    section.sectionName = sectionName || section.sectionName;

    const updatedSection = await section.save();
    
    if (!updatedSection) {
        return next(new ErrorHandler("Failed to update section", 500));
    }

    res.status(200).json({ message: "Section updated successfully", section: updatedSection });
});

exports.deleteSection = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.user;
    const { courseId, sectionId } = req.params;

    const instructor = await InstructorProfile.findOne({where: { userId}});
    if (!instructor) {
        return next(new ErrorHandler("Invalid Instructor", 404));
    }

    const courses = await instructor.getCourses({ where: { courseId } });
    const course = courses[0];

    if (!course) {
        return next(new ErrorHandler("Course not found or does not belong to this user", 404));
    }

    const sections = await course.getSections({ where: { sectionId } });
    const section = sections[0];

    if (!section) {
        return next(new ErrorHandler("Section not found or does not belong to this course", 404));
    }

    const deletionResult = await section.destroy();
    
    if (!deletionResult) {
        return next(new ErrorHandler("Failed to delete section", 500));
    }

    res.status(200).json({ message: "Section deleted successfully" });
});

exports.uploadVideo = catchAsyncErrors(async (req, res,next) => {
    const { userId } = req.user;
    const { courseId, sectionId } = req.params;

        const instructor = await InstructorProfile.findOne({where: { userId}});
        if (!instructor) {
            return next(new ErrorHandler("Invalid Instructor", 404));
        }

        const courses = await instructor.getCourses({ where: { courseId } });
        const course = courses[0];
        if (!course) {
            return next(new ErrorHandler("Course not found or does not belong to this user", 404));
        }

        const sections = await course.getSections({ where: { sectionId } });
        const section = sections[0];

        if (!section) {
            return next(new ErrorHandler("Section not found in this course", 404));
        }

        // Upload video using Multer
        uploadVideo.single('video')(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ error: err.message });
            } else if (err) {
                return res.status(500).json({ error: err.message });
            }

            const { title} = req.body;
            const originalVideoPath = req.file.path;
            const originalVideoName = req.file.originalname;

            try {
                console.log("Video Processing start");
                const startTime = Date.now();

                // Process video into different resolutions
                const processedVideoPaths = await processAllResolutions(originalVideoPath, originalVideoName);

                const processingTime = Date.now() - startTime;
                console.log(`Video Processing completed in ${processingTime}ms`);

                console.log("Video Uploading Start");
                const videoStartTime = Date.now();

                // Save video details to the database and associate with the section
                const video = await Video.create({
                    title,
                    url: JSON.stringify(processedVideoPaths), // Store URLs as JSON array
                });

                // Associate the video with the section
                await section.addVideo(video);

                const videoSaveTime = Date.now() - videoStartTime;
                console.log(`Video Uploading completed in ${videoSaveTime}ms`);

                // Optionally delete the original video file after processing
                fs.unlinkSync(originalVideoPath);

                res.status(201).json({ message: "Successfully uploaded file", video });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        });
});
// exports.uploadVideo = catchAsyncErrors(async (req, res, next) => {
//     const { userId } = req.user;
//     const { courseId, sectionId } = req.params;

//     // Validate the instructor, course, and section
//     const instructor = await InstructorProfile.findOne({ where: { userId } });
//     if (!instructor) return next(new ErrorHandler("Invalid Instructor", 404));

//     const course = await instructor.getCourses({ where: { courseId } }).then(courses => courses[0]);
//     if (!course) return next(new ErrorHandler("Course not found or does not belong to this user", 404));

//     const section = await course.getSections({ where: { sectionId } }).then(sections => sections[0]);
//     if (!section) return next(new ErrorHandler("Section not found in this course", 404));

//     // Upload video using Multer
//     uploadVideo.single('video')(req, res, async (err) => {
//         if (err) return res.status(500).json({ error: err.message });

//         const { title } = req.body;
//         const videoPath = req.file.path;

//         try {
//             console.log("Video Processing Start");

//             // Process video into different resolutions
//             const processedVideoPaths = await processAllResolutions(videoPath, req.file.originalname);

//             console.log("Video Uploading Start");

//             // Generate captions using Whisper
//             console.log("Auto-Captioning Start");
//             const { data: captions, captionFileName } = await generateCaptions(videoPath);

//             // Save video details to the database and associate with the section
//             const video = await Video.create({
//                 title,
//                 url: JSON.stringify(processedVideoPaths), // Store URLs as JSON array
//                 captionUrl: `/captions/${captionFileName}`, // Save the caption URL
//             });
//             await section.addVideo(video);

//             // Optionally delete the original video file after processing
//             fs.unlinkSync(videoPath);

//             res.status(201).json({ 
//                 message: "Video uploaded and captions generated successfully", 
//                 video 
//             });
//         } catch (error) {
//             res.status(400).json({ error: error.message });
//         }
//     });
// });

exports.enrollInCourse = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.user;
    const { courseId } = req.params;
    const {user} = req;
    // Find the course by ID
    const course = await Course.findOne({where: {courseId}});
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    // Check if the user is already enrolled in the course
    const existingEnrollment = await Enrollment.findOne({ where: { userId, courseId } });
    if (existingEnrollment) {
        return next(new ErrorHandler("User is already enrolled in this course", 400));
    }

    // Enroll the user in the course using Sequelize's addCourse method
    await user.addCourse(course, { through: { progress: 0, status: 'in-progress' } });

    res.status(201).json({
        message: "Enrolled in course successfully",
        course
    });
});

exports.getEnrolledCourses = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.user;

    // Find all courses the user is enrolled in
    const courses = await Course.findAll({
        include: [
            {
                model: User,
                attributes:[],
                through: {
                    model: Enrollment,
                    where: { userId },
                    attributes:[],
                },
                required: true, 
            },
            {
                model: Section,
                as: 'sections',
                include: [
                    {
                        model: Video,
                        as: 'videos'
                    }
                ]
            }
        ]
    });

    if (!courses.length) {
        return next(new ErrorHandler("No enrolled courses found", 404));
    }

    res.status(200).json({
        message: "Enrolled courses retrieved successfully",
        courses
    });
});

exports.postReview = catchAsyncErrors(async (req, res, next) => {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const {userId} = req.user;

    const course = await Course.findByPk(courseId);
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }

    const review = await Review.create({
        rating,
        comment,
        courseId,
        userId 
    });
    
    if (!review) {
        return next(new ErrorHandler("Failed to post review", 500));
    }
    const reviewedCourse = await course.addReview(review);
    if(!reviewedCourse) {
        return next(new ErrorHandler("Internal Server Error",500));
    }
    res.status(201).json({
        message: "Review posted successfully",
        review
    });
});

exports.updateReview = catchAsyncErrors(async (req, res, next) => {
    const { courseId, reviewId } = req.params;
    const { rating, comment } = req.body;
    const {userId} = req.user;

    const review = await Review.findOne({
        where: { reviewId, courseId, userId }
    });

    if (!review) {
        return next(new ErrorHandler("Review not found", 404));
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    const updatedReview = await review.save();

    if (!updatedReview) {
        return next(new ErrorHandler("Failed to update review", 500));
    }

    res.status(200).json({
        message: "Review updated successfully",
        review: updatedReview
    });
});

exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const { courseId, reviewId } = req.params;
    const {userId} = req.user;

    // Find the review
    const review = await Review.findOne({
        where: { reviewId, courseId, userId }
    });

    if (!review) {
        return next(new ErrorHandler("Review not found", 404));
    }

    // Delete the review
    await review.destroy();

    res.status(200).json({
        message: "Review deleted successfully"
    });
});

