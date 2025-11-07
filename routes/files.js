const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const { protect, verifyOwnershipOrAdmin } = require('../middleware/auth');
const { upload, handleUploadError, uploadDir } = require('../middleware/upload');
const { logActivity } = require('../middleware/activityLogger');

// @route   POST /api/files/upload
// @desc    Upload file to task or comment
// @access  Private
router.post('/upload', protect, upload.single('file'), handleUploadError, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        const { taskId, commentId } = req.body;
        
        if (!taskId) {
            return res.status(400).json({
                success: false,
                message: 'Task ID is required'
            });
        }
        
        // Verify task exists
        const task = await Task.findById(taskId);
        if (!task) {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        // If commentId provided, verify it exists and belongs to task
        if (commentId) {
            const comment = await Comment.findById(commentId);
            if (!comment || comment.taskId.toString() !== taskId) {
                fs.unlinkSync(req.file.path);
                return res.status(404).json({
                    success: false,
                    message: 'Comment not found'
                });
            }
        }
        
        // Check if file is image
        const isImage = req.file.mimetype.startsWith('image/');
        
        // Create file record
        const file = await File.create({
            originalName: req.file.originalname,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            uploadedBy: req.user._id,
            taskId,
            commentId: commentId || null,
            isImage
        });
        
        // Log activity
        await logActivity(
            req.user._id,
            'file_uploaded',
            'File',
            file._id,
            { taskId, commentId, filename: file.originalName },
            req
        );
        
        const populatedFile = await File.findById(file._id).populate('uploadedBy', 'name');
        
        res.status(201).json({
            success: true,
            file: {
                id: populatedFile._id,
                originalName: populatedFile.originalName,
                filename: populatedFile.filename,
                mimetype: populatedFile.mimetype,
                size: populatedFile.size,
                uploadedBy: populatedFile.uploadedBy.name,
                uploadedById: populatedFile.uploadedBy._id,
                isImage: populatedFile.isImage,
                createdAt: populatedFile.createdAt
            }
        });
    } catch (error) {
        console.error('File upload error:', error);
        // Clean up file if error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success: false,
            message: 'Server error during file upload'
        });
    }
});

// @route   GET /api/files/:id
// @desc    Download file
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        
        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'File not found'
            });
        }
        
        // Check if file exists on disk
        if (!fs.existsSync(file.path)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server'
            });
        }
        
        res.download(file.path, file.originalName);
    } catch (error) {
        console.error('File download error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/files/task/:taskId
// @desc    Get all files for a task
// @access  Private
router.get('/task/:taskId', protect, async (req, res) => {
    try {
        const files = await File.find({ taskId: req.params.taskId })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            files: files.map(f => ({
                id: f._id,
                originalName: f.originalName,
                filename: f.filename,
                mimetype: f.mimetype,
                size: f.size,
                uploadedBy: f.uploadedBy.name,
                uploadedById: f.uploadedBy._id,
                isImage: f.isImage,
                commentId: f.commentId,
                createdAt: f.createdAt
            }))
        });
    } catch (error) {
        console.error('Get task files error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Private
router.delete('/:id', protect, verifyOwnershipOrAdmin(File, 'id'), async (req, res) => {
    try {
        const file = req.resource;
        
        // Delete file from disk
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        
        // Delete file record
        await file.deleteOne();
        
        // Log activity
        await logActivity(
            req.user._id,
            'file_deleted',
            'File',
            file._id,
            { filename: file.originalName, taskId: file.taskId },
            req
        );
        
        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('Delete file error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;