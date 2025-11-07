const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'user_registered',
            'user_login',
            'user_logout',
            'guest_joined',
            'guest_converted',
            'task_created',
            'task_updated',
            'task_deleted',
            'task_archived',
            'comment_created',
            'comment_deleted',
            'file_uploaded',
            'file_deleted',
            'progress_updated',
            'user_suspended',
            'user_activated',
            'role_changed',
            'settings_updated'
        ]
    },
    targetType: {
        type: String,
        enum: ['Task', 'Comment', 'File', 'User', 'AppSettings']
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false
});

// Indexes for efficient queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ targetType: 1, targetId: 1 });

// TTL index to auto-delete logs older than 90 days (optional)
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);