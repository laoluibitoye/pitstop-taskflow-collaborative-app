require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const fileRoutes = require('./routes/files');
const adminRoutes = require('./routes/admin');
const sharingRoutes = require('./routes/sharing');

// Import models
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const User = require('./models/User');
const AppSettings = require('./models/AppSettings');
const { logActivity } = require('./middleware/activityLogger');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const PORT = process.env.PORT || 3000;

// ========================================
// Database Connection
// ========================================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow', {
    // useNewUrlParser: true, // Deprecated in MongoDB driver 4.0.0
    // useUnifiedTopology: true // Deprecated in MongoDB driver 4.0.0
})
.then(async () => {
    console.log('✅ MongoDB connected successfully');
    
    // Initialize default admin user if none exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
        await User.create({
            name: 'Admin',
            email: process.env.ADMIN_EMAIL || 'admin@taskflow.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@123',
            role: 'admin'
        });
        console.log('✅ Default admin user created');
    }
    
    // Initialize app settings if none exist
    await AppSettings.getSettings();
    console.log('✅ App settings initialized');
})
.catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// ========================================
// Middleware
// ========================================
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files from the client/dist directory
app.use(express.static(path.join(__dirname, 'client', 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Assuming uploads are still served statically

// Serve the client's index.html for all other routes to enable client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// ========================================
// API Routes
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/share', sharingRoutes);

// Public endpoint to get app settings
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await AppSettings.getSettings();
        res.json({
            success: true,
            settings: {
                appTitle: settings.appTitle,
                welcomeMessage: settings.welcomeMessage,
                heroTitle: settings.heroTitle,
                heroTagline: settings.heroTagline,
                theme: settings.theme,
                features: {
                    allowGuestUsers: settings.features.allowGuestUsers,
                    allowFileUploads: settings.features.allowFileUploads,
                    maxFileSize: settings.features.maxFileSize
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========================================
// Socket.io Real-time Features
// ========================================
const activeUsers = new Map(); // { socketId: { userId, name, joinedAt } }

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Handle user joining
    socket.on('join', async ({ token, guestName }) => {
        try {
            let user;
            
            if (token) {
                // Verify token and get user
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id).select('-password');
            }
            
            if (user) {
                activeUsers.set(socket.id, {
                    userId: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isGuest: user.isGuest,
                    joinedAt: Date.now()
                });
            } else if (guestName) {
                activeUsers.set(socket.id, {
                    userId: socket.id,
                    name: guestName,
                    isGuest: true,
                    joinedAt: Date.now()
                });
            }
            
            // Broadcast active users
            io.emit('activeUsers', Array.from(activeUsers.values()));
            
            console.log(`User joined: ${activeUsers.get(socket.id)?.name || 'Unknown'}`);
        } catch (error) {
            console.error('Join error:', error);
        }
    });
    
    // Handle requesting task list
    socket.on('requestTaskList', async ({ date, token }) => {
        try {
            if (!token) {
                return socket.emit('error', { message: 'Authentication required' });
            }
            
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            if (!user) {
                return socket.emit('error', { message: 'User not found' });
            }
            
            const tasks = await Task.find({ date, isArchived: false })
                .populate('createdBy', 'name email')
                .populate('assignedTo', 'name email')
                .populate('subTasks.createdBy', 'name')
                .populate('subTasks.completedBy', 'name')
                .sort({ createdAt: -1 });
            
            const tasksWithComments = await Promise.all(tasks.map(async (task) => {
                const comments = await Comment.find({ taskId: task._id })
                    .populate('author', 'name email')
                    .sort({ createdAt: 1 });
                
                return {
                    id: task._id,
                    text: task.text,
                    description: task.description,
                    progress: task.progress,
                    status: task.status,
                    category: task.category,
                    priority: task.priority,
                    deadline: task.deadline,
                    hasDeadline: task.hasDeadline,
                    hasSubTasks: task.hasSubTasks,
                    subTasks: task.subTasks,
                    assignedTo: task.assignedTo,
                    isOverdue: task.isOverdue,
                    createdBy: task.createdBy.name,
                    createdById: task.createdBy._id,
                    createdAt: task.createdAt,
                    completedAt: task.completedAt,
                    comments: comments.map(c => ({
                        id: c._id,
                        text: c.text,
                        author: c.author.name,
                        authorId: c.author._id,
                        timestamp: c.createdAt
                    }))
                };
            }));
            
            socket.emit('taskList', { date, tasks: tasksWithComments });
        } catch (error) {
            console.error('Request task list error:', error);
            socket.emit('error', { message: 'Failed to fetch tasks' });
        }
    });
    
    // Handle adding task
    socket.on('addTask', async ({ date, task, token }) => {
        try {
            if (!token) {
                return socket.emit('error', { message: 'Authentication required' });
            }
            
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            if (!user) {
                return socket.emit('error', { message: 'User not found' });
            }
            
            // Check guest limits
            if (user.isGuest && !user.canCreateTask()) {
                return socket.emit('guestLimitReached', {
                    type: 'task',
                    message: 'Guest users can only create 1 task. Please register to create more.'
                });
            }
            
            const taskData = {
                text: task.text,
                date,
                createdBy: user._id
            };
            
            // Add optional fields if provided
            if (task.description) taskData.description = task.description;
            if (task.deadline) {
                taskData.deadline = new Date(task.deadline);
                taskData.hasDeadline = true;
            }
            if (task.category) taskData.category = task.category;
            if (task.priority) taskData.priority = task.priority;
            if (task.tags) taskData.tags = task.tags;
            
            const newTask = await Task.create(taskData);
            
            // Increment guest task count
            if (user.isGuest) {
                user.guestLimits.tasksCreated += 1;
                await user.save();
            }
            
            // Log activity
            await logActivity(user._id, 'task_created', 'Task', newTask._id, { text: task.text, date });
            
            const populatedTask = await Task.findById(newTask._id)
                .populate('createdBy', 'name email')
                .populate('assignedTo', 'name email');
            
            // Broadcast to all users
            io.emit('taskAdded', {
                date,
                task: {
                    id: populatedTask._id,
                    text: populatedTask.text,
                    description: populatedTask.description,
                    progress: populatedTask.progress,
                    status: populatedTask.status,
                    category: populatedTask.category,
                    priority: populatedTask.priority,
                    deadline: populatedTask.deadline,
                    hasDeadline: populatedTask.hasDeadline,
                    hasSubTasks: populatedTask.hasSubTasks,
                    createdBy: populatedTask.createdBy.name,
                    createdById: populatedTask.createdBy._id,
                    createdAt: populatedTask.createdAt,
                    comments: []
                }
            });
        } catch (error) {
            console.error('Add task error:', error);
            socket.emit('error', { message: 'Failed to create task' });
        }
    });
    
    // Handle progress update
    socket.on('updateProgress', async ({ date, taskId, progress, token }) => {
        try {
            if (!token) {
                return socket.emit('error', { message: 'Authentication required' });
            }
            
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            const task = await Task.findById(taskId);
            if (task) {
                const oldProgress = task.progress;
                task.progress = Math.max(0, Math.min(100, progress));
                
                // Auto-complete task if progress reaches 100%
                if (task.progress === 100 && task.status !== 'completed') {
                    await task.changeStatus('completed', user._id);
                } else {
                    await task.save();
                }
                
                // Log activity
                await logActivity(user._id, 'progress_updated', 'Task', task._id, { oldProgress, newProgress: task.progress });
                
                // Broadcast to all users
                io.emit('progressUpdated', {
                    date,
                    taskId,
                    progress: task.progress,
                    status: task.status,
                    completedAt: task.completedAt
                });
            }
        } catch (error) {
            console.error('Update progress error:', error);
            socket.emit('error', { message: 'Failed to update progress' });
        }
    });
    
    // Handle adding comment
    socket.on('addComment', async ({ date, taskId, commentText, token }) => {
        try {
            if (!token) {
                return socket.emit('error', { message: 'Authentication required' });
            }
            
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            if (!user) {
                return socket.emit('error', { message: 'User not found' });
            }
            
            // Check guest limits
            if (user.isGuest && !user.canPostComment()) {
                return socket.emit('guestLimitReached', {
                    type: 'comment',
                    message: 'Guest users can only post 1 comment. Please register to post more.'
                });
            }
            
            const task = await Task.findById(taskId);
            if (task) {
                const newComment = await Comment.create({
                    text: commentText,
                    taskId: task._id,
                    author: user._id
                });
                
                // Increment guest comment count
                if (user.isGuest) {
                    user.guestLimits.commentsPosted += 1;
                    await user.save();
                }
                
                // Log activity
                await logActivity(user._id, 'comment_created', 'Comment', newComment._id, { taskId });
                
                const populatedComment = await Comment.findById(newComment._id).populate('author', 'name email');
                
                // Broadcast to all users
                io.emit('commentAdded', {
                    date,
                    taskId,
                    comment: {
                        id: populatedComment._id,
                        text: populatedComment.text,
                        author: populatedComment.author.name,
                        authorId: populatedComment.author._id,
                        timestamp: populatedComment.createdAt
                    }
                });
            }
        } catch (error) {
            console.error('Add comment error:', error);
            socket.emit('error', { message: 'Failed to add comment' });
        }
    });
    
    // Handle deleting task
    socket.on('deleteTask', async ({ date, taskId, token }) => {
        try {
            if (!token) {
                return socket.emit('error', { message: 'Authentication required' });
            }
            
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            const task = await Task.findById(taskId);
            
            if (task) {
                // Check if user is admin or task creator
                if (user.role === 'admin' || task.createdBy.toString() === user._id.toString()) {
                    // Delete associated comments
                    await Comment.deleteMany({ taskId: task._id });
                    await task.deleteOne();
                    
                    // Log activity
                    await logActivity(user._id, 'task_deleted', 'Task', task._id, { text: task.text });
                    
                    // Broadcast to all users
                    io.emit('taskDeleted', { date, taskId });
                } else {
                    socket.emit('error', { message: 'Not authorized to delete this task' });
                }
            }
        } catch (error) {
            console.error('Delete task error:', error);
            socket.emit('error', { message: 'Failed to delete task' });
        }
    });
    
    // Handle status change
    socket.on('changeStatus', async ({ date, taskId, status, token }) => {
        try {
            if (!token) {
                return socket.emit('error', { message: 'Authentication required' });
            }
            
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            const task = await Task.findById(taskId);
            if (task) {
                const oldStatus = task.status;
                await task.changeStatus(status, user._id);
                
                // Log activity
                await logActivity(user._id, 'task_updated', 'Task', task._id, { oldStatus, newStatus: status });
                
                // Broadcast to all users
                io.emit('statusChanged', {
                    date,
                    taskId,
                    status: task.status,
                    statusChangedAt: task.statusChangedAt,
                    completedAt: task.completedAt,
                    progress: task.progress
                });
            }
        } catch (error) {
            console.error('Change status error:', error);
            socket.emit('error', { message: 'Failed to change status' });
        }
    });
    
    // Handle adding sub-task
    socket.on('addSubTask', async ({ date, taskId, subTaskText, token }) => {
        try {
            if (!token) {
                return socket.emit('error', { message: 'Authentication required' });
            }
            
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            const task = await Task.findById(taskId);
            if (task) {
                const subTask = await task.addSubTask({
                    text: subTaskText,
                    createdBy: user._id
                });
                
                // Log activity
                await logActivity(user._id, 'task_updated', 'Task', task._id, { action: 'subtask_added', text: subTaskText });
                
                // Broadcast to all users
                io.emit('subTaskAdded', {
                    date,
                    taskId,
                    subTask,
                    hasSubTasks: task.hasSubTasks,
                    progress: task.progress
                });
            }
        } catch (error) {
            console.error('Add sub-task error:', error);
            socket.emit('error', { message: 'Failed to add sub-task' });
        }
    });
    
    // Handle completing sub-task
    socket.on('completeSubTask', async ({ date, taskId, subTaskId, token }) => {
        try {
            if (!token) {
                return socket.emit('error', { message: 'Authentication required' });
            }
            
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            const task = await Task.findById(taskId);
            if (task) {
                const subTask = await task.completeSubTask(subTaskId, user._id);
                
                if (subTask) {
                    // Log activity
                    await logActivity(user._id, 'task_updated', 'Task', task._id, { action: 'subtask_completed', subtaskId: subTaskId });
                    
                    // Broadcast to all users
                    io.emit('subTaskCompleted', {
                        date,
                        taskId,
                        subTaskId,
                        progress: task.progress,
                        subTasks: task.subTasks
                    });
                }
            }
        } catch (error) {
            console.error('Complete sub-task error:', error);
            socket.emit('error', { message: 'Failed to complete sub-task' });
        }
    });
    
    // Handle extending deadline
    socket.on('extendDeadline', async ({ date, taskId, extensionAmount, extensionUnit, reason, token }) => {
        try {
            if (!token) {
                return socket.emit('error', { message: 'Authentication required' });
            }
            
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            
            const task = await Task.findById(taskId);
            if (task) {
                await task.extendDeadline({
                    extensionAmount,
                    extensionUnit,
                    reason,
                    requestedBy: user._id
                });
                
                // Log activity
                await logActivity(user._id, 'task_updated', 'Task', task._id, {
                    action: 'deadline_extended',
                    extensionAmount,
                    extensionUnit
                });
                
                // Broadcast to all users
                io.emit('deadlineExtended', {
                    date,
                    taskId,
                    deadline: task.deadline,
                    timeExtensions: task.timeExtensions,
                    status: task.status
                });
            }
        } catch (error) {
            console.error('Extend deadline error:', error);
            socket.emit('error', { message: error.message || 'Failed to extend deadline' });
        }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        const user = activeUsers.get(socket.id);
        if (user) {
            console.log(`User disconnected: ${user.name}`);
            activeUsers.delete(socket.id);
            
            // Notify all users about active users
            io.emit('activeUsers', Array.from(activeUsers.values()));
        }
    });
});

// ========================================
// Error Handling
// ========================================
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ========================================
// Start Server
// ========================================
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    server.close(() => process.exit(1));
});