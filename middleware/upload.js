const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage - Placeholder for cloud storage
// In a real application, you would integrate with a cloud storage service like AWS S3, Google Cloud Storage, etc.
// For now, we'll use memory storage to avoid file system issues on serverless platforms.
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    // Get allowed file types from settings or use defaults
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
    },
    fileFilter: fileFilter
});

// Middleware to handle upload errors
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds the maximum limit'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
};

module.exports = {
    upload,
    handleUploadError
};