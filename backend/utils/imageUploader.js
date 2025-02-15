const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ErrorHandler = require('./errorhandler');

// Define the upload directory using an absolute path
const uploadDir = path.resolve(__dirname, '..', 'uploads', 'images');


// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use the absolute path for the destination
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        // Ensure the filename is unique by prepending the current timestamp
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const imageFileFilter = (req, file, cb) => {
    // check if the uploaded file is a jpeg, jpg or png
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);
    if(extName && mimeType) {
        return cb(null, true);
    }
    else {
        return cb(new ErrorHandler('Only JPEG, JPG, and PNG files are allowed!',400))
    }
}
const imageUploader = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: imageFileFilter,
});

module.exports = { imageUploader };
