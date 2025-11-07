const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const File = require('../models/File');
const { protect, checkGuestLimits } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// Helper function to format task response
const formatTaskResponse = (task, comments = [], files = []) => {
    return {
        id: task._id,
        text: task.text,
        description: task.description,
        date: task.date,
        deadline: task.deadline,
        hasDeadline: task.hasDeadline,
        originalDeadline: task.originalDeadline,
        timeExtensions: task.timeExtensions,
        progress: task.progress,
        status: task.status,
        category: task.category,
        tags: task.tags,
        priority: task.priority,
        subTasks: task.subTasks,
        hasSubTasks: task.hasSubTasks,
        isOverdue: task.isOverdue,
        assignedTo: task.assignedTo,
        createdBy: task.createdBy.name || task.createdBy,
        createdById: task.createdBy._id || task.createdBy,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
        statusChangedAt: task.statusChangedAt,
        comments: comments.map(c => ({
            id: c._id,
            text: c.text,
            author: c.author.name,
            authorId: c.author._id,
            timestamp: c.createdAt
        })),
        files: files.map(f => ({
            id: f._id,
            originalName: f.originalName,
            filename: f.filename,
            mimetype: f.mimetype,
            size: f.size,
            uploadedBy: f.uploadedBy.name,
            uploadedById: f.uploadedBy._id,
            isImage: f.isImage,
            createdAt: f.createdAt
        }))
    };
};

