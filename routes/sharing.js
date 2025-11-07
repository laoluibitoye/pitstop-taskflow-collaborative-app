const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const TaskShare = require('../models/TaskShare');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const File = require('../models/File');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// @route   POST /api/share/create
// @desc    Create shareable link for task
// @access  Private
router.post('/create', [
    protect,
    body('taskId').notEmpty().withMessage('Task ID is required'),
    body('permissions').optional().isObject(),
    body('expiresIn').optional().isInt({ min: 1 }),
    body('maxAccess').optional().isInt({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { taskId, permissions, expiresIn, maxAccess } = req.body;
        
        // Verify task exists and user has access
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        // Check if user is task creator or admin
        if (task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to share this task'
            });
        }
        
        // Check if share link already exists for this task
        let shareLink = await TaskShare.findOne({ task: taskId, isActive: true });
        
        if (shareLink) {
            // Update existing share link
            if (permissions) shareLink.permissions = permissions;
            if (expiresIn) shareLink.expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
            if (maxAccess) shareLink.maxAccess = maxAccess;
            await shareLink.save();
        } else {
            // Create new share link
            const options = {};
            if (expiresIn) options.expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
            if (maxAccess) options.maxAccess = maxAccess;
            
            shareLink = await TaskShare.createShareLink(
                taskId,
                req.user._id,
                permissions || {
                    canView: true,
                    canComment: true,
                    canUpdateProgress: false,
                    canEdit: false,
                    canAddSubTasks: false,
                    canUploadFiles: false
                },
                options
            );
        }
        
        // Log activity
        await logActivity(req.user._id, 'task_updated', 'Task', taskId, { action: 'share_link_created' }, req);
        
        res.status(201).json({
            success: true,
            shareLink: {
                shareUrl: shareLink.shareUrl,
                shareToken: shareLink.shareToken,
                permissions: shareLink.permissions,
                expiresAt: shareLink.expiresAt,
                maxAccess: shareLink.maxAccess
            }
        });
    } catch (error) {
        console.error('Create share link error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/share/invite
// @desc    Invite users to task via email
// @access  Private
router.post('/invite', [
    protect,
    body('taskId').notEmpty().withMessage('Task ID is required'),
    body('emails').isArray({ min: 1 }).withMessage('At least one email is required'),
    body('emails.*').isEmail().withMessage('Invalid email address'),
    body('permissions').optional().isObject()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { taskId, emails, permissions } = req.body;
        
        // Verify task exists
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        // Get or create share link
        let shareLink = await TaskShare.findOne({ task: taskId, isActive: true });
        
        if (!shareLink) {
            shareLink = await TaskShare.createShareLink(
                taskId,
                req.user._id,
                permissions || { canView: true, canComment: true }
            );
        }
        
        // Add invited users
        emails.forEach(email => {
            const existingInvite = shareLink.invitedUsers.find(u => u.email === email.toLowerCase());
            if (!existingInvite) {
                shareLink.invitedUsers.push({
                    email: email.toLowerCase(),
                    invitedAt: new Date()
                });
            }
        });
        
        await shareLink.save();
        
        // Log activity
        await logActivity(req.user._id, 'task_updated', 'Task', taskId, { 
            action: 'users_invited', 
            emails 
        }, req);
        
        // TODO: Send email notifications to invited users
        
        res.json({
            success: true,
            message: `Invitations sent to ${emails.length} user(s)`,
            shareUrl: shareLink.shareUrl,
            invitedUsers: shareLink.invitedUsers
        });
    } catch (error) {
        console.error('Invite users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/share/:token
// @desc    Access shared task via token
// @access  Public (with optional auth)
router.get('/:token', optionalAuth, async (req, res) => {
    try {
        const shareLink = await TaskShare.findOne({ shareToken: req.params.token })
            .populate('task')
            .populate('createdBy', 'name email');
        
        if (!shareLink) {
            return res.status(404).json({
                success: false,
                message: 'Share link not found'
            });
        }
        
        // Check if link is valid
        if (!shareLink.isValid()) {
            return res.status(403).json({
                success: false,
                message: 'Share link has expired or reached maximum access limit'
            });
        }
        
        // Log access
        await shareLink.logAccess(
            req.user?._id,
            req.user?.name || 'Anonymous',
            req.ip
        );
        
        // Get task with full details
        const task = await Task.findById(shareLink.task._id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('subTasks.createdBy', 'name')
            .populate('subTasks.completedBy', 'name');
        
        const comments = await Comment.find({ taskId: task._id })
            .populate('author', 'name email')
            .sort({ createdAt: 1 });
        
        const files = await File.find({ taskId: task._id })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            task: {
                id: task._id,
                text: task.text,
                description: task.description,
                date: task.date,
                deadline: task.deadline,
                hasDeadline: task.hasDeadline,
                timeExtensions: task.timeExtensions,
                progress: task.progress,
                status: task.status,
                category: task.category,
                priority: task.priority,
                hasSubTasks: task.hasSubTasks,
                subTasks: task.subTasks,
                isOverdue: task.isOverdue,
                createdBy: task.createdBy.name,
                createdAt: task.createdAt,
                comments: comments.map(c => ({
                    id: c._id,
                    text: c.text,
                    author: c.author.name,
                    timestamp: c.createdAt
                })),
                files: files.map(f => ({
                    id: f._id,
                    originalName: f.originalName,
                    size: f.size,
                    uploadedBy: f.uploadedBy.name,
                    isImage: f.isImage,
                    createdAt: f.createdAt
                }))
            },
            permissions: shareLink.permissions,
            isOwner: req.user && task.createdBy._id.toString() === req.user._id.toString()
        });
    } catch (error) {
        console.error('Access shared task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/share/task/:taskId
// @desc    Get share link for task (if exists)
// @access  Private
router.get('/task/:taskId', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        // Check if user has access
        if (task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        const shareLink = await TaskShare.findOne({ task: req.params.taskId, isActive: true });
        
        if (!shareLink) {
            return res.json({
                success: true,
                hasShareLink: false
            });
        }
        
        res.json({
            success: true,
            hasShareLink: true,
            shareLink: {
                shareUrl: shareLink.shareUrl,
                shareToken: shareLink.shareToken,
                permissions: shareLink.permissions,
                invitedUsers: shareLink.invitedUsers,
                accessCount: shareLink.accessCount,
                expiresAt: shareLink.expiresAt,
                maxAccess: shareLink.maxAccess,
                createdAt: shareLink.createdAt
            }
        });
    } catch (error) {
        console.error('Get share link error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/share/:token
// @desc    Deactivate share link
// @access  Private
router.delete('/:token', protect, async (req, res) => {
    try {
        const shareLink = await TaskShare.findOne({ shareToken: req.params.token })
            .populate('task');
        
        if (!shareLink) {
            return res.status(404).json({
                success: false,
                message: 'Share link not found'
            });
        }
        
        // Check if user is task creator or admin
        if (shareLink.createdBy.toString() !== req.user._id.toString() && 
            shareLink.task.createdBy.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }
        
        shareLink.isActive = false;
        await shareLink.save();
        
        // Log activity
        await logActivity(req.user._id, 'task_updated', 'Task', shareLink.task._id, { 
            action: 'share_link_deactivated' 
        }, req);
        
        res.json({
            success: true,
            message: 'Share link deactivated successfully'
        });
    } catch (error) {
        console.error('Deactivate share link error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;