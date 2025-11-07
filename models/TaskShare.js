const mongoose = require('mongoose');
const crypto = require('crypto');

const taskShareSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
        index: true
    },
    shareToken: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    shareUrl: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    permissions: {
        canView: {
            type: Boolean,
            default: true
        },
        canComment: {
            type: Boolean,
            default: false
        },
        canEdit: {
            type: Boolean,
            default: false
        },
        canUpdateProgress: {
            type: Boolean,
            default: false
        },
        canAddSubTasks: {
            type: Boolean,
            default: false
        },
        canUploadFiles: {
            type: Boolean,
            default: false
        }
    },
    invitedUsers: [{
        email: {
            type: String,
            lowercase: true
        },
        name: String,
        invitedAt: {
            type: Date,
            default: Date.now
        },
        acceptedAt: Date,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    accessLog: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        guestName: String,
        accessedAt: {
            type: Date,
            default: Date.now
        },
        ipAddress: String
    }],
    expiresAt: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    maxAccess: {
        type: Number,
        default: null
    },
    accessCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generate unique share token
taskShareSchema.statics.generateShareToken = function() {
    return crypto.randomBytes(16).toString('hex');
};

// Create shareable link
taskShareSchema.statics.createShareLink = async function(taskId, userId, permissions, options = {}) {
    const shareToken = this.generateShareToken();
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/shared/${shareToken}`;
    
    const share = await this.create({
        task: taskId,
        shareToken,
        shareUrl,
        createdBy: userId,
        permissions,
        expiresAt: options.expiresAt,
        maxAccess: options.maxAccess
    });
    
    return share;
};

// Log access to shared task
taskShareSchema.methods.logAccess = async function(userId, guestName, ipAddress) {
    this.accessLog.push({
        userId,
        guestName,
        ipAddress,
        accessedAt: new Date()
    });
    this.accessCount += 1;
    await this.save();
};

// Check if share link is still valid
taskShareSchema.methods.isValid = function() {
    if (!this.isActive) return false;
    if (this.expiresAt && new Date() > this.expiresAt) return false;
    if (this.maxAccess && this.accessCount >= this.maxAccess) return false;
    return true;
};

// Index for cleanup of expired links
taskShareSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TaskShare', taskShareSchema);