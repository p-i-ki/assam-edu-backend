const express = require('express');
const { createCourse, getInstructorCourses, addSection, uploadVideo, updateCourse, getInstructorCourse, deleteCourse, updateSection, deleteSection, getAllCourses, enrollInCourse, getCourse, getEnrolledCourses, postReview, updateReview, deleteReview } = require('../controllers/courseController');
const { route } = require('./userRoute');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

router.route('/getAllCourses').get(getAllCourses);
router.route('/getAllCourses').get(isAuthenticatedUser,getAllCourses);

router.route('/courses/:courseId').get(getCourse);
router.route('/courses/:courseId').get(isAuthenticatedUser,getCourse);

router.route('/instructor/:userId/getInstructorCourses').get(getInstructorCourses);
router.route('/instructor/getInstructorCourses').get(isAuthenticatedUser,authorizeRoles("instructor"),getInstructorCourses);

router.route('/instructor/:userId/courses/:courseId').get(getInstructorCourse);
router.route('/instructor/courses/:courseId').get(isAuthenticatedUser,authorizeRoles("instructor"),getInstructorCourse);

router.route('/instructor/:userId/createcourse').post(createCourse);
router.route('/instructor/createcourse').post(isAuthenticatedUser,authorizeRoles("instructor"),createCourse);

router.route('/instructor/:userId/courses/:courseId').put(updateCourse);
router.route('/instructor/courses/:courseId').put(isAuthenticatedUser,authorizeRoles("instructor"),updateCourse);

router.route('/instructor/:userId/courses/:courseId').delete(deleteCourse);
router.route('/instructor/courses/:courseId').delete(isAuthenticatedUser,authorizeRoles("instructor"),deleteCourse);

router.route('/instructor/:userId/:courseId/addSection').post(addSection);
router.route('/instructor/:courseId/addSection').post(isAuthenticatedUser,authorizeRoles("instructor"),addSection);

router.route('/instructor/:userId/courses/:courseId/sections/:sectionId').put(updateSection);
router.route('/instructor/courses/:courseId/sections/:sectionId').put(isAuthenticatedUser,authorizeRoles("instructor"),updateSection);

router.route('/instructor/:userId/courses/:courseId/sections/:sectionId').delete(deleteSection);
router.route('/instructor/courses/:courseId/sections/:sectionId').delete(isAuthenticatedUser,authorizeRoles("instructor"),deleteSection);

router.route('/instructor/:userId/:courseId/:sectionId/uploads/video').post(uploadVideo);
router.route('/instructor/:courseId/:sectionId/uploads/video').post(isAuthenticatedUser,authorizeRoles("instructor"),uploadVideo);

router.route('/:userId/courses/:courseId/enroll').post(enrollInCourse);
router.route('/courses/:courseId/enroll').post(isAuthenticatedUser,enrollInCourse);


router.route('/:userId/enrolledCourses').get(getEnrolledCourses);
router.route('/enrolledCourses').get(isAuthenticatedUser,getEnrolledCourses);

router.route('/courses/:courseId/review').post(postReview);
router.route('/courses/:courseId/review').post(isAuthenticatedUser,postReview);

router.route('/courses/:courseId/updateReview').put(updateReview);
router.route('/courses/:courseId/updateReview').put(isAuthenticatedUser,updateReview);

router.route('/courses/:courseId/deleteReview').delete(deleteReview);
router.route('/courses/:courseId/deleteReview').delete(isAuthenticatedUser,deleteReview);

module.exports = router;