const express = require('express');
const { updateProfile, addProfile, getEnrolledStudents } = require('../controllers/instructorController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const {imageUploader} = require('../utils/imageUploader');

const router = express.Router();

router.route('/instructor/addProfile').post(isAuthenticatedUser,authorizeRoles("instructor"),imageUploader.single("profilePicture"),addProfile);

// router.route('/instructor/updateProfile').put(isAuthenticatedUser,authorizeRoles("instructor"),updateProfile);

router.route('/instructor/:courseId/getEnrolledStudents').get(isAuthenticatedUser,authorizeRoles("instructor"),getEnrolledStudents);

module.exports = router;