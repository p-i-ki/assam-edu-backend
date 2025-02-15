const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the upload directory using an absolute path
const uploadDir = path.resolve(__dirname, '..', 'uploads', 'videos');
// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use the absolute path for the destination
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        // Ensure the filename is unique by prepending the current timestamp
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const videoFileFilter = (req, file, cb) => {
    // Check if the uploaded file is a video
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Not a video file!'), false);
    }
};

const uploadVideo = multer({
    storage: videoStorage,
    fileFilter: videoFileFilter,
    limits: {
        fileSize: 1024 * 1024 * 50 // 50 MB max file size for videos
    }
});

module.exports = uploadVideo;