// @route   GET /api/tasks
// @desc    Get tasks with filters
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { 
            date, 
            status, 
            category, 
            priority,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            includeArchived = 'false'
        } = req.query;
        
        let query = {};
        
        if (date) {
            query.date = date;
        }
        
        if (status) {
            query.status = status;
        }
        
        if (category) {
            query.category = category;
        }
        
        if (priority) {
            query.priority = priority;
        }
        
        if (search) {
            query.$or = [
                { text: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (includeArchived !== 'true') {
            query.isArchived = false;
        }
        
        const tasks = await Task.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('subTasks.createdBy', 'name')
            .populate('subTasks.completedBy', 'name')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });
        
        // Get comments and files for each task
        const tasksWithDetails = await Promise.all(tasks.map(async (task) => {
            const comments = await Comment.find({ taskId: task._id })
                .populate('author', 'name email')
                .sort({ createdAt: 1 });
            
            const files = await File.find({ taskId: task._id })
                .populate('uploadedBy', 'name')
                .sort({ createdAt: -1 });
            
            return formatTaskResponse(task, comments, files);
        }));
        
        res.json({
            success: true,
            tasks: tasksWithDetails,
            count: tasksWithDetails.length
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/tasks/categories
// @desc    Get all unique categories
// @access  Private
router.get('/categories', protect, async (req, res) => {
    try {
        const categories = await Task.distinct('category', { isArchived: false, category: { $ne: null } });
        
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/tasks/overdue
// @desc    Get overdue tasks
// @access  Private
router.get('/overdue', protect, async (req, res) => {
    try {
        const tasks = await Task.getOverdue();
        
        res.json({
            success: true,
            tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('Get overdue tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/tasks/:id
// @desc    Get single task with details
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('subTasks.createdBy', 'name')
            .populate('subTasks.completedBy', 'name')
            .populate('timeExtensions.requestedBy', 'name');
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        const comments = await Comment.find({ taskId: task._id })
            .populate('author', 'name email')
            .sort({ createdAt: 1 });
        
        const files = await File.find({ taskId: task._id })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            task: formatTaskResponse(task, comments, files)
        });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
    protect,
    checkGuestLimits('task'),
    body('text').trim().isLength({ min: 1, max: 200 }).withMessage('Task text must be between 1 and 200 characters'),
    body('date').notEmpty().withMessage('Date is required'),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('deadline').optional().isISO8601(),
    body('category').optional().trim().isLength({ max: 50 }),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('tags').optional().isArray()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const { text, date, description, deadline, category, priority, tags, assignedTo } = req.body;
        
        const taskData = {
            text,
            date,
            createdBy: req.user._id
        };
        
        if (description) taskData.description = description;
        if (deadline) {
            taskData.deadline = new Date(deadline);
            taskData.hasDeadline = true;
        }
        if (category) taskData.category = category;
        if (priority) taskData.priority = priority;
        if (tags) taskData.tags = tags;
        if (assignedTo) taskData.assignedTo = assignedTo;
        
        const task = await Task.create(taskData);
        
        // Increment guest task count if guest
        if (req.user.isGuest) {
            req.user.guestLimits.tasksCreated += 1;
            await req.user.save();
        }
        
        // Log activity
        await logActivity(req.user._id, 'task_created', 'Task', task._id, { text, date, category }, req);
        
        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');
        
        res.status(201).json({
            success: true,
            task: formatTaskResponse(populatedTask, [], [])
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PATCH /api/tasks/:id
// @desc    Update task
// @access  Private
router.patch('/:id', [
    protect,
    body('text').optional().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().trim().isLength({ max: 1000 }),
    body('deadline').optional().isISO8601(),
    body('category').optional().trim().isLength({ max: 50 }),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('tags').optional().isArray()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        // Update fields
        const allowedUpdates = ['text', 'description', 'deadline', 'category', 'priority', 'tags', 'assignedTo'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'deadline') {
                    task.deadline = new Date(req.body.deadline);
                    task.hasDeadline = true;
                } else {
                    task[field] = req.body[field];
                }
            }
        });
        
        await task.save();
        
        // Log activity
        await logActivity(req.user._id, 'task_updated', 'Task', task._id, req.body, req);
        
        const populatedTask = await Task.findById(task._id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');
        
        res.json({
            success: true,
            task: formatTaskResponse(populatedTask, [], [])
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PATCH /api/tasks/:id/progress
// @desc    Update task progress
// @access  Private
router.patch('/:id/progress', [
    protect,
    body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        const oldProgress = task.progress;
        task.progress = req.body.progress;
        
        // Auto-complete task if progress reaches 100%
        if (task.progress === 100 && task.status !== 'completed') {
            await task.changeStatus('completed', req.user._id);
        }
        
        await task.save();
        
        // Log activity
        await logActivity(
            req.user._id,
            'progress_updated',
            'Task',
            task._id,
            { oldProgress, newProgress: task.progress },
            req
        );
        
        res.json({
            success: true,
            task: {
                id: task._id,
                progress: task.progress,
                status: task.status
            }
        });
    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PATCH /api/tasks/:id/status
// @desc    Change task status
// @access  Private
router.patch('/:id/status', [
    protect,
    body('status').isIn(['ongoing', 'completed', 'delayed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        const oldStatus = task.status;
        await task.changeStatus(req.body.status, req.user._id);
        
        // Log activity
        await logActivity(
            req.user._id,
            'task_updated',
            'Task',
            task._id,
            { oldStatus, newStatus: task.status },
            req
        );
        
        res.json({
            success: true,
            task: {
                id: task._id,
                status: task.status,
                statusChangedAt: task.statusChangedAt,
                completedAt: task.completedAt
            }
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/tasks/:id/extend-deadline
// @desc    Extend task deadline
// @access  Private
router.post('/:id/extend-deadline', [
    protect,
    body('extensionAmount').isInt({ min: 1 }).withMessage('Extension amount must be a positive integer'),
    body('extensionUnit').isIn(['hours', 'days']).withMessage('Extension unit must be hours or days'),
    body('reason').optional().trim().isLength({ max: 500 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        const extensionData = {
            extensionAmount: req.body.extensionAmount,
            extensionUnit: req.body.extensionUnit,
            reason: req.body.reason,
            requestedBy: req.user._id
        };
        
        await task.extendDeadline(extensionData);
        
        // Log activity
        await logActivity(
            req.user._id,
            'task_updated',
            'Task',
            task._id,
            { action: 'deadline_extended', ...extensionData },
            req
        );
        
        res.json({
            success: true,
            task: {
                id: task._id,
                deadline: task.deadline,
                timeExtensions: task.timeExtensions,
                status: task.status
            }
        });
    } catch (error) {
        console.error('Extend deadline error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// @route   POST /api/tasks/:id/subtasks
// @desc    Add sub-task
// @access  Private
router.post('/:id/subtasks', [
    protect,
    body('text').trim().isLength({ min: 1, max: 200 }).withMessage('Sub-task text must be between 1 and 200 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        const subTask = await task.addSubTask({
            text: req.body.text,
            createdBy: req.user._id
        });
        
        // Log activity
        await logActivity(req.user._id, 'task_updated', 'Task', task._id, { action: 'subtask_added', text: req.body.text }, req);
        
        res.status(201).json({
            success: true,
            subTask,
            task: {
                id: task._id,
                hasSubTasks: task.hasSubTasks,
                subTasks: task.subTasks,
                progress: task.progress
            }
        });
    } catch (error) {
        console.error('Add sub-task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PATCH /api/tasks/:id/subtasks/:subtaskId/complete
// @desc    Complete sub-task
// @access  Private
router.patch('/:id/subtasks/:subtaskId/complete', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        const subTask = await task.completeSubTask(req.params.subtaskId, req.user._id);
        
        if (!subTask) {
            return res.status(404).json({
                success: false,
                message: 'Sub-task not found'
            });
        }
        
        // Log activity
        await logActivity(req.user._id, 'task_updated', 'Task', task._id, { action: 'subtask_completed', subtaskId: req.params.subtaskId }, req);
        
        res.json({
            success: true,
            subTask,
            task: {
                id: task._id,
                progress: task.progress,
                subTasks: task.subTasks
            }
        });
    } catch (error) {
        console.error('Complete sub-task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        // Check if user is admin or task creator
        if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this task'
            });
        }
        
        // Delete associated comments and files
        await Comment.deleteMany({ taskId: task._id });
        await File.deleteMany({ taskId: task._id });
        
        await task.deleteOne();
        
        // Log activity
        await logActivity(req.user._id, 'task_deleted', 'Task', task._id, { text: task.text }, req);
        
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', [
    protect,
    checkGuestLimits('comment'),
    body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        const comment = await Comment.create({
            text: req.body.text,
            taskId: task._id,
            author: req.user._id
        });
        
        // Increment guest comment count if guest
        if (req.user.isGuest) {
            req.user.guestLimits.commentsPosted += 1;
            await req.user.save();
        }
        
        // Log activity
        await logActivity(req.user._id, 'comment_created', 'Comment', comment._id, { taskId: task._id }, req);
        
        const populatedComment = await Comment.findById(comment._id).populate('author', 'name email');
        
        res.status(201).json({
            success: true,
            comment: {
                id: populatedComment._id,
                text: populatedComment.text,
                author: populatedComment.author.name,
                authorId: populatedComment.author._id,
                timestamp: populatedComment.createdAt
            }
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/tasks/:taskId/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:taskId/comments/:commentId', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Check if user is admin or comment author
        if (req.user.role !== 'admin' && comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }
        
        await comment.deleteOne();
        
        // Log activity
        await logActivity(req.user._id, 'comment_deleted', 'Comment', comment._id, { taskId: req.params.taskId }, req);
        
        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;