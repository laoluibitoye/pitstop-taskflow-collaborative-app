const mongoose = require('mongoose');

// Sub-task schema
const subTaskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Sub-task text is required'],
        trim: true,
        maxlength: [200, 'Sub-task text cannot exceed 200 characters']
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Time extension schema
const timeExtensionSchema = new mongoose.Schema({
    extensionAmount: {
        type: Number,
        required: true
    },
    extensionUnit: {
        type: String,
        enum: ['hours', 'days'],
        required: true
    },
    reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    previousDeadline: {
        type: Date,
        required: true
    },
    newDeadline: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const taskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Task text is required'],
        trim: true,
        maxlength: [200, 'Task text cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    date: {
        type: String,
        required: true,
        index: true
    },
    deadline: {
        type: Date,
        index: true
    },
    hasDeadline: {
        type: Boolean,
        default: false
    },
    timeExtensions: [timeExtensionSchema],
    originalDeadline: {
        type: Date
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed', 'delayed', 'cancelled'],
        default: 'ongoing',
        index: true
    },
    statusChangedAt: {
        type: Date
    },
    statusChangedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    category: {
        type: String,
        trim: true,
        maxlength: [50, 'Category cannot exceed 50 characters'],
        index: true
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium',
        index: true
    },
    subTasks: [subTaskSchema],
    hasSubTasks: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isArchived: {
        type: Boolean,
        default: false
    },
    archivedAt: {
        type: Date
    },
    archivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    completedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
taskSchema.index({ date: 1, createdAt: -1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ status: 1, deadline: 1 });
taskSchema.index({ category: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ priority: 1, deadline: 1 });

// Virtual to check if task is overdue
taskSchema.virtual('isOverdue').get(function() {
    if (!this.deadline || this.status === 'completed' || this.status === 'cancelled') {
        return false;
    }
    return new Date() > this.deadline;
});

// Method to add sub-task
taskSchema.methods.addSubTask = async function(subTaskData) {
    this.subTasks.push(subTaskData);
    this.hasSubTasks = true;
    await this.save();
    return this.subTasks[this.subTasks.length - 1];
};

// Method to complete sub-task
taskSchema.methods.completeSubTask = async function(subTaskId, userId) {
    const subTask = this.subTasks.id(subTaskId);
    if (subTask) {
        subTask.isCompleted = true;
        subTask.completedAt = new Date();
        subTask.completedBy = userId;
        
        // Update main task progress based on completed sub-tasks
        this.updateProgressFromSubTasks();
        
        await this.save();
        return subTask;
    }
    return null;
};

// Method to update progress based on sub-tasks
taskSchema.methods.updateProgressFromSubTasks = function() {
    if (this.subTasks.length > 0) {
        const completedCount = this.subTasks.filter(st => st.isCompleted).length;
        this.progress = Math.round((completedCount / this.subTasks.length) * 100);
    }
};

// Method to add time extension
taskSchema.methods.extendDeadline = async function(extensionData) {
    if (!this.deadline) {
        throw new Error('Cannot extend deadline for task without a deadline');
    }
    
    const previousDeadline = this.deadline;
    
    // Calculate new deadline
    let extensionMs = 0;
    if (extensionData.extensionUnit === 'hours') {
        extensionMs = extensionData.extensionAmount * 60 * 60 * 1000;
    } else if (extensionData.extensionUnit === 'days') {
        extensionMs = extensionData.extensionAmount * 24 * 60 * 60 * 1000;
    }
    
    const newDeadline = new Date(this.deadline.getTime() + extensionMs);
    
    // Store original deadline if this is the first extension
    if (!this.originalDeadline) {
        this.originalDeadline = this.deadline;
    }
    
    // Add extension record
    this.timeExtensions.push({
        extensionAmount: extensionData.extensionAmount,
        extensionUnit: extensionData.extensionUnit,
        reason: extensionData.reason,
        requestedBy: extensionData.requestedBy,
        previousDeadline: previousDeadline,
        newDeadline: newDeadline
    });
    
    // Update deadline
    this.deadline = newDeadline;
    
    // If task was delayed and deadline is extended beyond current time, set back to ongoing
    if (this.status === 'delayed' && newDeadline > new Date()) {
        this.status = 'ongoing';
        this.statusChangedAt = new Date();
        this.statusChangedBy = extensionData.requestedBy;
    }
    
    await this.save();
    return this;
};

// Method to change status
taskSchema.methods.changeStatus = async function(newStatus, userId) {
    this.status = newStatus;
    this.statusChangedAt = new Date();
    this.statusChangedBy = userId;
    
    if (newStatus === 'completed') {
        this.completedAt = new Date();
        this.progress = 100;
    }
    
    await this.save();
    return this;
};

// Static method to get tasks by category
taskSchema.statics.getByCategory = async function(category, filters = {}) {
    const query = { category, isArchived: false, ...filters };
    return this.find(query)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });
};

// Static method to get overdue tasks
taskSchema.statics.getOverdue = async function() {
    return this.find({
        deadline: { $lt: new Date() },
        status: { $in: ['ongoing', 'delayed'] },
        isArchived: false
    })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .sort({ deadline: 1 });
};

// Static method to get tasks by status
taskSchema.statics.getByStatus = async function(status, filters = {}) {
    const query = { status, isArchived: false, ...filters };
    return this.find(query)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });
};

// Pre-save middleware to auto-update status based on deadline
taskSchema.pre('save', function(next) {
    // Auto-mark as delayed if past deadline and not completed/cancelled
    if (this.deadline && 
        new Date() > this.deadline && 
        this.status === 'ongoing') {
        this.status = 'delayed';
        this.statusChangedAt = new Date();
    }
    
    // Update hasSubTasks flag
    this.hasSubTasks = this.subTasks.length > 0;
    
    next();
});

module.exports = mongoose.model('Task', taskSchema);