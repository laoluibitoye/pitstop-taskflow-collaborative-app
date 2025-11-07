const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
    appTitle: {
        type: String,
        default: 'TaskFlow'
    },
    welcomeMessage: {
        type: String,
        default: 'Welcome to TaskFlow!'
    },
    heroTitle: {
        type: String,
        default: 'Collaborate in Real-Time'
    },
    heroTagline: {
        type: String,
        default: 'Manage tasks together with your team, track progress instantly, and achieve more with seamless collaboration.'
    },
    theme: {
        primaryColor: {
            type: String,
            default: '#6366f1'
        },
        secondaryColor: {
            type: String,
            default: '#ec4899'
        },
        successColor: {
            type: String,
            default: '#10b981'
        },
        warningColor: {
            type: String,
            default: '#f59e0b'
        },
        dangerColor: {
            type: String,
            default: '#ef4444'
        }
    },
    features: {
        allowGuestUsers: {
            type: Boolean,
            default: true
        },
        allowFileUploads: {
            type: Boolean,
            default: true
        },
        maxFileSize: {
            type: Number,
            default: 5242880 // 5MB
        },
        allowedFileTypes: {
            type: [String],
            default: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        },
        guestTaskLimit: {
            type: Number,
            default: 1
        },
        guestCommentLimit: {
            type: Number,
            default: 1
        },
        enableRealTimeSync: {
            type: Boolean,
            default: true
        },
        enableActivityLogs: {
            type: Boolean,
            default: true
        }
    },
    maintenance: {
        enabled: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: 'The application is currently under maintenance. Please check back later.'
        }
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
appSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('AppSettings', appSettingsSchema);