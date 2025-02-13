const express = require('express');
const { createCourse, getInstructorCourses, addSection, uploadVideo, updateCourse, getInstructorCourse, deleteCourse, updateSection, deleteSection, getAllCourses, enrollInCourse, getCourse, getEnrolledCourses, postReview, updateReview, deleteReview } = require('../controllers/courseController');
const { route } = require('./userRoute');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const {imageUploader} = require('../utils/imageUploader');

const router = express.Router();

router.route('/getAllCourses').get(getAllCourses);
// router.route('/getAllCourses').get(isAuthenticatedUser,getAllCourses);

router.route('/courses/:courseId').get(isAuthenticatedUser,getCourse);

router.route('/instructor/getInstructorCourses').get(isAuthenticatedUser,authorizeRoles("instructor"),getInstructorCourses);

router.route('/instructor/courses/:courseId').get(isAuthenticatedUser,authorizeRoles("instructor"),getInstructorCourse);

router.route('/instructor/createcourse').post(isAuthenticatedUser,authorizeRoles("instructor"),imageUploader.single("thumbnail"),createCourse);

router.route('/instructor/:userId/courses/:courseId').put(updateCourse);
// router.route('/instructor/courses/:courseId').put(isAuthenticatedUser,authorizeRoles("instructor"),updateCourse);

router.route('/instructor/:userId/courses/:courseId').delete(deleteCourse);
// router.route('/instructor/courses/:courseId').delete(isAuthenticatedUser,authorizeRoles("instructor"),deleteCourse);

router.route('/instructor/:courseId/addSection').post(isAuthenticatedUser,authorizeRoles("instructor"),addSection);

router.route('/instructor/courses/:courseId/sections/:sectionId').put(isAuthenticatedUser,authorizeRoles("instructor"),updateSection);

router.route('/instructor/courses/:courseId/sections/:sectionId').delete(isAuthenticatedUser,authorizeRoles("instructor"),deleteSection);

router.route('/instructor/:courseId/:sectionId/uploads/video').post(isAuthenticatedUser,authorizeRoles("instructor"),uploadVideo);

router.route('/courses/:courseId/enroll').post(isAuthenticatedUser,authorizeRoles("student"),enrollInCourse);

router.route('/enrolledCourses').get(isAuthenticatedUser,getEnrolledCourses);

router.route('/courses/:courseId/review').post(isAuthenticatedUser,postReview);

router.route('/courses/:courseId/updateReview/:reviewId').put(isAuthenticatedUser,updateReview);

router.route('/courses/:courseId/deleteReview').delete(deleteReview);

router.route('/courses/:courseId/deleteReview/:reviewId').delete(isAuthenticatedUser,deleteReview);

module.exports = router;