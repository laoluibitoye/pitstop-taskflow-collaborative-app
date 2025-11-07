const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const File = require('../models/File');
const ActivityLog = require('../models/ActivityLog');
const AppSettings = require('../models/AppSettings');
const { protect, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// All admin routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

// ==================== USERS MANAGEMENT ====================

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        
        let query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (role) {
            query.role = role;
        }
        
        if (status === 'active') {
            query.isActive = true;
            query.isSuspended = false;
        } else if (status === 'suspended') {
            query.isSuspended = true;
        } else if (status === 'inactive') {
            query.isActive = false;
        }
        
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await User.countDocuments(query);
        
        res.json({
            success: true,
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalUsers: count
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PATCH /api/admin/users/:id/role
// @desc    Change user role
// @access  Admin
router.patch('/users/:id/role', [
    body('role').isIn(['user', 'admin']).withMessage('Invalid role')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Prevent changing own role
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own role'
            });
        }
        
        const oldRole = user.role;
        user.role = req.body.role;
        await user.save();
        
        // Log activity
        await logActivity(
            req.user._id,
            'role_changed',
            'User',
            user._id,
            { oldRole, newRole: user.role },
            req
        );
        
        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Change role error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PATCH /api/admin/users/:id/suspend
// @desc    Suspend user
// @access  Admin
router.patch('/users/:id/suspend', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Prevent suspending self
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot suspend yourself'
            });
        }
        
        user.isSuspended = true;
        await user.save();
        
        // Log activity
        await logActivity(req.user._id, 'user_suspended', 'User', user._id, null, req);
        
        res.json({
            success: true,
            message: 'User suspended successfully'
        });
    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PATCH /api/admin/users/:id/activate
// @desc    Activate user
// @access  Admin
router.patch('/users/:id/activate', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        user.isSuspended = false;
        user.isActive = true;
        await user.save();
        
        // Log activity
        await logActivity(req.user._id, 'user_activated', 'User', user._id, null, req);
        
        res.json({
            success: true,
            message: 'User activated successfully'
        });
    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== TASKS MANAGEMENT ====================

// @route   GET /api/admin/tasks
// @desc    Get all tasks (including archived)
// @access  Admin
router.get('/tasks', async (req, res) => {
    try {
        const { page = 1, limit = 50, date, userId, includeArchived } = req.query;
        
        let query = {};
        
        if (date) {
            query.date = date;
        }
        
        if (userId) {
            query.createdBy = userId;
        }
        
        if (includeArchived !== 'true') {
            query.isArchived = false;
        }
        
        const tasks = await Task.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await Task.countDocuments(query);
        
        res.json({
            success: true,
            tasks,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalTasks: count
        });
    } catch (error) {
        console.error('Get all tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PATCH /api/admin/tasks/:id/archive
// @desc    Archive task
// @access  Admin
router.patch('/tasks/:id/archive', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        task.isArchived = true;
        task.archivedAt = new Date();
        task.archivedBy = req.user._id;
        await task.save();
        
        // Log activity
        await logActivity(req.user._id, 'task_archived', 'Task', task._id, null, req);
        
        res.json({
            success: true,
            message: 'Task archived successfully'
        });
    } catch (error) {
        console.error('Archive task error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== ACTIVITY LOGS ====================

// @route   GET /api/admin/activity-logs
// @desc    Get activity logs
// @access  Admin
router.get('/activity-logs', async (req, res) => {
    try {
        const { page = 1, limit = 50, userId, action, startDate, endDate } = req.query;
        
        let query = {};
        
        if (userId) {
            query.user = userId;
        }
        
        if (action) {
            query.action = action;
        }
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }
        
        const logs = await ActivityLog.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const count = await ActivityLog.countDocuments(query);
        
        res.json({
            success: true,
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalLogs: count
        });
    } catch (error) {
        console.error('Get activity logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== APP SETTINGS ====================

// @route   GET /api/admin/settings
// @desc    Get app settings
// @access  Admin
router.get('/settings', async (req, res) => {
    try {
        const settings = await AppSettings.getSettings();
        
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/admin/settings
// @desc    Update app settings
// @access  Admin
router.put('/settings', async (req, res) => {
    try {
        let settings = await AppSettings.findOne();
        
        if (!settings) {
            settings = await AppSettings.create(req.body);
        } else {
            // Update settings
            Object.keys(req.body).forEach(key => {
                if (req.body[key] !== undefined) {
                    settings[key] = req.body[key];
                }
            });
            settings.updatedBy = req.user._id;
            await settings.save();
        }
        
        // Log activity
        await logActivity(req.user._id, 'settings_updated', 'AppSettings', settings._id, req.body, req);
        
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ==================== DASHBOARD STATS ====================

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true, isSuspended: false });
        const guestUsers = await User.countDocuments({ isGuest: true });
        const adminUsers = await User.countDocuments({ role: 'admin' });
        
        const totalTasks = await Task.countDocuments({ isArchived: false });
        const archivedTasks = await Task.countDocuments({ isArchived: true });
        const completedTasks = await Task.countDocuments({ progress: 100, isArchived: false });
        
        const totalComments = await Comment.countDocuments();
        const totalFiles = await File.countDocuments();
        
        // Recent activity (last 24 hours)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentActivity = await ActivityLog.countDocuments({
            createdAt: { $gte: yesterday }
        });
        
        res.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    guests: guestUsers,
                    admins: adminUsers
                },
                tasks: {
                    total: totalTasks,
                    archived: archivedTasks,
                    completed: completedTasks
                },
                content: {
                    comments: totalComments,
                    files: totalFiles
                },
                activity: {
                    last24Hours: recentActivity
                }
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;